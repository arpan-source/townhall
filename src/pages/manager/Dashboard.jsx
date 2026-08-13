import { useState } from "react";

import { notifications } from "@mantine/notifications";
import EditInitiativeModal from "../../components/initiative/EditInitiativeModal";
import InitiativeCard from "../../components/initiative/InitiativeCard";
import InitiativeDrawer from "../../components/initiative/InitiativeDrawer";
import InitiativeModal from "../../components/initiative/InitiativeModal";
import DeleteInitiativeModal from "../../components/manager/DeleteInitiativeModal";
import KPIDetailModal from "../../components/manager/KPIDetailModal";
import KPIGrid from "../../components/manager/KPIGrid";
import NeedsAttention from "../../components/manager/NeedsAttention";
import RecentActivity from "../../components/manager/RecentActivity";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import PageHeader from "../../components/ui/PageHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useInitiative } from "../../context/InitiativeContext";
import { useInitiatives } from "../../hooks/useInitiatives";
import AppLayout from "../../layouts/AppLayout";

const sidebar = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "My Initiatives",
    path: "/initiatives",
  },
];

export default function Dashboard() {
  const {
    initiatives,
    loading,
    error,
    addInitiative,
    editInitiative,
    removeInitiative,
    refresh,
  } = useInitiatives();
  const [open, setOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [editInitiativeTarget, setEditInitiativeTarget] = useState(null);
  const [deleteInitiativeTarget, setDeleteInitiativeTarget] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const { selectedInitiative, setSelectedInitiative } = useInitiative();

  const activeCount = initiatives.filter(
    (i) => i.status === "In Progress",
  ).length;

  const completedCount = initiatives.filter(
    (i) => i.status === "Completed",
  ).length;

  const notStartedCount = initiatives.filter(
    (i) => i.status === "Not Started",
  ).length;

  const overdueCount = initiatives.filter((i) => {
    if (!i.due_date) return false;

    return new Date(i.due_date) < new Date() && i.status !== "Completed";
  }).length;

  const kpiDefinitions = {
    active: {
      title: "In Progress",
      description: "Initiatives currently being executed.",
      initiatives: initiatives.filter(
        (initiative) => initiative.status === "In Progress",
      ),
    },

    completed: {
      title: "Completed",
      description: "Successfully completed initiatives.",
      initiatives: initiatives.filter(
        (initiative) => initiative.status === "Completed",
      ),
    },

    notStarted: {
      title: "Not Started",
      description: "Initiatives awaiting execution.",
      initiatives: initiatives.filter(
        (initiative) => initiative.status === "Not Started",
      ),
    },

    overdue: {
      title: "Overdue",
      description: "Initiatives past their due date.",
      initiatives: initiatives.filter((initiative) => {
        if (!initiative.due_date) return false;

        return (
          new Date(initiative.due_date) < new Date() &&
          initiative.status !== "Completed"
        );
      }),
    },
  };

  const attention = initiatives.flatMap((initiative) => {
    const items = [];

    // -------------------------
    // 1. OVERDUE
    // -------------------------

    if (
      initiative.due_date &&
      new Date(initiative.due_date) < new Date() &&
      initiative.status !== "Completed"
    ) {
      items.push({
        initiative,
        type: "Overdue",
        reason: `Due ${initiative.due_date}`,
      });
    }

    // -------------------------
    // 2. BLOCKED
    // -------------------------

    const blockers = initiative.latestUpdate?.blockers;

    if (
      initiative.status !== "Completed" &&
      blockers &&
      blockers.trim() !== ""
    ) {
      items.push({
        initiative,
        type: "Blocked",
        reason: blockers,
      });
    }

    // -------------------------
    // 3. STALLED
    // -------------------------

    if (initiative.status === "In Progress") {
      const lastUpdate = initiative.latestUpdate?.created_at;

      if (lastUpdate) {
        const daysSinceUpdate =
          (new Date() - new Date(lastUpdate)) / (1000 * 60 * 60 * 24);

        if (daysSinceUpdate >= 7) {
          items.push({
            initiative,
            type: "Stalled",
            reason: `No update in ${Math.floor(daysSinceUpdate)} days.`,
          });
        }
      }
    }

    return items;
  });

  return (
    <AppLayout sidebarItems={sidebar}>
      <PageHeader
        title="My Dashboard"
        subtitle="Track initiatives, updates and execution."
        actions={
          <PrimaryButton onClick={() => setOpen(true)}>
            + New Initiative
          </PrimaryButton>
        }
      />

      <div className="mt-8 space-y-8">
        <KPIGrid
          stats={{
            active: activeCount,
            completed: completedCount,
            notStarted: notStartedCount,
            overdue: overdueCount,
          }}
          onKpiClick={(key) => setSelectedKPI(key)}
        />

        <NeedsAttention attention={attention} />

        <RecentActivity initiatives={initiatives} />

        <div className="space-y-5">
          {error ? (
            <EmptyState
              title="Unable to load initiatives"
              description="Something went wrong while loading your initiatives. Try again."
              actionLabel="Retry"
              onAction={refresh}
            />
          ) : loading ? (
            <LoadingSkeleton lines={6} />
          ) : initiatives.length === 0 ? (
            <EmptyState
              title="No initiatives yet"
              description="Create your first initiative to begin tracking execution."
              actionLabel="New Initiative"
              onAction={() => setOpen(true)}
            />
          ) : (
            initiatives.map((initiative) => (
              <InitiativeCard
                key={initiative.id}
                initiative={initiative}
                onEdit={(initiative) => {
                  setEditInitiativeTarget(initiative);
                }}
                onDelete={(initiative) => {
                  setDeleteInitiativeTarget(initiative);
                }}
              />
            ))
          )}
        </div>
      </div>

      {open && (
        <InitiativeModal
          onClose={() => setOpen(false)}
          onCreate={addInitiative}
        />
      )}

      <InitiativeDrawer initiatives={initiatives} refresh={refresh} />

      {selectedKPI && (
        <KPIDetailModal
          open={Boolean(selectedKPI)}
          onClose={() => setSelectedKPI(null)}
          title={kpiDefinitions[selectedKPI].title}
          description={kpiDefinitions[selectedKPI].description}
          initiatives={kpiDefinitions[selectedKPI].initiatives}
        />
      )}

      {editInitiativeTarget && (
        <EditInitiativeModal
          open={Boolean(editInitiativeTarget)}
          initiative={editInitiativeTarget}
          onClose={() => setEditInitiativeTarget(null)}
          onSave={async (values) => {
            const error = await editInitiative(editInitiativeTarget.id, values);

            if (error) {
              console.error("Failed to update initiative:", error);

              notifications.show({
                title: "Update failed",
                message: "The initiative could not be updated.",
                color: "red",
              });

              return;
            }

            // Update the drawer if this initiative
            // is currently open.
            if (selectedInitiative?.id === editInitiativeTarget.id) {
              setSelectedInitiative({
                ...selectedInitiative,
                ...values,
              });
            }

            setEditInitiativeTarget(null);

            notifications.show({
              title: "Initiative updated",
              message: "The initiative was updated successfully.",
              color: "green",
            });
          }}
        />
      )}

      {deleteInitiativeTarget && (
        <DeleteInitiativeModal
          open={Boolean(deleteInitiativeTarget)}
          initiative={deleteInitiativeTarget}
          loading={deleteLoading}
          onClose={() => {
            if (!deleteLoading) {
              setDeleteInitiativeTarget(null);
            }
          }}
          onConfirm={async () => {
            setDeleteLoading(true);

            const error = await removeInitiative(deleteInitiativeTarget.id);

            setDeleteLoading(false);

            if (error) {
              console.error("Failed to delete initiative:", error);

              notifications.show({
                title: "Delete failed",
                message: "The initiative could not be deleted.",
                color: "red",
              });

              return;
            }

            // Close the drawer if the deleted initiative
            // is currently being viewed.
            if (selectedInitiative?.id === deleteInitiativeTarget.id) {
              setSelectedInitiative(null);
            }

            setDeleteInitiativeTarget(null);

            notifications.show({
              title: "Initiative deleted",
              message: "The initiative was deleted successfully.",
              color: "green",
            });
          }}
        />
      )}
    </AppLayout>
  );
}
