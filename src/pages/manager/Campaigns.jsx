import { useEffect, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import {
  IconCalendar,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconPlus,
  IconTargetArrow,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

import {
  createCampaign,
  getMyCampaignsWithPerformance,
} from "../../services/campaignService";

import CampaignKPI from "../../components/manager/campaign/CampaignKPI";
import PerformanceDrawer from "../../components/manager/campaign/PerformanceDrawer";

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}-01`;
}

function getMonthOptions() {
  const options = [];
  const now = new Date();

  for (let i = -2; i <= 10; i++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() + i,
      1,
    );

    const value = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-01`;

    options.push({
      value,
      label: date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    });
  }

  return options;
}

function formatMonth(month) {
  return new Date(`${month}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    },
  );
}

function getStatusColor(status) {
  switch (status) {
    case "COMPLETED":
      return "green";

    case "ON TRACK":
      return "blue";

    case "AT RISK":
      return "yellow";

    case "BEHIND":
      return "red";

    default:
      return "gray";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "COMPLETED":
      return <IconCircleCheck size={14} />;

    case "ON TRACK":
      return <IconTrendingUp size={14} />;

    case "AT RISK":
      return <IconClock size={14} />;

    default:
      return null;
  }
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);

  const [selectedMonth, setSelectedMonth] =
    useState(getCurrentMonth());

  const monthOptions = getMonthOptions();

  const [loading, setLoading] = useState(true);

  const [modalOpened, setModalOpened] =
    useState(false);

  const [campaignName, setCampaignName] =
    useState("");

  const [clientName, setClientName] =
    useState("");

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [performanceOpened, setPerformanceOpened] =
    useState(false);

  const [selectedCampaign, setSelectedCampaign] =
    useState(null);

  async function loadCampaigns() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getMyCampaignsWithPerformance(
          selectedMonth,
        );

      setCampaigns(data);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load campaigns.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, [selectedMonth]);

  function openCreateModal() {
    setCampaignName("");
    setClientName("");
    setError("");
    setSuccess("");
    setModalOpened(true);
  }

  function openPerformance(campaign) {
    setSelectedCampaign(campaign);
    setPerformanceOpened(true);
  }

  function closePerformance() {
    setPerformanceOpened(false);
    setSelectedCampaign(null);
  }

  async function handleCreateCampaign() {
    if (!campaignName.trim()) {
      setError("Campaign name is required.");
      return;
    }

    if (!clientName.trim()) {
      setError("Client name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createCampaign({
        name: campaignName.trim(),
        clientName: clientName.trim(),
      });

      setSuccess(
        "Campaign created successfully.",
      );

      setModalOpened(false);

      await loadCampaigns();
    } catch (err) {
      setError(
        err.message ||
          "Failed to create campaign.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * -------------------------------------------------------
   * Aggregate KPI metrics
   * -------------------------------------------------------
   */

  const totalMetrics = campaigns.reduce(
    (acc, campaign) => {
      acc.monthlyTarget +=
        campaign.metrics.monthlyTarget;

      acc.meetingsCompleted +=
        campaign.metrics.meetingsCompleted;

      acc.meetingsLinedUp +=
        campaign.metrics.meetingsLinedUp;

      acc.positiveLeads +=
        campaign.metrics.positiveLeads;

      return acc;
    },
    {
      monthlyTarget: 0,
      meetingsCompleted: 0,
      meetingsLinedUp: 0,
      positiveLeads: 0,
    },
  );

  const daysRemaining =
    campaigns.length > 0
      ? Math.min(
          ...campaigns.map(
            (campaign) =>
              campaign.metrics.daysRemaining,
          ),
        )
      : 0;

  const overallAchievement =
    totalMetrics.monthlyTarget > 0
      ? Math.round(
          (totalMetrics.meetingsCompleted /
            totalMetrics.monthlyTarget) *
            100,
        )
      : 0;

  const overallPotentialAchievement =
    totalMetrics.monthlyTarget > 0
      ? Math.round(
          ((totalMetrics.meetingsCompleted +
            totalMetrics.meetingsLinedUp) /
            totalMetrics.monthlyTarget) *
            100,
        )
      : 0;

  const completedCampaigns = campaigns.filter(
    (campaign) =>
      campaign.metrics.status === "COMPLETED",
  ).length;

  const atRiskCampaigns = campaigns.filter(
    (campaign) =>
      campaign.metrics.status === "AT RISK" ||
      campaign.metrics.status === "BEHIND",
  ).length;

  return (
    <Stack gap="xl">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <Group
        justify="space-between"
        align="flex-end"
      >
        <div>
          <Group gap="sm" mb={6}>
            <IconTargetArrow size={24} />

            <Title order={2}>
              Campaign Performance
            </Title>
          </Group>

          <Text
            c="dimmed"
            size="sm"
          >
            Track calling activity, meetings,
            leads and campaign achievement.
          </Text>
        </div>

        <Group gap="sm">
          <Select
            leftSection={
              <IconCalendar size={16} />
            }
            value={selectedMonth}
            onChange={(value) => {
              if (value) {
                setSelectedMonth(value);
              }
            }}
            data={monthOptions}
            allowDeselect={false}
            w={190}
          />

          <Button
            leftSection={
              <IconPlus size={16} />
            }
            onClick={openCreateModal}
          >
            Create Campaign
          </Button>
        </Group>
      </Group>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <Alert
          color="red"
          title="Unable to complete request"
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          color="green"
          title="Success"
        >
          {success}
        </Alert>
      )}

      {/* =====================================================
          MONTH CONTEXT
      ===================================================== */}

      <Card
        withBorder
        radius="md"
        p="md"
      >
        <Group
          justify="space-between"
        >
          <Group gap="sm">
            <IconCalendar
              size={20}
            />

            <div>
              <Text
                size="sm"
                fw={600}
              >
                Performance Period
              </Text>

              <Text
                size="xs"
                c="dimmed"
              >
                Showing campaign activity
                for {formatMonth(selectedMonth)}
              </Text>
            </div>
          </Group>

          <Badge
            size="lg"
            variant="light"
          >
            {campaigns.length}{" "}
            {campaigns.length === 1
              ? "Campaign"
              : "Campaigns"}
          </Badge>
        </Group>
      </Card>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      {loading ? (
        <Grid>
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <Grid.Col
                key={index}
                span={{
                  base: 12,
                  xs: 6,
                  md: 4,
                  lg: 2,
                }}
              >
                <Card
                  withBorder
                  radius="md"
                  p="lg"
                >
                  <Skeleton
                    height={14}
                    width="55%"
                    mb="md"
                  />

                  <Skeleton
                    height={28}
                    width="70%"
                  />
                </Card>
              </Grid.Col>
            ),
          )}
        </Grid>
      ) : (
        <CampaignKPI
          metrics={{
            ...totalMetrics,
            achievement:
              overallAchievement,
            potentialAchievement:
              overallPotentialAchievement,
            daysRemaining,
          }}
        />
      )}

      {/* =====================================================
          PERFORMANCE SNAPSHOT
      ===================================================== */}

      {!loading && campaigns.length > 0 && (
        <Card
          withBorder
          radius="md"
          p="lg"
        >
          <Group
            justify="space-between"
            mb="lg"
          >
            <div>
              <Text
                fw={600}
                size="md"
              >
                Performance Snapshot
              </Text>

              <Text
                size="sm"
                c="dimmed"
                mt={3}
              >
                Current campaign health for{" "}
                {formatMonth(selectedMonth)}
              </Text>
            </div>

            <Badge
              variant="light"
              size="lg"
            >
              {overallAchievement}% achieved
            </Badge>
          </Group>

          <Grid>
            <Grid.Col
              span={{
                base: 12,
                sm: 4,
              }}
            >
              <Card
                withBorder
                radius="sm"
                p="md"
              >
                <Group gap="sm">
                  <IconCircleCheck
                    size={20}
                  />

                  <div>
                    <Text
                      size="xs"
                      c="dimmed"
                    >
                      Completed Campaigns
                    </Text>

                    <Text
                      size="lg"
                      fw={700}
                    >
                      {completedCampaigns}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>

            <Grid.Col
              span={{
                base: 12,
                sm: 4,
              }}
            >
              <Card
                withBorder
                radius="sm"
                p="md"
              >
                <Group gap="sm">
                  <IconUsers
                    size={20}
                  />

                  <div>
                    <Text
                      size="xs"
                      c="dimmed"
                    >
                      Positive Leads
                    </Text>

                    <Text
                      size="lg"
                      fw={700}
                    >
                      {totalMetrics.positiveLeads}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>

            <Grid.Col
              span={{
                base: 12,
                sm: 4,
              }}
            >
              <Card
                withBorder
                radius="sm"
                p="md"
              >
                <Group gap="sm">
                  <IconClock
                    size={20}
                  />

                  <div>
                    <Text
                      size="xs"
                      c="dimmed"
                    >
                      Needs Attention
                    </Text>

                    <Text
                      size="lg"
                      fw={700}
                    >
                      {atRiskCampaigns}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        </Card>
      )}

      {/* =====================================================
          CAMPAIGN TABLE
      ===================================================== */}

      <Card
        withBorder
        radius="md"
        p={0}
        style={{
          overflow: "hidden",
        }}
      >
        <Group
          justify="space-between"
          p="lg"
          pb="md"
        >
          <div>
            <Group gap="sm">
              <IconTargetArrow
                size={20}
              />

              <Text
                fw={600}
              >
                My Campaigns
              </Text>
            </Group>

            <Text
              size="sm"
              c="dimmed"
              mt={4}
            >
              Campaign-level performance
              and current status.
            </Text>
          </div>

          {!loading && campaigns.length > 0 && (
            <Badge
              variant="light"
            >
              {campaigns.length} active
            </Badge>
          )}
        </Group>

        {loading ? (
          <Stack
            p="lg"
            gap="sm"
          >
            <Skeleton height={42} />
            <Skeleton height={42} />
            <Skeleton height={42} />
          </Stack>
        ) : campaigns.length === 0 ? (
          <Stack
            align="center"
            py={60}
            px="lg"
          >
            <IconTargetArrow
              size={42}
              stroke={1.5}
            />

            <Text
              fw={600}
              mt="sm"
            >
              No campaigns found
            </Text>

            <Text
              size="sm"
              c="dimmed"
              ta="center"
            >
              There are no campaigns for{" "}
              {formatMonth(selectedMonth)}.
              Create a campaign to start
              tracking performance.
            </Text>

            <Button
              mt="sm"
              leftSection={
                <IconPlus size={16} />
              }
              onClick={
                openCreateModal
              }
            >
              Create Campaign
            </Button>
          </Stack>
        ) : (
          <Table
            highlightOnHover
            verticalSpacing="md"
            horizontalSpacing="lg"
            withColumnBorders={false}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  Campaign
                </Table.Th>

                <Table.Th>
                  Client
                </Table.Th>

                <Table.Th>
                  Target
                </Table.Th>

                <Table.Th>
                  Completed
                </Table.Th>

                <Table.Th>
                  Lined Up
                </Table.Th>

                <Table.Th>
                  Achievement
                </Table.Th>

                <Table.Th>
                  Potential
                </Table.Th>

                <Table.Th>
                  Leads
                </Table.Th>

                <Table.Th>
                  Days Left
                </Table.Th>

                <Table.Th>
                  Status
                </Table.Th>

                <Table.Th>
                  Action
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {campaigns.map(
                (campaign) => (
                  <Table.Tr
                    key={campaign.id}
                  >
                    <Table.Td>
                      <Text
                        fw={600}
                        size="sm"
                      >
                        {campaign.name}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm">
                        {campaign.client_name}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text
                        size="sm"
                        fw={500}
                      >
                        {
                          campaign
                            .metrics
                            .monthlyTarget
                        }
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text
                        size="sm"
                        fw={500}
                      >
                        {
                          campaign
                            .metrics
                            .meetingsCompleted
                        }
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm">
                        {
                          campaign
                            .metrics
                            .meetingsLinedUp
                        }
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text
                        size="sm"
                        fw={600}
                      >
                        {
                          campaign
                            .metrics
                            .achievement
                        }
                        %
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text
                        size="sm"
                        fw={500}
                      >
                        {
                          campaign
                            .metrics
                            .potentialAchievement
                        }
                        %
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Group
                        gap={5}
                        wrap="nowrap"
                      >
                        <IconUsers
                          size={15}
                        />

                        <Text size="sm">
                          {
                            campaign
                              .metrics
                              .positiveLeads
                          }
                        </Text>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Text
                        size="sm"
                        fw={500}
                      >
                        {
                          campaign
                            .metrics
                            .daysRemaining
                        }
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        color={getStatusColor(
                          campaign
                            .metrics
                            .status,
                        )}
                        variant="light"
                        leftSection={getStatusIcon(
                          campaign
                            .metrics
                            .status,
                        )}
                      >
                        {
                          campaign
                            .metrics
                            .status
                        }
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Button
                        size="xs"
                        variant="light"
                        rightSection={
                          <IconChevronRight
                            size={14}
                          />
                        }
                        onClick={() =>
                          openPerformance(
                            campaign,
                          )
                        }
                      >
                        Update
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ),
              )}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* =====================================================
          CREATE CAMPAIGN MODAL
      ===================================================== */}

      <Modal
        opened={modalOpened}
        onClose={() =>
          setModalOpened(false)
        }
        title="Create Campaign"
        centered
        radius="md"
      >
        <Stack gap="md">
          <Text
            size="sm"
            c="dimmed"
          >
            Add a campaign to start
            tracking its monthly
            performance.
          </Text>

          <TextInput
            label="Campaign Name"
            placeholder="e.g. LinkedIn Lead Generation"
            value={campaignName}
            onChange={(event) =>
              setCampaignName(
                event.currentTarget
                  .value,
              )
            }
            required
          />

          <TextInput
            label="Client"
            placeholder="e.g. ABC Technologies"
            value={clientName}
            onChange={(event) =>
              setClientName(
                event.currentTarget
                  .value,
              )
            }
            required
          />

          <Group
            justify="flex-end"
            mt="sm"
          >
            <Button
              variant="default"
              onClick={() =>
                setModalOpened(false)
              }
            >
              Cancel
            </Button>

            <Button
              loading={saving}
              onClick={
                handleCreateCampaign
              }
            >
              Create Campaign
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* =====================================================
          PERFORMANCE DRAWER
      ===================================================== */}

      <PerformanceDrawer
        opened={performanceOpened}
        onClose={closePerformance}
        campaign={selectedCampaign}
        onSaved={loadCampaigns}
      />
    </Stack>
  );
}