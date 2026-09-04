import {
  Card,
  Group,
  SimpleGrid,
  Text,
} from "@mantine/core";

import {
  IconCalendarStats,
  IconCheck,
  IconTarget,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

function KPIItem({
  icon,
  label,
  value,
}) {
  return (
    <Card withBorder radius="md" p="md">
      <Group gap="sm">
        {icon}

        <div>
          <Text size="xs" c="dimmed">
            {label}
          </Text>

          <Text fw={700} size="xl">
            {value}
          </Text>
        </div>
      </Group>
    </Card>
  );
}

export default function CampaignKPI({
  metrics,
}) {
  return (
    <SimpleGrid
      cols={{
        base: 1,
        sm: 2,
        md: 3,
        lg: 5,
      }}
    >
      <KPIItem
        icon={<IconTarget size={22} />}
        label="Monthly Target"
        value={metrics.monthlyTarget}
      />

      <KPIItem
        icon={<IconCheck size={22} />}
        label="Meetings Completed"
        value={metrics.meetingsCompleted}
      />

      <KPIItem
        icon={<IconCalendarStats size={22} />}
        label="Meetings Lined Up"
        value={metrics.meetingsLinedUp}
      />

      <KPIItem
        icon={<IconTrendingUp size={22} />}
        label="Potential Achievement"
        value={`${metrics.potentialAchievement}%`}
      />

      <KPIItem
        icon={<IconUsers size={22} />}
        label="Positive Leads"
        value={metrics.positiveLeads}
      />
    </SimpleGrid>
  );
}