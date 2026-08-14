import { supabase } from "../lib/supabase";

export async function getManagerPerformance() {
  // 1. Get all active managers
  const { data: managers, error: managerError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      role,
      department_id,
      is_active
    `,
    )
    .eq("role", "Manager")
    .eq("is_active", true)
    .order("full_name");

  if (managerError) {
    console.error("Manager query error:", managerError);

    return {
      data: null,
      error: managerError,
    };
  }

  // 2. Get initiatives owned by managers
  const { data: initiatives, error: initiativeError } = await supabase
    .from("initiatives")
    .select(
      `
      *,
      profiles!initiatives_owner_id_fkey (
        id,
        full_name
      ),
      initiative_updates (
        id,
        message,
        blockers,
        progress,
        created_at,
        user_id
      )
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (initiativeError) {
    console.error("Manager initiatives query error:", initiativeError);

    return {
      data: null,
      error: initiativeError,
    };
  }

  const today = new Date();

  const performance = managers.map((manager) => {
    const managerInitiatives = initiatives.filter(
      (initiative) => initiative.owner_id === manager.id,
    );

    const total = managerInitiatives.length;

    const completed = managerInitiatives.filter(
      (initiative) => initiative.status === "Completed",
    ).length;

    const active = managerInitiatives.filter(
      (initiative) => initiative.status === "In Progress",
    ).length;

    const notStarted = managerInitiatives.filter(
      (initiative) => initiative.status === "Not Started",
    ).length;

    const overdue = managerInitiatives.filter((initiative) => {
      if (!initiative.due_date) {
        return false;
      }

      return (
        new Date(initiative.due_date) < today &&
        initiative.status !== "Completed"
      );
    }).length;

    const blocked = managerInitiatives.filter(hasActiveBlocker).length;

    const totalProgress = managerInitiatives.reduce(
      (sum, initiative) => sum + (initiative.progress ?? 0),
      0,
    );

    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    const overdueRate = total > 0 ? Math.round((overdue / total) * 100) : 0;

    const score = calculateScore({
      completionRate,
      averageProgress,
      overdueRate,
      blocked,
      total,
    });

    return {
      id: manager.id,
      name: manager.full_name,

      score,

      rating: getPerformanceRating(score, total),

      metrics: {
        total,
        completed,
        active,
        notStarted,
        overdue,
        blocked,
        averageProgress,
        completionRate,
        overdueRate,
      },

      initiatives: managerInitiatives,
      insights: generateManagerInsights(
  managerInitiatives,
  {
    total,
    completed,
    active,
    notStarted,
    overdue,
    blocked,
    averageProgress,
    completionRate,
    overdueRate,
  },
  score,
  getPerformanceRating(score, total),
),
    };
  });

  return {
    data: performance,
    error: null,
  };
}

function calculateScore({
  completionRate,
  averageProgress,
  overdueRate,
  blocked,
  total,
}) {
  if (total === 0) {
    return 0;
  }

  const completionScore = completionRate * 0.4;

  const progressScore = averageProgress * 0.3;

  const deliveryScore = Math.max(0, 100 - overdueRate) * 0.2;

  const blockerRate = Math.min(100, (blocked / total) * 100);

  const blockerScore = Math.max(0, 100 - blockerRate) * 0.1;

  return Math.round(
    completionScore + progressScore + deliveryScore + blockerScore,
  );
}

function getPerformanceRating(score, total) {
  if (total === 0) {
    return "No Data";
  }

  if (score >= 90) {
    return "Very Good";
  }

  if (score >= 75) {
    return "Good";
  }

  if (score >= 50) {
    return "Poor";
  }

  return "Very Poor";
}

function generateManagerInsights(
  initiatives = [],
  metrics = {},
  score = 0,
  rating = "No Data",
) {
  const achievements = [];
  const bottlenecks = [];
  const recommendations = [];

  const completed = initiatives.filter(
    (initiative) =>
      initiative.status === "Completed",
  );

  const active = initiatives.filter(
    (initiative) =>
      initiative.status === "In Progress",
  );

  const notStarted = initiatives.filter(
    (initiative) =>
      initiative.status === "Not Started",
  );

  const overdue = initiatives.filter(
    (initiative) => {
      if (!initiative.due_date) {
        return false;
      }

      return (
        new Date(initiative.due_date) <
          new Date() &&
        initiative.status !== "Completed"
      );
    },
  );

  const blocked = initiatives.filter(
    hasActiveBlocker,
  );

  /*
   * ACHIEVEMENTS
   */

  if (completed.length > 0) {
    achievements.push(
      `${completed.length} initiative${
        completed.length === 1 ? "" : "s"
      } completed successfully.`,
    );
  }

  if (metrics.averageProgress >= 70) {
    achievements.push(
      `Average initiative progress is ${metrics.averageProgress}%.`,
    );
  }

  if (metrics.completionRate >= 50) {
    achievements.push(
      `Completion rate is ${metrics.completionRate}%.`,
    );
  }

  if (
    active.length > 0 &&
    metrics.averageProgress >= 50
  ) {
    achievements.push(
      `${active.length} active initiative${
        active.length === 1 ? "" : "s"
      } are currently progressing.`,
    );
  }

  if (achievements.length === 0) {
    achievements.push(
      "No significant positive execution trend identified yet.",
    );
  }

  /*
   * BOTTLENECKS
   */

  if (overdue.length > 0) {
    bottlenecks.push(
      `${overdue.length} initiative${
        overdue.length === 1 ? "" : "s"
      } are overdue.`,
    );
  }

  if (blocked.length > 0) {
    bottlenecks.push(
      `${blocked.length} initiative${
        blocked.length === 1 ? "" : "s"
      } have active blockers.`,
    );
  }

  if (notStarted.length > 0) {
    bottlenecks.push(
      `${notStarted.length} initiative${
        notStarted.length === 1 ? "" : "s"
      } have not started.`,
    );
  }

  if (
    metrics.averageProgress < 40 &&
    initiatives.length > 0
  ) {
    bottlenecks.push(
      "Overall initiative progress is below 40%.",
    );
  }

  if (bottlenecks.length === 0) {
    bottlenecks.push(
      "No major execution bottlenecks identified.",
    );
  }

  /*
   * RECOMMENDATIONS
   */

  if (blocked.length > 0) {
    recommendations.push({
      period: "Next 7 Days",
      action:
        "Resolve active blockers before taking on additional work.",
    });
  }

  if (overdue.length > 0) {
    recommendations.push({
      period: "Next 7 Days",
      action:
        "Review overdue commitments and establish recovery dates.",
    });
  }

  if (notStarted.length > 0) {
    recommendations.push({
      period: "Next 14 Days",
      action:
        "Move not-started initiatives into execution or explicitly re-prioritize them.",
    });
  }

  if (
    metrics.completionRate < 50 &&
    initiatives.length > 0
  ) {
    recommendations.push({
      period: "Next 30 Days",
      action:
        "Focus on completing existing initiatives rather than expanding scope.",
    });
  }

  if (
    metrics.averageProgress < 60 &&
    active.length > 0
  ) {
    recommendations.push({
      period: "Next 30 Days",
      action:
        "Review active initiatives weekly and address stalled progress early.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      period: "Next 30 Days",
      action:
        "Maintain the current execution cadence and continue monitoring delivery risks.",
    });
  }

  /*
   * RATING EXPLANATION
   */

  const ratingExplanation =
    generateRatingExplanation(
      metrics,
      score,
      rating,
    );

  /*
   * EXECUTIVE SUMMARY
   */

  const executiveSummary =
    generateExecutiveSummary(
      metrics,
      rating,
      score,
    );

  return {
    executiveSummary,
    ratingExplanation,
    achievements,
    bottlenecks,
    recommendations,
  };
}

function generateRatingExplanation(
  metrics,
  score,
  rating,
) {
  if (metrics.total === 0) {
    return "There is insufficient initiative data to assess performance.";
  }

  const factors = [];

  if (metrics.completionRate < 50) {
    factors.push(
      `completion rate is ${metrics.completionRate}%`,
    );
  }

  if (metrics.averageProgress < 60) {
    factors.push(
      `average progress is ${metrics.averageProgress}%`,
    );
  }

  if (metrics.overdue > 0) {
    factors.push(
      `${metrics.overdue} initiative${
        metrics.overdue === 1 ? "" : "s"
      } ${metrics.overdue === 1 ? "is" : "are"} overdue`,
    );
  }

  if (metrics.blocked > 0) {
    factors.push(
      `${metrics.blocked} initiative${
        metrics.blocked === 1 ? "" : "s"
      } ${metrics.blocked === 1 ? "has" : "have"} active blockers`,
    );
  }

  if (factors.length === 0) {
    return `The manager is rated ${rating} with a score of ${score}/100 based on current execution metrics.`;
  }

  return `The ${rating.toLowerCase()} rating of ${score}/100 is primarily influenced by ${factors.join(
    ", ",
  )}.`;
}

function generateExecutiveSummary(
  metrics,
  rating,
  score,
) {
  if (metrics.total === 0) {
    return "No active initiatives are currently available for performance assessment.";
  }

  if (
    metrics.overdue > 0 &&
    metrics.blocked > 0
  ) {
    return `${rating} execution performance with delivery risk concentrated around overdue and blocked initiatives.`;
  }

  if (metrics.completionRate >= 70) {
    return `${rating} execution performance with a strong completion rate and consistent initiative delivery.`;
  }

  if (metrics.averageProgress >= 70) {
    return `${rating} execution performance with healthy overall initiative progress.`;
  }

  return `${rating} execution performance with opportunities to improve delivery consistency and initiative completion.`;
}

function hasActiveBlocker(initiative) {
  const updates = [...(initiative.initiative_updates || [])].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  const blocker = updates[0]?.blockers?.trim().toLowerCase();

  if (!blocker) {
    return false;
  }

  const noBlockerValues = [
    "na",
    "n/a",
    "none",
    "no",
    "nil",
    "no blockers",
    "no blocker",
  ];

  return !noBlockerValues.includes(blocker);
}
