import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Button,
  Group,
} from "@mantine/core";

import { useDepartments } from "../../context/DepartmentContext";

export default function EditInitiativeModal({
  open,
  onClose,
  initiative,
  onSave,
}) {
  const { departments } = useDepartments();

  const [form, setForm] = useState({
    title: "",
    description: "",
    department_id: "",
    status: "Not Started",
    priority: "Medium",
    progress: 0,
    due_date: "",
  });

  useEffect(() => {
    if (initiative) {
      setForm({
        title: initiative.title || "",
        description: initiative.description || "",
        department_id: initiative.department_id || "",
        status: initiative.status || "Not Started",
        priority: initiative.priority || "Medium",
        progress: initiative.progress || 0,
        due_date: initiative.due_date || "",
      });
    }
  }, [initiative]);

  async function handleSubmit() {
    await onSave(form);
    onClose();
  }

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Edit Initiative"
      centered
      size="lg"
    >
      <TextInput
        label="Title"
        value={form.title}
        onChange={(e) =>
          setForm({
            ...form,
            title: e.target.value,
          })
        }
        mb="md"
      />

      <Textarea
        label="Description"
        value={form.description}
        onChange={(e) =>
          setForm({
            ...form,
            description: e.target.value,
          })
        }
        autosize
        minRows={3}
        mb="md"
      />

      <Select
        label="Department"
        value={form.department_id}
        onChange={(value) =>
          setForm({
            ...form,
            department_id: value,
          })
        }
        data={departments.map((dept) => ({
          value: dept.id,
          label: dept.name,
        }))}
        mb="md"
      />

      <Group grow mb="md">
        <Select
          label="Status"
          value={form.status}
          onChange={(value) =>
            setForm({
              ...form,
              status: value,
            })
          }
          data={[
            "Not Started",
            "In Progress",
            "Completed",
            "Blocked",
            "At Risk",
          ]}
        />

        <Select
          label="Priority"
          value={form.priority}
          onChange={(value) =>
            setForm({
              ...form,
              priority: value,
            })
          }
          data={[
            "Low",
            "Medium",
            "High",
            "Critical",
          ]}
        />
      </Group>

      <NumberInput
        label="Progress"
        value={form.progress}
        min={0}
        max={100}
        onChange={(value) =>
          setForm({
            ...form,
            progress: value || 0,
          })
        }
        mb="md"
      />

      <TextInput
        type="date"
        label="Due Date"
        value={form.due_date}
        onChange={(e) =>
          setForm({
            ...form,
            due_date: e.target.value,
          })
        }
        mb="xl"
      />

      <Group justify="flex-end">
        <Button
          variant="default"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit}>
          Save Changes
        </Button>
      </Group>
    </Modal>
  );
}