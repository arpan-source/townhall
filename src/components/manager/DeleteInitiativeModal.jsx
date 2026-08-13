import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";

export default function DeleteInitiativeModal({
  open,
  initiative,
  onClose,
  onConfirm,
  loading = false,
}) {
  if (!initiative) return null;

  return (
    <Modal
      opened={open}
      onClose={onClose}
      centered
      title="Delete Initiative"
      size="sm"
      radius="md"
    >
      <Stack gap="md">
        <div>
          <Title order={4}>
            Delete "{initiative.title}"?
          </Title>

          <Text
            size="sm"
            c="dimmed"
            mt="xs"
          >
            This action cannot be undone. The initiative
            and its associated data may be permanently
            removed.
          </Text>
        </div>

        <Group justify="flex-end">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            color="red"
            onClick={onConfirm}
            loading={loading}
          >
            Delete Initiative
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}