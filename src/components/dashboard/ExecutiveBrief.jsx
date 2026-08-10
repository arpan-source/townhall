import { Alert, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export default function ExecutiveBrief({ stats }) {
  const messages = [];

  if (stats.overdue > 0) {
    messages.push(
      `${stats.overdue} initiative${stats.overdue > 1 ? "s" : ""} require immediate attention.`
    );
  }

  if (stats.active > 0) {
    messages.push(
      `${stats.active} initiative${stats.active > 1 ? "s are" : " is"} currently in progress.`
    );
  }

  if (stats.completed > 0) {
    messages.push(
      `${stats.completed} initiative${stats.completed > 1 ? "s have" : " has"} been completed.`
    );
  }

  if (messages.length === 0) {
    messages.push("Everything looks healthy today.");
  }

  return (
    <Alert
      variant="light"
      color="indigo"
      radius="md"
      icon={<IconAlertCircle size={18} />}
    >
      <Title order={4} mb="sm">
        Executive Brief
      </Title>

      <Stack gap={6}>
        {messages.map((message, index) => (
          <Text key={index} size="sm">
            • {message}
          </Text>
        ))}
      </Stack>
    </Alert>
  );
}