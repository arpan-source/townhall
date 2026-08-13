import {
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";

function formatActivityTime(date) {
  if (!date) return "";

  const activityDate = new Date(date);
  const now = new Date();

  const diffMs = now - activityDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return activityDate.toLocaleDateString();
}

export default function RecentActivity({
  initiatives = [],
}) {
  const activities = initiatives
    .filter((initiative) => initiative.latestUpdate)
    .map((initiative) => ({
      id: initiative.latestUpdate.id,
      initiativeId: initiative.id,
      initiativeTitle: initiative.title,
      message: initiative.latestUpdate.message,
      progress: initiative.latestUpdate.progress,
      createdAt: initiative.latestUpdate.created_at,
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )
    .slice(0, 8);

  return (
    <Card
      withBorder
      radius="md"
      padding="lg"
    >
      <div>
        <Title order={3}>
          Recent Activity
        </Title>

        <Text
          size="sm"
          c="dimmed"
          mt={3}
        >
          Latest updates from your initiatives
        </Text>
      </div>

      {activities.length === 0 ? (
        <Text
          size="sm"
          c="dimmed"
          mt="lg"
        >
          No recent activity available.
        </Text>
      ) : (
        <Stack gap={0} mt="md">
          {activities.map((activity, index) => (
            <div key={activity.id}>
              <Group
                align="flex-start"
                wrap="nowrap"
                py="md"
              >
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />

                  {index !== activities.length - 1 && (
                    <div className="w-px flex-1 min-h-10 bg-slate-700 mt-2" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Group
                    justify="space-between"
                    align="flex-start"
                    gap="md"
                  >
                    <div className="min-w-0">
                      <Text
                        fw={600}
                        size="sm"
                      >
                        {activity.initiativeTitle}
                      </Text>

                      <Text
                        size="sm"
                        mt={3}
                      >
                        {activity.message ||
                          "Initiative updated"}
                      </Text>

                      <Text
                        size="xs"
                        c="dimmed"
                        mt={5}
                      >
                        Progress:{" "}
                        {activity.progress ?? 0}%
                      </Text>
                    </div>

                    <Text
                      size="xs"
                      c="dimmed"
                      className="shrink-0"
                    >
                      {formatActivityTime(
                        activity.createdAt
                      )}
                    </Text>
                  </Group>
                </div>
              </Group>

              {index !== activities.length - 1 && (
                <Divider />
              )}
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}