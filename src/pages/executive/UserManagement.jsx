import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

import AppLayout from "../../layouts/AppLayout";
import {
  getPendingUsers,
  getDepartments,
  approveUser,
} from "../../services/userService";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [departments, setDepartments] = useState([]);

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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [usersResult, departmentsResult] = await Promise.all([
        getPendingUsers(),
        getDepartments(),
      ]);

      if (usersResult.error) {
        console.error(
          "Pending users error:",
          usersResult.error,
        );

        setError("Unable to load pending users.");
      } else {
        setUsers(usersResult.data || []);
      }

      if (departmentsResult.error) {
        console.error(
          "Departments error:",
          departmentsResult.error,
        );

        setError("Unable to load departments.");
      } else {
        setDepartments(departmentsResult.data || []);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  async function handleApprove(
    userId,
    role,
    departmentId,
    campaignRole,
  ) {
    setProcessingId(userId);
    setError("");

    const { error } = await approveUser(
      userId,
      role,
      departmentId,
      campaignRole,
    );

    if (error) {
      console.error(
        "Approve user error:",
        error,
      );

      setError("Unable to approve this user.");

      setProcessingId(null);
      return;
    }

    setUsers((current) =>
      current.filter(
        (user) => user.id !== userId,
      ),
    );

    setProcessingId(null);
  }

  return (
    <AppLayout sidebarItems={sidebar}>
      <Stack gap="xl">
        <div>
          <Title order={1}>
            User Management
          </Title>

          <Text size="sm" c="dimmed" mt={4}>
            Review and approve TownHall accounts.
          </Text>
        </div>

        {error && (
          <Alert
            color="red"
            title="Something went wrong"
          >
            {error}
          </Alert>
        )}

        <Card
          withBorder
          radius="md"
          padding="lg"
        >
          <Group
            justify="space-between"
            mb="lg"
          >
            <div>
              <Text fw={600}>
                Pending Accounts
              </Text>

              <Text
                size="sm"
                c="dimmed"
                mt={3}
              >
                Users waiting for access approval.
              </Text>
            </div>

            <Badge
              color={
                users.length > 0
                  ? "orange"
                  : "green"
              }
              variant="light"
            >
              {users.length} pending
            </Badge>
          </Group>

          {loading ? (
            <Stack
              align="center"
              py="xl"
            >
              <Loader size="sm" />

              <Text
                size="sm"
                c="dimmed"
              >
                Loading users...
              </Text>
            </Stack>
          ) : users.length === 0 ? (
            <Text
              size="sm"
              c="dimmed"
            >
              No pending accounts.
            </Text>
          ) : (
            <Table
              highlightOnHover
              verticalSpacing="sm"
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    Name
                  </Table.Th>

                  <Table.Th>
                    Email
                  </Table.Th>

                  <Table.Th>
                    Created
                  </Table.Th>

                  <Table.Th>
                    Approve As
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {users.map((user) => (
                  <PendingUserRow
                    key={user.id}
                    user={user}
                    departments={departments}
                    processing={
                      processingId === user.id
                    }
                    onApprove={
                      handleApprove
                    }
                  />
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      </Stack>
    </AppLayout>
  );
}

function PendingUserRow({
  user,
  departments,
  processing,
  onApprove,
}) {
  const [selectedRole, setSelectedRole] =
    useState("Manager");

  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState(null);

  const [
    selectedCampaignRole,
    setSelectedCampaignRole,
  ] = useState(null);

  const isManager =
    selectedRole === "Manager";

  const isCampaignOperations =
    departments.find(
      (department) =>
        department.id ===
        selectedDepartment,
    )?.name === "Campaign Operations";

  const requiresCampaignRole =
    isManager && isCampaignOperations;

  function handleRoleChange(value) {
    const role = value || "Manager";

    setSelectedRole(role);

    if (role !== "Manager") {
      setSelectedDepartment(null);
      setSelectedCampaignRole(null);
    }
  }

  function handleDepartmentChange(value) {
    setSelectedDepartment(value);

    const departmentName =
      departments.find(
        (department) =>
          department.id === value,
      )?.name;

    if (
      departmentName !==
      "Campaign Operations"
    ) {
      setSelectedCampaignRole(null);
    }
  }

  const canApprove =
    selectedRole &&
    (isManager ? selectedDepartment : true) &&
    (!requiresCampaignRole ||
      selectedCampaignRole);

  return (
    <Table.Tr>
      <Table.Td>
        <Text fw={500}>
          {user.full_name}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text size="sm">
          {user.email}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text
          size="sm"
          c="dimmed"
        >
          {user.created_at
            ? new Date(
                user.created_at,
              ).toLocaleDateString()
            : "--"}
        </Text>
      </Table.Td>

      <Table.Td>
        <Group gap="sm" wrap="wrap">
          {/* ROLE */}
          <Select
            value={selectedRole}
            onChange={handleRoleChange}
            data={[
              {
                value: "Manager",
                label: "Manager",
              },
              {
                value: "Employee",
                label: "Employee",
              },
            ]}
            w={130}
            disabled={processing}
          />

          {/* DEPARTMENT */}
          <Select
            placeholder="Department"
            value={selectedDepartment}
            onChange={
              handleDepartmentChange
            }
            data={departments.map(
              (department) => ({
                value: department.id,
                label: department.name,
              }),
            )}
            w={190}
            searchable
            clearable={!isManager}
            disabled={
              processing ||
              !isManager
            }
            required={isManager}
          />

          {/* CAMPAIGN ROLE */}
          {requiresCampaignRole && (
            <Select
              label="Campaign Role"
              placeholder="Select role"
              value={selectedCampaignRole}
              onChange={
                setSelectedCampaignRole
              }
              data={[
                {
                  value: "OPS",
                  label: "Campaign Ops",
                },
                {
                  value: "CALLING",
                  label: "Campaign Calling",
                },
              ]}
              w={180}
              disabled={processing}
              required
            />
          )}

          {/* APPROVE */}
          <Button
            size="sm"
            onClick={() => {
              if (!canApprove) {
                return;
              }

              onApprove(
                user.id,
                selectedRole,
                selectedDepartment,
                selectedCampaignRole,
              );
            }}
            loading={processing}
            disabled={
              processing || !canApprove
            }
          >
            Approve
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}