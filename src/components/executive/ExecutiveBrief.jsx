import {
  Alert,
  Group,
  Stack,
  Text,
  Title,
  ThemeIcon,
} from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";

export default function ExecutiveBrief({ stats }) {
  if (!stats) return null;

  const messages = [];

  if (stats.overdue > 0) {
    messages.push(
      `${stats.overdue} initiative${
        stats.overdue > 1 ? "s are" : " is"
      } overdue and requires attention.`
    );
  }

  if (stats.active > 0) {
    messages.push(
      `${stats.active} initiative${
        stats.active > 1 ? "s are" : " is"
      } currently in progress.`
    );
  }

  if (stats.completed > 0) {
    messages.push(
      `${stats.completed} initiative${
        stats.completed > 1 ? "s have" : " has"
      } been completed.`
    );
  }

  if (messages.length === 0) {
    messages.push(
      "No major initiative risks detected."
    );
  }

  return (
    <Alert
      variant="light"
      color="indigo"
      radius="md"
      p="lg"
      icon={
        <ThemeIcon
          variant="light"
          color="indigo"
          size={38}
          radius="md"
        >
          <IconSparkles size={20} />
        </ThemeIcon>
      }
    >
      <Group
        justify="space-between"
        align="flex-start"
        mb="sm"
      >
        <div>
          <Title order={3}>
            Executive Brief
          </Title>

          <Text
            size="sm"
            c="dimmed"
            mt={3}
          >
            Current organizational snapshot
          </Text>
        </div>

        <Text
          size="xs"
          c="dimmed"
        >
          Live data
        </Text>
      </Group>

      <Stack gap={6}>
        {messages.map((message, index) => (
          <Text
            key={index}
            size="sm"
          >
            • {message}
          </Text>
        ))}
      </Stack>
    </Alert>
  );
}