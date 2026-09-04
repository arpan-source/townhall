import { useEffect, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/ui/PageHeader";

import { getExecutiveCampaignPerformance } from "../../services/campaignService";

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-01`;
}

function getMonthOptions() {
  const options = [];
  const now = new Date();

  for (let i = -2; i <= 10; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);

    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-01`;

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

export default function CampaignPerformance() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const [teamMemberFilter, setTeamMemberFilter] = useState(null);

  const [clientFilter, setClientFilter] = useState(null);

  const [campaignFilter, setCampaignFilter] = useState(null);

  const [statusFilter, setStatusFilter] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCampaignPerformance() {
    try {
      setLoading(true);
      setError("");

      const data = await getExecutiveCampaignPerformance(selectedMonth);

      setCampaigns(data || []);
    } catch (err) {
      console.error("Campaign performance error:", err);

      setError(err.message || "Failed to load campaign performance.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaignPerformance();
  }, [selectedMonth]);

  const teamMemberOptions = [
  ...new Map(
    campaigns.map((campaign) => [
      campaign.teamMember,
      {
        value: campaign.teamMember,
        label: campaign.teamMember,
      },
    ])
  ).values(),
];

const clientOptions = [
  ...new Map(
    campaigns.map((campaign) => [
      campaign.clientName,
      {
        value: campaign.clientName,
        label: campaign.clientName,
      },
    ])
  ).values(),
];

const campaignOptions = [
  ...new Map(
    campaigns.map((campaign) => [
      campaign.id,
      {
        value: campaign.id,
        label: campaign.name,
      },
    ])
  ).values(),
];

const statusOptions = [
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "ON TRACK",
    label: "On Track",
  },
  {
    value: "AT RISK",
    label: "At Risk",
  },
  {
    value: "BEHIND",
    label: "Behind",
  },
];

const filteredCampaigns = campaigns.filter(
  (campaign) => {
    if (
      teamMemberFilter &&
      campaign.teamMember !== teamMemberFilter
    ) {
      return false;
    }

    if (
      clientFilter &&
      campaign.clientName !== clientFilter
    ) {
      return false;
    }

    if (
      campaignFilter &&
      campaign.id !== campaignFilter
    ) {
      return false;
    }

    if (
      statusFilter &&
      campaign.status !== statusFilter
    ) {
      return false;
    }

    return true;
  }
);

  const totalTarget = filteredCampaigns.reduce(
    (sum, campaign) => sum + campaign.monthlyTarget,
    0,
  );

  const meetingsCompleted = filteredCampaigns.reduce(
    (sum, campaign) => sum + campaign.meetingsCompleted,
    0,
  );

  const meetingsLinedUp = filteredCampaigns.reduce(
    (sum, campaign) => sum + campaign.meetingsLinedUp,
    0,
  );

  const overallAchievement =
    totalTarget > 0 ? Math.round((meetingsCompleted / totalTarget) * 100) : 0;

  const overallPotential =
    totalTarget > 0
      ? Math.round(((meetingsCompleted + meetingsLinedUp) / totalTarget) * 100)
      : 0;

  return (
    <AppLayout
      sidebarItems={[
        {
          label: "Executive Dashboard",
          path: "/executive",
        },
        {
          label: "Campaign Performance",
          path: "/executive/campaigns",
        },
        {
          label: "Departments",
          path: "/executive/departments",
        },
        {
          label: "Reports",
          path: "/executive/reports",
        },
        {
          label: "User Management",
          path: "/executive/users",
        },
      ]}
    >
      <PageHeader
        title="Campaign Performance"
        subtitle="Company-wide campaign and sales performance."
      />

      <Stack gap="lg" mt="xl">
        {/* FILTER */}

        <Group
  justify="space-between"
  align="flex-end"
  wrap="wrap"
>
  <Group align="flex-end" wrap="wrap">

    <Select
      label="Month"
      value={selectedMonth}
      onChange={(value) => {
        if (value) {
          setSelectedMonth(value);
        }
      }}
      data={getMonthOptions()}
      allowDeselect={false}
      w={170}
    />

    <Select
      label="Team Member"
      placeholder="All team members"
      value={teamMemberFilter}
      onChange={setTeamMemberFilter}
      data={teamMemberOptions}
      clearable
      w={180}
    />

    <Select
      label="Client"
      placeholder="All clients"
      value={clientFilter}
      onChange={setClientFilter}
      data={clientOptions}
      clearable
      w={180}
    />

    <Select
      label="Campaign"
      placeholder="All campaigns"
      value={campaignFilter}
      onChange={setCampaignFilter}
      data={campaignOptions}
      clearable
      w={200}
    />

    <Select
      label="Status"
      placeholder="All statuses"
      value={statusFilter}
      onChange={setStatusFilter}
      data={statusOptions}
      clearable
      w={160}
    />

    <Button
      variant="light"
      onClick={() => {
        setTeamMemberFilter(null);
        setClientFilter(null);
        setCampaignFilter(null);
        setStatusFilter(null);
      }}
    >
      Clear Filters
    </Button>

  </Group>
</Group>

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        {loading ? (
          <Stack align="center" py="xl">
            <Loader size="sm" />
          </Stack>
        ) : (
          <>
            {/* KPI CARDS */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
              <Card withBorder>
                <Text size="sm" c="dimmed">
                  Total Campaigns
                </Text>

                <Text fw={700} size="xl">
                  {filteredCampaigns.length}
                </Text>
              </Card>

              <Card withBorder>
                <Text size="sm" c="dimmed">
                  Total Target
                </Text>

                <Text fw={700} size="xl">
                  {totalTarget}
                </Text>
              </Card>

              <Card withBorder>
                <Text size="sm" c="dimmed">
                  Meetings Completed
                </Text>

                <Text fw={700} size="xl">
                  {meetingsCompleted}
                </Text>
              </Card>

              <Card withBorder>
                <Text size="sm" c="dimmed">
                  Meetings Lined Up
                </Text>

                <Text fw={700} size="xl">
                  {meetingsLinedUp}
                </Text>
              </Card>

              <Card withBorder>
                <Text size="sm" c="dimmed">
                  Achievement
                </Text>

                <Text fw={700} size="xl">
                  {overallAchievement}%
                </Text>
              </Card>

              <Card withBorder>
                <Text size="sm" c="dimmed">
                  Potential Achievement
                </Text>

                <Text fw={700} size="xl">
                  {overallPotential}%
                </Text>
              </Card>
            </div>

            {/* PERFORMANCE TABLE */}

            <Card withBorder radius="md" p="lg">
              <Group mb="md">
                <div>
                  <Text fw={600}>Campaign Performance</Text>

                  <Text size="sm" c="dimmed">
                    {new Date(`${selectedMonth}T00:00:00`).toLocaleDateString(
                      "en-IN",
                      {
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </Text>
                </div>
              </Group>

              {filteredCampaigns.length === 0 ? (
  <Text c="dimmed">
    No campaign performance data available.
  </Text>
) : (
                <Table highlightOnHover withTableBorder verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Team Member</Table.Th>

                      <Table.Th>Campaign</Table.Th>

                      <Table.Th>Client</Table.Th>

                      <Table.Th>Monthly Target</Table.Th>

                      <Table.Th>Completed</Table.Th>

                      <Table.Th>Lined Up</Table.Th>

                      <Table.Th>Achievement</Table.Th>

                      <Table.Th>Potential</Table.Th>

                      <Table.Th>Days Left</Table.Th>

                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {filteredCampaigns.map((campaign) => (
                      <Table.Tr key={campaign.id}>
                        <Table.Td>
                          <Text fw={500}>{campaign.teamMember}</Text>
                        </Table.Td>

                        <Table.Td>{campaign.name}</Table.Td>

                        <Table.Td>{campaign.clientName}</Table.Td>

                        <Table.Td>{campaign.monthlyTarget}</Table.Td>

                        <Table.Td>{campaign.meetingsCompleted}</Table.Td>

                        <Table.Td>{campaign.meetingsLinedUp}</Table.Td>

                        <Table.Td>{campaign.achievement}%</Table.Td>

                        <Table.Td>{campaign.potentialAchievement}%</Table.Td>

                        <Table.Td>{campaign.daysRemaining}</Table.Td>

                        <Table.Td>
                          <Badge color={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Card>
          </>
        )}
      </Stack>
    </AppLayout>
  );
}
