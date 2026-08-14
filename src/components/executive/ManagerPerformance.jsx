import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconTarget,
} from "@tabler/icons-react";

import { getManagerPerformance } from "../../services/managerService";

export default function ManagerPerformance() {
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadManagers() {
      const { data, error } = await getManagerPerformance();

      if (error) {
        console.error("Manager performance error:", error);

        setManagers([]);
        setLoading(false);
        return;
      }

      setManagers(data || []);

      if (data?.length > 0) {
        setSelectedManagerId(data[0].id);
      }

      setLoading(false);
    }

    loadManagers();
  }, []);

  if (loading) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Stack align="center" py="xl">
          <Loader size="sm" />

          <Text size="sm" c="dimmed">
            Loading manager performance...
          </Text>
        </Stack>
      </Card>
    );
  }

  if (managers.length === 0) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Title order={3}>Manager Performance</Title>

        <Text size="sm" c="dimmed" mt="sm">
          No active managers are currently available.
        </Text>
      </Card>
    );
  }

  const selectedManager =
    managers.find((manager) => manager.id === selectedManagerId) || managers[0];

  const metrics = selectedManager.metrics || {};

  return (
    <Card withBorder radius="md" padding="lg">
      {/* Header */}

      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={3}>Manager Performance</Title>

          <Text size="sm" c="dimmed" mt={3}>
            Review execution performance by manager.
          </Text>
        </div>

        <Select
          value={selectedManager.id}
          onChange={setSelectedManagerId}
          data={managers.map((manager) => ({
            value: manager.id,
            label: manager.name,
          }))}
          placeholder="Select manager"
          searchable
          w={220}
        />
      </Group>

      {/* Performance Summary */}

      <Card withBorder radius="md" padding="lg" mt="xl">
        <Group justify="space-between" align="center">
          <div>
            <Text size="sm" c="dimmed">
              Overall Performance
            </Text>

            <Group gap={4} align="baseline" mt={4}>
              <Text size="2.5rem" fw={700}>
                {selectedManager.score}
              </Text>

              <Text size="sm" c="dimmed">
                / 100
              </Text>
            </Group>

            <Text fw={600} mt={2}>
              {selectedManager.name}
            </Text>
          </div>

          <PerformanceBadge rating={selectedManager.rating} />
        </Group>
      </Card>

      {/* Metrics */}

      <SimpleGrid
        cols={{
          base: 2,
          sm: 3,
          md: 6,
        }}
        spacing="md"
        mt="md"
      >
        <Metric label="Total" value={metrics.total ?? 0} icon={IconTarget} />

        <Metric
          label="Completed"
          value={metrics.completed ?? 0}
          icon={IconCircleCheck}
        />

        <Metric
          label="In Progress"
          value={metrics.active ?? 0}
          icon={IconClock}
        />

        <Metric
          label="Not Started"
          value={metrics.notStarted ?? 0}
          icon={IconTarget}
        />

        <Metric
          label="Overdue"
          value={metrics.overdue ?? 0}
          icon={IconAlertTriangle}
        />

        <Metric
          label="Blocked"
          value={metrics.blocked ?? 0}
          icon={IconAlertTriangle}
        />
      </SimpleGrid>

      {/* Execution Metrics */}

      <Card withBorder radius="md" padding="lg" mt="md">
        <Title order={4}>Execution Metrics</Title>

        <SimpleGrid
          cols={{
            base: 1,
            sm: 3,
          }}
          spacing="lg"
          mt="md"
        >
          <ProgressMetric
            label="Average Progress"
            value={metrics.averageProgress ?? 0}
          />

          <ProgressMetric
            label="Completion Rate"
            value={metrics.completionRate ?? 0}
          />

          <ProgressMetric
            label="Overdue Rate"
            value={metrics.overdueRate ?? 0}
          />
        </SimpleGrid>
      </Card>

      {/* Current Initiatives */}

      <Card withBorder radius="md" padding="lg" mt="md">
        <Group justify="space-between">
          <div>
            <Title order={4}>Tasks in Progress</Title>

            <Text size="sm" c="dimmed" mt={3}>
              Current initiatives owned by this manager.
            </Text>
          </div>

          <Badge variant="light">
            {selectedManager.initiatives?.filter(
              (initiative) => initiative.status === "In Progress",
            ).length ?? 0}
          </Badge>
        </Group>

        <Stack gap="xs" mt="md">
          {selectedManager.initiatives
            ?.filter((initiative) => initiative.status === "In Progress")
            .map((initiative) => (
              <Group
                key={initiative.id}
                justify="space-between"
                p="sm"
                className="rounded-lg hover:bg-slate-800 transition"
              >
                <div>
                  <Text size="sm" fw={500}>
                    {initiative.title}
                  </Text>

                  <Text size="xs" c="dimmed" mt={2}>
                    Due:{" "}
                    {initiative.due_date
                      ? new Date(initiative.due_date).toLocaleDateString()
                      : "No due date"}
                  </Text>
                </div>

                <Text size="sm" fw={600}>
                  {initiative.progress ?? 0}%
                </Text>
              </Group>
            ))}
        </Stack>
      </Card>

      {/* Placeholder for AI layer */}

      <Card
  withBorder
  radius="md"
  padding="lg"
  mt="md"
>
  <Title order={4}>
    Management Insights
  </Title>

  <Text
    size="sm"
    c="dimmed"
    mt={3}
  >
    Executive assessment based on current execution data.
  </Text>

  {/* Executive Summary */}

  <Card
    withBorder
    radius="md"
    padding="md"
    mt="lg"
  >
    <Text
      size="xs"
      c="dimmed"
      fw={600}
      tt="uppercase"
    >
      Executive Summary
    </Text>

    <Text
      size="sm"
      mt={6}
    >
      {selectedManager.insights
        ?.executiveSummary ||
        "No summary available."}
    </Text>
  </Card>

  {/* Rating Explanation */}

  <Card
    withBorder
    radius="md"
    padding="md"
    mt="md"
  >
    <Text
      size="xs"
      c="dimmed"
      fw={600}
      tt="uppercase"
    >
      Why This Rating?
    </Text>

    <Text
      size="sm"
      mt={6}
    >
      {selectedManager.insights
        ?.ratingExplanation ||
        "No rating explanation available."}
    </Text>
  </Card>

  <SimpleGrid
    cols={{
      base: 1,
      md: 3,
    }}
    spacing="md"
    mt="md"
  >
    <InsightList
      title="Key Achievements"
      items={
        selectedManager.insights
          ?.achievements || []
      }
    />

    <InsightList
      title="Current Bottlenecks"
      items={
        selectedManager.insights
          ?.bottlenecks || []
      }
    />

    <RecommendationList
      items={
        selectedManager.insights
          ?.recommendations || []
      }
    />
  </SimpleGrid>
</Card>
    </Card>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xs" c="dimmed">
            {label}
          </Text>

          <Text size="xl" fw={700} mt={5}>
            {value}
          </Text>
        </div>

        <Icon size={18} />
      </Group>
    </Card>
  );
}

