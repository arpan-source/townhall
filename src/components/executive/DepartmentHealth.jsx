import {
  Card,
  Group,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";

function getHealthColor(value) {
  if (value >= 80) return "green";
  if (value >= 60) return "yellow";
  return "red";
}

export default function DepartmentHealth({
  departments = [],
}) {
  return (
    <Card
      withBorder
      radius="md"
      padding="lg"
    >
      <div className="mb-6">
        <Title order={4}>
          Department Health
        </Title>

        <Text size="sm" c="dimmed" mt={3}>
          Average initiative progress by department
        </Text>
      </div>

      {departments.length === 0 ? (
        <Text c="dimmed" size="sm">
          No department data available.
        </Text>
      ) : (
        <Stack gap="lg">
          {departments.map((department) => {
            const health = Math.min(
              Math.max(department.health ?? 0, 0),
              100
            );

            return (
              <div key={department.name}>
                <Group
                  justify="space-between"
                  mb={6}
                >
                  <Text fw={500} size="sm">
                    {department.name}
                  </Text>

                  <Text
                    fw={600}
                    size="sm"
                  >
                    {health}%
                  </Text>
                </Group>

                <Progress
                  value={health}
                  color={getHealthColor(health)}
                  radius="xl"
                  size="md"
                />
              </div>
            );
          })}
        </Stack>
      )}
    </Card>
  );
}