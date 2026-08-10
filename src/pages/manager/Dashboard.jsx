import { useState } from "react";

import StatCard from "../../components/dashboard/StatCard";
import AppLayout from "../../layouts/AppLayout";
import { useInitiatives } from "../../hooks/useInitiatives";
import InitiativeCard from "../../components/initiative/InitiativeCard";
import InitiativeModal from "../../components/initiative/InitiativeModal";
import InitiativeDrawer from "../../components/initiative/InitiativeDrawer";
import PageHeader from "../../components/ui/PageHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import ExecutiveBrief from "../../components/dashboard/ExecutiveBrief";

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
  const { initiatives, loading, addInitiative, refresh } = useInitiatives();
  const [open, setOpen] = useState(false);

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

      <ExecutiveBrief
        stats={{
          active: activeCount,
          completed: completedCount,
          overdue: overdueCount,
        }}
      />

      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard title="In Progress" value={activeCount} />
          <StatCard title="Completed" value={completedCount} />
          <StatCard title="Not Started" value={notStartedCount} />
          <StatCard title="Overdue" value={overdueCount} />
        </div>

        {/* Action
        <PrimaryButton onClick={() => setOpen(true)}>
          + New Initiative
        </PrimaryButton> */}

        {/* Initiatives */}
        <div className="space-y-5">
          {loading ? (
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
              <InitiativeCard key={initiative.id} initiative={initiative} />
            ))
          )}
        </div>
        {open && (
          <InitiativeModal
            onClose={() => setOpen(false)}
            onCreate={addInitiative}
          />
        )}

        <InitiativeDrawer initiatives={initiatives} refresh={refresh} />
      </div>
    </AppLayout>
  );
}
