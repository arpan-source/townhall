import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Card,
  Loader,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

import AppLayout from "../../layouts/AppLayout";
import { getReportData } from "../../services/reportService";
import { useInitiative } from "../../context/InitiativeContext";
import InitiativeDrawer from "../../components/initiative/InitiativeDrawer";

export default function Reports() {
  const { setSelectedInitiative } = useInitiative();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");

  const [riskFilter, setRiskFilter] = useState("All");

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

  async function loadReport() {
    setLoading(true);
    setError(null);

    const { data, error } = await getReportData();

    if (error) {
      console.error("Reports error:", error);
      setError(error);
    } else {
      setReport(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <AppLayout sidebarItems={sidebar}>
        <Stack align="center" justify="center" mih={300}>
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading reports...
          </Text>
        </Stack>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout sidebarItems={sidebar}>
        <Alert color="red" title="Unable to load reports">
          <Stack gap="sm">
            <Text size="sm">
              Something went wrong while loading the reporting data.
            </Text>

            <button
              onClick={loadReport}
              className="text-sm font-medium text-red-500 hover:underline w-fit"
            >
              Retry
            </button>
          </Stack>
        </Alert>
      </AppLayout>
    );
  }

  const summary = report?.summary;

  const filteredInitiatives = (report?.initiatives || []).filter(
    (initiative) => {
      const departmentMatches =
        departmentFilter === "All" ||
        initiative.departments?.name === departmentFilter;

      const statusMatches =
        statusFilter === "All" || initiative.status === statusFilter;

      const today = new Date();

      const isOverdue =
        initiative.due_date &&
        new Date(initiative.due_date) < today &&
        initiative.status !== "Completed";

      const latestUpdate = initiative.initiative_updates?.[0];

      const isBlocked =
        initiative.status !== "Completed" &&
        latestUpdate?.blockers &&
        latestUpdate.blockers.trim() !== "";

      const isStalled =
        initiative.status === "In Progress" &&
        latestUpdate?.created_at &&
        (today - new Date(latestUpdate.created_at)) / (1000 * 60 * 60 * 24) >=
          7;

      const risk = isBlocked
        ? "Blocked"
        : isOverdue
          ? "Overdue"
          : isStalled
            ? "Stalled"
            : "On Track";

      const riskMatches = riskFilter === "All" || risk === riskFilter;

      return departmentMatches && statusMatches && riskMatches;
    },
  );

  return (
    <AppLayout sidebarItems={sidebar}>
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1}>Reports</Title>

          <Text size="sm" c="dimmed" mt={4}>
            Organization-wide execution reporting
          </Text>
        </div>

        {/* filter controls */}
        <Card withBorder radius="md" padding="md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Text size="xs" c="dimmed" mb={5}>
                Department
              </Text>

              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="All">All Departments</option>

                {report?.departments?.map((department) => (
                  <option key={department.id} value={department.name}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Text size="xs" c="dimmed" mb={5}>
                Status
              </Text>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="All">All Statuses</option>

                <option value="Not Started">Not Started</option>

                <option value="In Progress">In Progress</option>

                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <Text size="xs" c="dimmed" mb={5}>
                Risk
              </Text>

              <select
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="All">All Risks</option>

                <option value="Overdue">Overdue</option>

                <option value="Blocked">Blocked</option>

                <option value="Stalled">Stalled</option>

                <option value="On Track">On Track</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <SimpleGrid
          cols={{
            base: 1,
            xs: 2,
            md: 4,
            lg: 7,
          }}
          spacing="md"
        >
          <ReportStat label="Total" value={summary?.total ?? 0} />

          <ReportStat label="In Progress" value={summary?.active ?? 0} />

          <ReportStat label="Completed" value={summary?.completed ?? 0} />

          <ReportStat
            label="Completion Rate"
            value={`${summary?.completionRate ?? 0}%`}
          />

          <ReportStat
            label="Overdue"
            value={summary?.overdue ?? 0}
            color={summary?.overdue > 0 ? "red" : "green"}
          />

          <ReportStat
            label="Blocked"
            value={summary?.blocked ?? 0}
            color={summary?.blocked > 0 ? "orange" : "green"}
          />

          <ReportStat
            label="Stalled"
            value={summary?.stalled ?? 0}
            color={summary?.stalled > 0 ? "yellow" : "green"}
          />
        </SimpleGrid>

        <Card withBorder radius="md" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <Title order={3}>Initiative Results</Title>

              <Text size="sm" c="dimmed" mt={3}>
                {filteredInitiatives.length} initiatives matching the selected
                filters
              </Text>
            </div>

            {(departmentFilter !== "All" ||
              statusFilter !== "All" ||
              riskFilter !== "All") && (
              <button
                onClick={() => {
                  setDepartmentFilter("All");
                  setStatusFilter("All");
                  setRiskFilter("All");
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Clear filters
              </button>
            )}
          </div>

          <Stack gap="sm" mt="lg">
            {filteredInitiatives.length === 0 ? (
              <Text size="sm" c="dimmed">
                No initiatives match the selected filters.
              </Text>
            ) : (
              filteredInitiatives.map((initiative) => (
                <Card
                  key={initiative.id}
                  withBorder
                  radius="md"
                  padding="md"
                  onClick={() => setSelectedInitiative(initiative)}
                  className="cursor-pointer hover:bg-slate-800 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Text fw={600}>{initiative.title}</Text>

                      <Text size="xs" c="dimmed" mt={3}>
                        {initiative.departments?.name ?? "Unassigned"}
                        {" · "}
                        {initiative.progress ?? 0}%
                      </Text>
                    </div>

                    <Badge variant="light">{initiative.status}</Badge>
                  </div>
                </Card>
              ))
            )}
          </Stack>
        </Card>

        {/* Department Performance */}
        <Card withBorder radius="md" padding="lg">
          <Title order={3}>Department Performance</Title>

          <Text size="sm" c="dimmed" mt={3}>
            Current execution performance by department
          </Text>

          <Table highlightOnHover mt="lg" verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Department</Table.Th>

                <Table.Th>Initiatives</Table.Th>

                <Table.Th>Progress</Table.Th>

                <Table.Th>Completion</Table.Th>

                <Table.Th>Overdue</Table.Th>

                <Table.Th>Blocked</Table.Th>

                <Table.Th>Stalled</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {report?.departments?.map((department) => (
                <Table.Tr
                  key={department.id}
                  onClick={() => setSelectedDepartment(department)}
                  className="hover:bg-slate-800 transition"
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <Table.Td>
                    <Text fw={500}>{department.name}</Text>
                  </Table.Td>

                  <Table.Td>{department.total}</Table.Td>

                  <Table.Td>{department.averageProgress}%</Table.Td>

                  <Table.Td>{department.completionRate}%</Table.Td>

                  <Table.Td>
                    <Badge
                      color={department.overdue > 0 ? "red" : "green"}
                      variant="light"
                    >
                      {department.overdue}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Badge
                      color={department.blocked > 0 ? "orange" : "green"}
                      variant="light"
                    >
                      {department.blocked}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Badge
                      color={department.stalled > 0 ? "yellow" : "green"}
                      variant="light"
                    >
                      {department.stalled}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>

        {/* Department Drill-Down */}

        {selectedDepartment && (
          <Card withBorder radius="md" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <Title order={3}>{selectedDepartment.name}</Title>

                <Text size="sm" c="dimmed" mt={3}>
                  Initiatives in this department
                </Text>
              </div>

              <button
                onClick={() => setSelectedDepartment(null)}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Close
              </button>
            </div>

            <Stack gap="sm" mt="lg">
              {selectedDepartment.initiatives?.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No initiatives found.
                </Text>
              ) : (
                selectedDepartment.initiatives?.map((initiative) => (
                  <Card
                    key={initiative.id}
                    withBorder
                    radius="md"
                    padding="md"
                    onClick={() => setSelectedInitiative(initiative)}
                    className="cursor-pointer hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Text fw={600}>{initiative.title}</Text>

                        <Text size="xs" c="dimmed" mt={4}>
                          {initiative.description || "No description"}
                        </Text>
                      </div>

                      <Badge
                        variant="light"
                        color={
                          initiative.status === "Completed"
                            ? "green"
                            : initiative.status === "In Progress"
                              ? "blue"
                              : "gray"
                        }
                      >
                        {initiative.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <Text size="xs" c="dimmed">
                          Progress
                        </Text>

                        <Text size="sm" fw={600} mt={2}>
                          {initiative.progress ?? 0}%
                        </Text>
                      </div>

                      <div>
                        <Text size="xs" c="dimmed">
                          Due
                        </Text>

                        <Text size="sm" fw={600} mt={2}>
                          {initiative.due_date || "--"}
                        </Text>
                      </div>

                      <div>
                        <Text size="xs" c="dimmed">
                          Risk
                        </Text>

                        <InitiativeRiskBadge initiative={initiative} />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </Stack>
          </Card>
        )}

        {/* Risk & Attention */}
        <Card withBorder radius="md" padding="lg">
          <Title order={3}>Risk & Attention</Title>

          <Text size="sm" c="dimmed" mt={3}>
            Initiatives requiring executive visibility
          </Text>

          <Stack gap="sm" mt="lg">
            <RiskSection
              label="Overdue"
              color="red"
              initiatives={report?.risks?.overdue}
              onInitiativeClick={setSelectedInitiative}
            />

            <RiskSection
              label="Blocked"
              color="orange"
              initiatives={report?.risks?.blocked}
              onInitiativeClick={setSelectedInitiative}
            />

            <RiskSection
              label="Stalled"
              color="yellow"
              initiatives={report?.risks?.stalled}
              onInitiativeClick={setSelectedInitiative}
            />
          </Stack>
        </Card>
      </Stack>
      <InitiativeDrawer />
    </AppLayout>
  );
}

function ReportStat({ label, value, color = "indigo" }) {
  return (
    <Card withBorder radius="md" padding="md">
      <Text size="xs" c="dimmed">
        {label}
      </Text>

      <Text size="1.6rem" fw={700} mt={5} c={color}>
        {value}
      </Text>
    </Card>
  );
}

function RiskSection({ label, color, initiatives = [], onInitiativeClick }) {
  return (
    <Card withBorder radius="md" padding="md">
      <div className="flex items-center justify-between">
        <Text fw={600}>{label}</Text>

        <Badge color={color} variant="light">
          {initiatives.length}
        </Badge>
      </div>

      {initiatives.length === 0 ? (
        <Text size="sm" c="dimmed" mt="sm">
          No {label.toLowerCase()} initiatives.
        </Text>
      ) : (
        <Stack gap={6} mt="sm">
          {initiatives.map((initiative) => (
            <div
              key={initiative.id}
              onClick={() => onInitiativeClick(initiative)}
              className="flex justify-between gap-4 p-2 rounded-md cursor-pointer hover:bg-slate-800 transition"
            >
              <Text size="sm">{initiative.title}</Text>

              <Text size="xs" c="dimmed">
                {initiative.progress ?? 0}%
              </Text>
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}

function InitiativeRiskBadge({ initiative }) {
  const today = new Date();

  const isOverdue =
    initiative.due_date &&
    new Date(initiative.due_date) < today &&
    initiative.status !== "Completed";

  const latestUpdate = initiative.initiative_updates?.[0];

  const isBlocked =
    initiative.status !== "Completed" &&
    latestUpdate?.blockers &&
    latestUpdate.blockers.trim() !== "";

  if (isBlocked) {
    return (
      <Badge color="orange" variant="light" size="sm">
        Blocked
      </Badge>
    );
  }

  if (isOverdue) {
    return (
      <Badge color="red" variant="light" size="sm">
        Overdue
      </Badge>
    );
  }

  return (
    <Badge color="green" variant="light" size="sm">
      On Track
    </Badge>
  );
}
