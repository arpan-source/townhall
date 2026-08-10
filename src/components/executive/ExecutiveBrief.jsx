import { Alert, Stack, Text, Title } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";

export default function ExecutiveBrief() {
  return (
    <Alert
      color="indigo"
      variant="light"
      radius="md"
      icon={<IconSparkles size={18} />}
    >
      <Title order={4}>
        Executive Brief
      </Title>

      <Stack gap={6} mt="sm">

        <Text>
          • No critical business risks detected.
        </Text>

        <Text>
          • Product team completed two initiatives.
        </Text>

        <Text>
          • Engineering health remains stable.
        </Text>

      </Stack>
    </Alert>
  );
}