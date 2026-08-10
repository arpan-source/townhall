import { useState } from "react";

import {
  Modal,
  Textarea,
  TextInput,
  Button,
  Group,
  NumberInput,
} from "@mantine/core";

export default function WeeklyUpdateModal({
  open,
  onClose,
  onSave,
}) {
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [blockers, setBlockers] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  async function handleSubmit() {

  const payload = {
    message,
    progress,
    blockers,
    next_steps: nextSteps,
  };

  console.log(payload);

  await onSave(payload);

  setMessage("");
  setProgress(0);
  setBlockers("");
  setNextSteps("");

  onClose();
}

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Weekly Update"
      centered
      size="lg"
    >

      <Textarea
        label="Weekly Summary"
        placeholder="What happened this week?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        autosize
        minRows={4}
        mb="md"
      />

      <NumberInput
        label="Progress (%)"
        value={progress}
        onChange={setProgress}
        min={0}
        max={100}
        mb="md"
      />

      <Textarea
        label="Blockers"
        placeholder="Anything preventing progress?"
        value={blockers}
        onChange={(e) => setBlockers(e.target.value)}
        autosize
        minRows={3}
        mb="md"
      />

      <Textarea
        label="Next Steps"
        placeholder="What happens next?"
        value={nextSteps}
        onChange={(e) => setNextSteps(e.target.value)}
        autosize
        minRows={3}
      />

      <Group justify="flex-end" mt="xl">

        <Button
          variant="default"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
        >
          Save Update
        </Button>

      </Group>

    </Modal>
  );
}