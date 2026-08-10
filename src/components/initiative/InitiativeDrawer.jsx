import { useState, useEffect } from "react";
import { useInitiative } from "../../context/InitiativeContext";
import { formatDate } from "../../utils/formatDate";
import PriorityBadge from "../common/PriorityBadge";
import { useDepartments } from "../../context/DepartmentContext";
import WeeklyUpdateModal from "./WeeklyUpdateModal";
import { createWeeklyUpdate } from "../../services/initiativeUpdateService";
import { updateInitiativeProgress } from "../../services/initiativeService";
import { useAuth } from "../../hooks/useAuth";
import { getWeeklyUpdates } from "../../services/initiativeUpdateService";
import EditInitiativeModal from "./EditInitiativeModal";
import { updateInitiative } from "../../services/initiativeService";
import StatusBadge from "../ui/StatusBadge";
import ProgressBar from "../ui/ProgressBar";
import InitiativeHeader from "./drawer/InitiativeHeader";
import InitiativeOverview from "./drawer/InitiativeOverview";
import InitiativeProgress from "./drawer/InitiativeProgress";
import InitiativeActivity from "./drawer/InitiativeActivity";
import InitiativeActions from "./drawer/InitiativeActions";
import { Drawer } from "@mantine/core";

export default function InitiativeDrawer({ initiatives, refresh }) {
  const { selectedInitiative, setSelectedInitiative } = useInitiative();
  console.log(selectedInitiative);

  const [showWeeklyUpdate, setShowWeeklyUpdate] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updates, setUpdates] = useState([]);

  const { departments } = useDepartments();
  const { user } = useAuth();
  console.log("Departments Context:", departments);

  const department = departments.find(
    (d) => d.id === selectedInitiative?.department_id,
  );

  async function handleWeeklyUpdate(values) {
    const { error } = await createWeeklyUpdate({
      initiative_id: selectedInitiative.id,

      user_id: user.id,

      message: values.message,

      progress: values.progress,

      blockers: values.blockers,

      next_steps: values.next_steps,
    });

    if (error) {
      console.error(error);

      return;
    }

    await updateInitiativeProgress(selectedInitiative.id, values.progress);

    await loadUpdates();

    setShowWeeklyUpdate(false);

    alert("Weekly Update Saved Successfully");
  }

  async function handleEditInitiative(values) {
    const { error } = await updateInitiative(selectedInitiative.id, values);

    if (error) {
      console.error(error);
      return;
    }

    await refresh();

    const updated = initiatives.find(
      (item) => item.id === selectedInitiative.id,
    );

    if (updated) {
      setSelectedInitiative(updated);
    }

    setShowEditModal(false);
  }

  async function loadUpdates() {
    const { data, error } = await getWeeklyUpdates(selectedInitiative.id);

    if (error) {
      console.error(error);
      return;
    }

    setUpdates(data);
  }
  useEffect(() => {
    if (selectedInitiative) {
      loadUpdates();
    }
  }, [selectedInitiative]);

  console.log("Department Found:", department);

  if (!selectedInitiative) return null;

  return (
  <>
    <Drawer
      opened={!!selectedInitiative}
      onClose={() => setSelectedInitiative(null)}
      position="right"
      size={520}
      padding="xl"
      title="Initiative Details"
    >
      <InitiativeHeader
        initiative={selectedInitiative}
        department={department}
      />

      <div className="mt-8 space-y-6">

        <InitiativeOverview
          initiative={selectedInitiative}
        />

        <InitiativeProgress
          initiative={selectedInitiative}
        />

        <InitiativeActivity
          updates={updates}
        />

        <InitiativeActions
          onWeeklyUpdate={() => setShowWeeklyUpdate(true)}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => {
            console.log("Delete clicked");
          }}
        />

      </div>

    </Drawer>

    <WeeklyUpdateModal
      open={showWeeklyUpdate}
      onClose={() => setShowWeeklyUpdate(false)}
      onSave={handleWeeklyUpdate}
    />

    <EditInitiativeModal
      open={showEditModal}
      initiative={selectedInitiative}
      onClose={() => setShowEditModal(false)}
      onSave={handleEditInitiative}
    />
  </>
);
}
