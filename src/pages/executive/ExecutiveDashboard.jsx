import { useEffect, useRef, useState } from "react";
import { Button, Loader, Stack, Text } from "@mantine/core";
import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import ExecutiveBrief from "../../components/executive/ExecutiveBrief";
import KPIGrid from "../../components/executive/KPIGrid";
import NeedsAttention from "../../components/executive/NeedsAttention";
import ManagerPerformance from "../../components/executive/ManagerPerformance";
import RecentActivity from "../../components/executive/RecentActivity";
import InitiativeDrawer from "../../components/initiative/InitiativeDrawer";
import ExecutiveInitiatives from "../../components/executive/ExecutiveInitiatives";
import { getManagerPerformance } from "../../services/managerService";

import { getDashboardStats } from "../../services/dashboardService";

const sidebar = [
  {
    label: "Executive Dashboard",
    path: "/executive",
  },
  {
    label: "Departments",
    path: "/executive/departments",
  },
  {
    label: "Reports",
    path: "/executive/reports",
  },
  {
    label: "User Management",
    path: "/executive/users",
  },
];

export default function ExecutiveDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initiativesRef = useRef(null);

  const scrollToInitiatives = () => {
    const main = document.getElementById("main-content");

    const target = initiativesRef.current;

    if (!main || !target) return;

    const mainRect = main.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    main.scrollTo({
      top: main.scrollTop + (targetRect.top - mainRect.top) - 20,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);

      const { data, error } = await getDashboardStats();

      if (error) {
        console.error("Executive dashboard error:", error);

        setError(error);
      } else {
        setDashboard(data);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    async function testManagers() {
      const { data, error } = await getManagerPerformance();

      console.log("MANAGER PERFORMANCE:", JSON.stringify(data, null, 2));

      console.log("MANAGER PERFORMANCE ERROR:", error);
    }

    testManagers();
  }, []);

  const activities =
    dashboard?.initiatives
      ?.flatMap((initiative) =>
        (initiative.initiative_updates || []).map((update) => ({
          id: update.id,
          message: update.message,
          progress: update.progress,
          initiativeTitle: initiative.title,
          userName: Array.isArray(update.profiles)
            ? update.profiles[0]?.full_name
            : update.profiles?.full_name,
          createdAt: update.created_at,
        })),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10) || [];

  return (
    <AppLayout sidebarItems={sidebar}>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Company-wide insights and strategic decisions."
      />

      <div className="mt-8 w-full">
        {loading ? (
          <Stack align="center" py="xl">
            <Loader size="sm" />
          </Stack>
        ) : error ? (
          <Stack align="center" py="xl">
            <Text c="red">Unable to load the Executive Dashboard.</Text>

            <Button variant="light" onClick={loadDashboard}>
              Retry
            </Button>
          </Stack>
        ) : (
          <Stack gap="xl">
            <ExecutiveBrief stats={dashboard?.stats} />

            <KPIGrid
              stats={dashboard?.stats}
              onTotalClick={scrollToInitiatives}
            />

            <div className="grid grid-cols-1 gap-6">
              <NeedsAttention attention={dashboard?.attention} />

              <ManagerPerformance />
            </div>

            <div ref={initiativesRef}>
              <ExecutiveInitiatives initiatives={dashboard?.initiatives} />
            </div>

            <RecentActivity activities={activities} />
          </Stack>
        )}
      </div>
      <InitiativeDrawer />
    </AppLayout>
  );
}
