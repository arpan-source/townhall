import {
  Badge,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconLock,
  IconClock,
} from "@tabler/icons-react";

import { useInitiative } from "../../context/InitiativeContext";

export default function NeedsAttention({ attention = [] }) {
  const { setSelectedInitiative } = useInitiative();

  return (
    <Card
      withBorder
      radius="md"
      padding="lg"
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={3}>
            Needs Attention
          </Title>

          <Text size="sm" c="dimmed" mt={3}>
            Initiatives requiring intervention
          </Text>
        </div>

        <Badge
          size="lg"
          radius="sm"
          color={attention.length > 0 ? "red" : "green"}
          variant="light"
        >
          {attention.length}{" "}
          {attention.length === 1 ? "item" : "items"}
        </Badge>
      </Group>

      {attention.length === 0 ? (
        <Group gap="sm" mt="lg">
          <ThemeIcon
            color="green"
            variant="light"
            size={36}
            radius="md"
          >
            <IconAlertTriangle size={18} />
          </ThemeIcon>

          <div>
            <Text size="sm" fw={500}>
              Everything looks on track
            </Text>

            <Text size="xs" c="dimmed">
              No overdue initiatives.
            </Text>
          </div>
        </Group>
      ) : (
        <Stack gap="sm" mt="lg">
          {attention.map((item, index) => {
  const initiative = item.initiative;

  let color = "red";
  let Icon = IconAlertTriangle;

  if (item.type === "Blocked") {
    color = "orange";
    Icon = IconLock;
  }

  if (item.type === "Stalled") {
    color = "yellow";
    Icon = IconClock;
  }

  return (
              <Card
                key={`${initiative?.id}-${index}`}
                withBorder
                radius="md"
                padding="md"
                onClick={() => {
                  if (initiative) {
                    setSelectedInitiative(initiative);
                  }
                }}
                style={{
                  cursor: initiative
                    ? "pointer"
                    : "default",
                }}
              >
                <Group
                  align="flex-start"
                  wrap="nowrap"
                >
                  <ThemeIcon
                    color={color}
                    variant="light"
                    size={38}
                    radius="md"
                  >
                    <Icon size={19} />
                  </ThemeIcon>

                  <div className="flex-1 min-w-0">
                    <Group
                      justify="space-between"
                      align="flex-start"
                      gap="sm"
                    >
                      <Text fw={600} size="sm">
                        {initiative?.title ??
                          "Untitled initiative"}
                      </Text>

                      <Badge
                        color={color}
                        variant="light"
                        size="sm"
                      >
                        {item.type}
                      </Badge>
                    </Group>

                    <Text
                      size="sm"
                      c="dimmed"
                      mt={5}
                    >
                      {item.reason}
                    </Text>
                  </div>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}
    </Card>
  );
}