function ProgressMetric({ label, value }) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div>
      <Group justify="space-between" mb={5}>
        <Text size="sm">{label}</Text>

        <Text size="sm" fw={600}>
          {safeValue}%
        </Text>
      </Group>

      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

function PerformanceBadge({ rating }) {
  const colors = {
    "Very Good": "green",
    Good: "blue",
    Poor: "orange",
    "Very Poor": "red",
  };

  return (
    <Badge size="lg" color={colors[rating] || "gray"} variant="light">
      {rating || "No Rating"}
    </Badge>
  );
}

function InsightSection({ title, items = [] }) {
  return (
    <div>
      <Text fw={600} size="sm" mb="sm">
        {title}
      </Text>

      <Stack gap="xs">
        {items.map((item, index) => (
          <Card key={index} withBorder radius="sm" padding="sm">
            <Text size="sm">{item}</Text>
          </Card>
        ))}
      </Stack>
    </div>
  );
}

function InsightList({
  title,
  items = [],
}) {
  return (
    <Card
      withBorder
      radius="md"
      padding="md"
    >
      <Text
        fw={600}
        size="sm"
        mb="sm"
      >
        {title}
      </Text>

      <Stack gap="xs">
        {items.map(
          (item, index) => (
            <Text
              key={index}
              size="sm"
            >
              • {item}
            </Text>
          ),
        )}
      </Stack>
    </Card>
  );
}

function RecommendationList({
  items = [],
}) {
  return (
    <Card
      withBorder
      radius="md"
      padding="md"
    >
      <Text
        fw={600}
        size="sm"
        mb="sm"
      >
        Next 7–30 Days
      </Text>

      <Stack gap="sm">
        {items.map(
          (item, index) => (
            <div key={index}>
              <Text
                size="xs"
                fw={600}
                c="indigo"
              >
                {item.period}
              </Text>

              <Text
                size="sm"
                mt={2}
              >
                {item.action}
              </Text>
            </div>
          ),
        )}
      </Stack>
    </Card>
  );
}