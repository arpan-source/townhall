import {
  Badge,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { useInitiative } from "../../context/InitiativeContext";

function getStatusColor(status) {
  switch (status) {
    case "Completed":
      return "green";

    case "In Progress":
      return "blue";

    case "Not Started":
      return "gray";

    default:
      return "gray";
  }
}

export default function ExecutiveInitiatives({
  initiatives = [],
}) {
  const { setSelectedInitiative } = useInitiative();

  return (
    <Card
      withBorder
      radius="md"
      padding="lg"
    >
      <div>
        <Title order={3}>
          Initiative Overview
        </Title>

        <Text
          size="sm"
          c="dimmed"
          mt={3}
        >
          Company-wide initiative execution
        </Text>
      </div>

      {initiatives.length === 0 ? (
        <Text
          size="sm"
          c="dimmed"
          mt="lg"
        >
          No initiatives available.
        </Text>
      ) : (
        <Stack
          gap="sm"
          mt="lg"
        >
          {initiatives.map((initiative) => (
            <Card
              key={initiative.id}
              withBorder
              radius="md"
              padding="md"
              onClick={() =>
                setSelectedInitiative(
                  initiative
                )
              }
              style={{
                cursor: "pointer",
              }}
            >
              <Group
                justify="space-between"
                align="flex-start"
                wrap="nowrap"
              >
                <div className="min-w-0 flex-1">
                  <Text
                    fw={600}
                    size="sm"
                  >
                    {initiative.title}
                  </Text>

                  <Text
                    size="xs"
                    c="dimmed"
                    mt={3}
                  >
                    {initiative.description ||
                      "No description"}
                  </Text>
                </div>

                <Badge
                  color={getStatusColor(
                    initiative.status
                  )}
                  variant="light"
                >
                  {initiative.status}
                </Badge>
              </Group>

              <Group
                justify="space-between"
                mt="md"
                mb={5}
              >
                <Text
                  size="xs"
                  c="dimmed"
                >
                  Progress
                </Text>

                <Text
                  size="xs"
                  c="dimmed"
                >
                  {initiative.progress ?? 0}%
                </Text>
              </Group>

              <Progress
                value={initiative.progress ?? 0}
                size="sm"
                radius="xl"
              />

              <Group
                justify="space-between"
                mt="sm"
              >
                <Text
                  size="xs"
                  c="dimmed"
                >
                  Due:{" "}
                  {initiative.due_date ||
                    "--"}
                </Text>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Card>
  );
}