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
  approveUser,
} from "../../services/userService";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] =
    useState(null);

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

  async function loadUsers() {
    setLoading(true);
    setError("");

    const {
      data,
      error,
    } = await getPendingUsers();

    if (error) {
      console.error(
        "Pending users error:",
        error,
      );

      setError(
        "Unable to load pending users.",
      );
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleApprove(
    userId,
    role,
  ) {
    setProcessingId(userId);
    setError("");

    const {
      error,
    } = await approveUser(
      userId,
      role,
    );

    if (error) {
      console.error(
        "Approve user error:",
        error,
      );

      setError(
        "Unable to approve this user.",
      );

      setProcessingId(null);
      return;
    }

    setUsers((current) =>
      current.filter(
        (user) =>
          user.id !== userId,
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

          <Text
            size="sm"
            c="dimmed"
            mt={4}
          >
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
                    processing={
                      processingId ===
                      user.id
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
  processing,
  onApprove,
}) {
  const [
    selectedRole,
    setSelectedRole,
  ] = useState("Manager");

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
        <Group gap="sm">
          <Select
            value={selectedRole}
            onChange={(value) =>
              setSelectedRole(
                value || "Manager",
              )
            }
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
            w={140}
            disabled={processing}
          />

          <Button
            size="sm"
            onClick={() =>
              onApprove(
                user.id,
                selectedRole,
              )
            }
            loading={processing}
          >
            Approve
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}