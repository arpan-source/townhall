import {
  Badge,
  Card,
  Group,
  Modal,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { formatDate } from "../../utils/formatDate";
import { useInitiative } from "../../context/InitiativeContext";

export default function KPIDetailModal({
  open,
  onClose,
  title,
  description,
  initiatives = [],
}) {
  const { setSelectedInitiative } = useInitiative();

  const handleInitiativeClick = (initiative) => {
    onClose();
    setSelectedInitiative(initiative);
  };

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={title}
      centered
      size="lg"
      radius="md"
    >
      <Stack gap="md">

        <Text size="sm" c="dimmed">
          {description}
        </Text>

        {initiatives.length === 0 ? (
          <Text
            size="sm"
            c="dimmed"
            py="xl"
            ta="center"
          >
            No initiatives found.
          </Text>
        ) : (
          initiatives.map((initiative) => (
            <Card
              key={initiative.id}
              withBorder
              radius="md"
              padding="md"
              onClick={() =>
                handleInitiativeClick(initiative)
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
                <div className="min-w-0">
                  <Text fw={600}>
                    {initiative.title}
                  </Text>

                  <Text
                    size="sm"
                    c="dimmed"
                    mt={4}
                  >
                    {initiative.description ||
                      "No description"}
                  </Text>
                </div>

                <Badge
                  variant="light"
                  color="indigo"
                >
                  {initiative.status}
                </Badge>
              </Group>

              <Group
                justify="space-between"
                mt="md"
              >
                <Text size="xs" c="dimmed">
                  Progress
                </Text>

                <Text size="xs" fw={600}>
                  {initiative.progress ?? 0}%
                </Text>
              </Group>

              <Progress
                value={initiative.progress ?? 0}
                mt={6}
                radius="xl"
              />

              <Group
                justify="space-between"
                mt="md"
              >
                <Text size="xs" c="dimmed">
                  Due:{" "}
                  {formatDate(initiative.due_date)}
                </Text>

                <Text
                  size="xs"
                  c="indigo"
                  fw={500}
                >
                  View details →
                </Text>
              </Group>
            </Card>
          ))
        )}

      </Stack>
    </Modal>
  );
}