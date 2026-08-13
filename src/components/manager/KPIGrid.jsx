import { Card, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";

import {
  IconActivity,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";

export default function KPIGrid({ stats, onKpiClick }) {
  if (!stats) return null;

  const cards = [
    {
      key: "active",
      label: "In Progress",
      value: stats.active,
      description: "Currently being executed",
      icon: IconActivity,
      color: "blue",
    },
    {
      key: "completed",
      label: "Completed",
      value: stats.completed,
      description: "Successfully completed",
      icon: IconCircleCheck,
      color: "green",
    },
    {
      key: "notStarted",
      label: "Not Started",
      value: stats.notStarted,
      description: "Awaiting execution",
      icon: IconClock,
      color: "gray",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: stats.overdue,
      description: stats.overdue > 0 ? "Requires attention" : "Nothing overdue",
      icon: IconAlertTriangle,
      color: stats.overdue > 0 ? "red" : "green",
    },
  ];

  return (
    <SimpleGrid
      cols={{
        base: 1,
        sm: 2,
        lg: 4,
      }}
      spacing="md"
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.label}
            withBorder
            radius="md"
            padding="lg"
            onClick={() => onKpiClick(card.key)}
            style={{
              cursor: "pointer",
            }}
            className="transition hover:shadow-md"
          >
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="sm" c="dimmed">
                  {card.label}
                </Text>

                <Text size="2rem" fw={700} lh={1.2} mt={8}>
                  {card.value}
                </Text>

                <Text size="xs" c="dimmed" mt={6}>
                  {card.description}
                </Text>
              </div>

              <ThemeIcon
                variant="light"
                color={card.color}
                size={40}
                radius="md"
              >
                <Icon size={20} />
              </ThemeIcon>
            </Group>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
