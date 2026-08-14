import { supabase } from "../lib/supabase";

export async function getReportData() {
  const { data, error } = await supabase.from("initiatives").select(`
    *,
    departments (
      id,
      name
    ),
    profiles (
      full_name
    ),
    initiative_updates (
      id,
      created_at,
      message,
      blockers,
      progress,
      user_id,
      profiles!initiative_updates_user_id_fkey (
        id,
        full_name
      )
    )
  `);

  if (error) {
    return {
      data: null,
      error,
    };
  }

  const initiatives = data || [];
  const today = new Date();

  // --------------------------------
  // SUMMARY
  // --------------------------------

  const total = initiatives.length;

  const active = initiatives.filter(
    (initiative) => initiative.status === "In Progress",
  ).length;

  const completed = initiatives.filter(
    (initiative) => initiative.status === "Completed",
  ).length;

  const notStarted = initiatives.filter(
    (initiative) => initiative.status === "Not Started",
  ).length;

  const overdueInitiatives = initiatives.filter((initiative) => {
    if (!initiative.due_date) return false;

    return (
      new Date(initiative.due_date) < today && initiative.status !== "Completed"
    );
  });

  const overdue = overdueInitiatives.length;

  // --------------------------------
  // BLOCKED
  // --------------------------------

  const blockedInitiatives = initiatives.filter((initiative) => {
    if (initiative.status === "Completed") {
      return false;
    }

    const latestUpdate = initiative.initiative_updates?.[0];

    return latestUpdate?.blockers && latestUpdate.blockers.trim() !== "";
  });

  const blocked = blockedInitiatives.length;

  // --------------------------------
  // STALLED
  // --------------------------------

  const stalledInitiatives = initiatives.filter((initiative) => {
    if (initiative.status !== "In Progress") {
      return false;
    }

    const latestUpdate = initiative.initiative_updates?.[0];

    if (!latestUpdate?.created_at) {
      return false;
    }

    const daysSinceUpdate =
      (today - new Date(latestUpdate.created_at)) / (1000 * 60 * 60 * 24);

    return daysSinceUpdate >= 7;
  });

  const stalled = stalledInitiatives.length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // --------------------------------
  // DEPARTMENT PERFORMANCE
  // --------------------------------

  const departmentMap = {};

  initiatives.forEach((initiative) => {
    const departmentId = initiative.departments?.id ?? "unassigned";

    const departmentName = initiative.departments?.name ?? "Unassigned";

    if (!departmentMap[departmentId]) {
      departmentMap[departmentId] = {
        id: departmentId,
        name: departmentName,
        total: 0,
        active: 0,
        completed: 0,
        overdue: 0,
        blocked: 0,
        stalled: 0,
        totalProgress: 0,
        initiatives: [],
      };
    }

    const department = departmentMap[departmentId];

    department.initiatives.push(initiative);

    department.total++;

    department.totalProgress += initiative.progress ?? 0;

    if (initiative.status === "In Progress") {
      department.active++;
    }

    if (initiative.status === "Completed") {
      department.completed++;
    }

    if (
      initiative.due_date &&
      new Date(initiative.due_date) < today &&
      initiative.status !== "Completed"
    ) {
      department.overdue++;
    }

    const latestUpdate = initiative.initiative_updates?.[0];

    if (
      initiative.status !== "Completed" &&
      latestUpdate?.blockers &&
      latestUpdate.blockers.trim() !== ""
    ) {
      department.blocked++;
    }

    if (initiative.status === "In Progress" && latestUpdate?.created_at) {
      const daysSinceUpdate =
        (today - new Date(latestUpdate.created_at)) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate >= 7) {
        department.stalled++;
      }
    }
  });

  const departments = Object.values(departmentMap).map((department) => ({
    ...department,

    averageProgress:
      department.total > 0
        ? Math.round(department.totalProgress / department.total)
        : 0,

    completionRate:
      department.total > 0
        ? Math.round((department.completed / department.total) * 100)
        : 0,
  }));

  // --------------------------------
  // RISKS
  // --------------------------------

  const risks = {
    overdue: overdueInitiatives,
    blocked: blockedInitiatives,
    stalled: stalledInitiatives,
  };

  // --------------------------------
  // RECENT ACTIVITY
  // --------------------------------

  const activities = initiatives
    .flatMap((initiative) =>
      (initiative.initiative_updates || []).map((update) => ({
        id: update.id,
        initiativeId: initiative.id,
        initiativeTitle: initiative.title,
        message: update.message,
        progress: update.progress,
        blockers: update.blockers,
        userName: Array.isArray(update.profiles)
          ? update.profiles[0]?.full_name
          : update.profiles?.full_name,
        createdAt: update.created_at,
      })),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);

  // --------------------------------
  // RETURN
  // --------------------------------

  return {
    data: {
      summary: {
        total,
        active,
        completed,
        notStarted,
        overdue,
        blocked,
        stalled,
        completionRate,
      },

      departments,

      initiatives,

      risks,

      activities,
    },

    error: null,
  };
}
