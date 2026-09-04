import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";

import {
  getCampaignPerformance,
  upsertCampaignPerformance,
  buildCampaignMetrics,
} from "../../../services/campaignService";

import CampaignUpload from "./CampaignUpload";


function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-01`;
}


function generateMonthOptions() {
  const options = [];
  const now = new Date();

  for (let i = -2; i <= 10; i++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() + i,
      1
    );

    const value = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-01`;

    const label = date.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

    options.push({
      value,
      label,
    });
  }

  return options;
}


function MetricCard({ label, value }) {
  return (
    <Card withBorder radius="md" p="sm">
      <Text size="xs" c="dimmed">
        {label}
      </Text>

      <Text fw={700} size="lg">
        {value}
      </Text>
    </Card>
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


export default function PerformanceDrawer({
  opened,
  onClose,
  campaign,
  onSaved,
}) {
  const [month, setMonth] =
    useState(getCurrentMonth());

  const [
    monthlyTarget,
    setMonthlyTarget,
  ] = useState(0);

  const [
    meetingsCompleted,
    setMeetingsCompleted,
  ] = useState(0);

  const [
    meetingsLinedUp,
    setMeetingsLinedUp,
  ] = useState(0);

  const [performance, setPerformance] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  const monthOptions = useMemo(
    () => generateMonthOptions(),
    []
  );


  async function loadPerformance() {
    if (!campaign) return;

    try {
      setLoading(true);
      setError("");

      const existingPerformance =
        await getCampaignPerformance(
          campaign.id,
          month
        );

      setPerformance(
        existingPerformance
      );

      if (existingPerformance) {
        setMonthlyTarget(
          existingPerformance.monthly_target
        );

        setMeetingsCompleted(
          existingPerformance.meetings_completed
        );

        setMeetingsLinedUp(
          existingPerformance.meetings_lined_up
        );
      } else {
        setPerformance(null);

        setMonthlyTarget(0);
        setMeetingsCompleted(0);
        setMeetingsLinedUp(0);
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to load performance."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if (!opened || !campaign) return;

    loadPerformance();
  }, [opened, campaign, month]);


  async function handleSave() {
    if (!campaign) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const savedPerformance =
        await upsertCampaignPerformance({
          campaignId: campaign.id,
          month,
          monthlyTarget,
          meetingsCompleted,
          meetingsLinedUp,
          positiveLeadsCount:
            performance?.positive_leads_count ||
            0,
        });

      setPerformance(
        savedPerformance
      );

      setSuccess(
        "Campaign performance updated successfully."
      );

      onSaved?.();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update performance."
      );
    } finally {
      setSaving(false);
    }
  }


  function handleUploadComplete(
    updatedPerformance
  ) {
    setPerformance(
      updatedPerformance
    );

    setSuccess(
      "Positive leads updated successfully."
    );

    onSaved?.();
  }


  const metrics = buildCampaignMetrics(
    performance
      ? {
          ...performance,
          monthly_target:
            monthlyTarget,
          meetings_completed:
            meetingsCompleted,
          meetings_lined_up:
            meetingsLinedUp,
        }
      : {
          month,
          monthly_target:
            monthlyTarget,
          meetings_completed:
            meetingsCompleted,
          meetings_lined_up:
            meetingsLinedUp,
          positive_leads_count: 0,
        }
  );


  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="xl"
      title="Update Campaign Performance"
    >
      <Stack>

        {/* Campaign */}

        {campaign && (
          <div>
            <Text fw={700}>
              {campaign.name}
            </Text>

            <Text
              size="sm"
              c="dimmed"
            >
              {campaign.client_name}
            </Text>
          </div>
        )}


        {/* Alerts */}

        {error && (
          <Alert
            color="red"
            title="Error"
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


        {/* Month */}

        <Select
          label="Reporting Month"
          value={month}
          onChange={(value) => {
            if (value) {
              setMonth(value);
            }
          }}
          data={monthOptions}
          searchable
        />


        {/* Performance Inputs */}

        <SimpleGrid
          cols={{
            base: 1,
            sm: 3,
          }}
        >
          <NumberInput
            label="Monthly Target"
            min={0}
            value={monthlyTarget}
            onChange={
              setMonthlyTarget
            }
          />

          <NumberInput
            label="Meetings Completed"
            min={0}
            value={
              meetingsCompleted
            }
            onChange={
              setMeetingsCompleted
            }
          />

          <NumberInput
            label="Meetings Lined Up"
            min={0}
            value={
              meetingsLinedUp
            }
            onChange={
              setMeetingsLinedUp
            }
          />
        </SimpleGrid>


        <Button
          loading={
            saving || loading
          }
          onClick={handleSave}
        >
          Update Performance
        </Button>


        {/* Live Metrics */}

        <Card
          withBorder
          radius="md"
          p="md"
        >
          <Group
            justify="space-between"
            mb="sm"
          >
            <Text fw={600}>
              Current Performance
            </Text>

            <Badge
              color={getStatusColor(
                metrics.status
              )}
            >
              {metrics.status}
            </Badge>
          </Group>

          <SimpleGrid
            cols={{
              base: 2,
              sm: 4,
            }}
          >
            <MetricCard
              label="Achievement"
              value={`${metrics.achievement}%`}
            />

            <MetricCard
              label="Potential"
              value={`${metrics.potentialAchievement}%`}
            />

            <MetricCard
              label="Positive Leads"
              value={
                metrics.positiveLeads
              }
            />

            <MetricCard
              label="Days Remaining"
              value={
                metrics.daysRemaining
              }
            />
          </SimpleGrid>
        </Card>


        <Divider my="sm" />


        {/* Lead Upload */}

        <CampaignUpload
          campaign={campaign}
          performance={performance}
          onUploadComplete={
            handleUploadComplete
          }
        />

      </Stack>
    </Drawer>
  );
}