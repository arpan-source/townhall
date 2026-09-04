import { supabase } from "../lib/supabase";

/**
 * Get campaigns belonging to the logged-in manager.
 */
export async function getMyCampaigns() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("You must be logged in.");

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("manager_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data || [];
}


/**
 * Create a campaign.
 */
export async function createCampaign({ name, clientName }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("You must be logged in.");

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      name: name.trim(),
      client_name: clientName.trim(),
      manager_id: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}


/**
 * Get performance for a campaign and month.
 */
export async function getCampaignPerformance(campaignId, month) {
  const { data, error } = await supabase
    .from("campaign_performance")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("month", month)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}


/**
 * Create or update monthly campaign performance.
 */
export async function upsertCampaignPerformance({
  campaignId,
  month,
  monthlyTarget,
  meetingsCompleted,
  meetingsLinedUp,
  positiveLeadsCount = 0,
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("You must be logged in.");

  const { data, error } = await supabase
    .from("campaign_performance")
    .upsert(
      {
        campaign_id: campaignId,
        month,
        monthly_target: Number(monthlyTarget) || 0,
        meetings_completed: Number(meetingsCompleted) || 0,
        meetings_lined_up: Number(meetingsLinedUp) || 0,
        positive_leads_count: Number(positiveLeadsCount) || 0,
        updated_by: user.id,
      },
      {
        onConflict: "campaign_id,month",
      }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function saveCampaignLeads({
  campaignId,
  performanceId,
  leads,
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You must be logged in.");
  }

  if (!campaignId || !performanceId) {
    throw new Error(
      "Campaign and performance information are required."
    );
  }

  if (!leads || leads.length === 0) {
    throw new Error("There are no valid leads to upload.");
  }

  /*
   * ---------------------------------------------------------
   * 1. Normalize incoming leads
   * ---------------------------------------------------------
   */

  const normalizedLeads = leads.map((lead) => ({
    leadName: lead.leadName?.trim() || "",
    company: lead.company?.trim() || "",
    email: lead.email?.trim().toLowerCase() || "",
    phone: lead.phone?.trim() || "",
    designation: lead.designation?.trim() || "",
    source: lead.source?.trim() || "",
    status: lead.status?.trim() || "",
  }));

  /*
   * ---------------------------------------------------------
   * 2. Get existing leads for this campaign/performance
   * ---------------------------------------------------------
   */

  const { data: existingLeads, error: existingError } =
    await supabase
      .from("campaign_leads")
      .select(
        "id, lead_name, company, email, phone"
      )
      .eq("campaign_id", campaignId)
      .eq("performance_id", performanceId);

  if (existingError) {
    throw new Error(existingError.message);
  }

  /*
   * ---------------------------------------------------------
   * 3. Build duplicate lookup sets
   * ---------------------------------------------------------
   */

  const existingEmails = new Set();
  const existingPhones = new Set();
  const existingNameCompany = new Set();

  (existingLeads || []).forEach((lead) => {
    if (lead.email) {
      existingEmails.add(
        lead.email.trim().toLowerCase()
      );
    }

    if (lead.phone) {
      existingPhones.add(
        lead.phone.trim()
      );
    }

    const nameCompany =
      `${lead.lead_name || ""}|${lead.company || ""}`
        .trim()
        .toLowerCase();

    if (nameCompany !== "|") {
      existingNameCompany.add(nameCompany);
    }
  });

  /*
   * ---------------------------------------------------------
   * 4. Separate new leads from duplicates
   * ---------------------------------------------------------
   */

  const newLeads = [];
  const duplicates = [];

  const uploadEmails = new Set();
  const uploadPhones = new Set();
  const uploadNameCompany = new Set();

  normalizedLeads.forEach((lead) => {
    const email = lead.email;
    const phone = lead.phone;

    const nameCompany =
      `${lead.leadName}|${lead.company}`
        .trim()
        .toLowerCase();

    let duplicateReason = null;

    /*
     * Existing database duplicate
     */

    if (
      email &&
      existingEmails.has(email)
    ) {
      duplicateReason = "Email already exists";
    }

    if (
      !duplicateReason &&
      phone &&
      existingPhones.has(phone)
    ) {
      duplicateReason = "Phone number already exists";
    }

    if (
      !duplicateReason &&
      !email &&
      !phone &&
      nameCompany !== "|" &&
      existingNameCompany.has(nameCompany)
    ) {
      duplicateReason =
        "Lead Name + Company already exists";
    }

    /*
     * Duplicate within current upload
     */

    if (
      !duplicateReason &&
      email &&
      uploadEmails.has(email)
    ) {
      duplicateReason =
        "Duplicate email in upload";
    }

    if (
      !duplicateReason &&
      phone &&
      uploadPhones.has(phone)
    ) {
      duplicateReason =
        "Duplicate phone number in upload";
    }

    if (
      !duplicateReason &&
      !email &&
      !phone &&
      nameCompany !== "|" &&
      uploadNameCompany.has(nameCompany)
    ) {
      duplicateReason =
        "Duplicate Lead Name + Company in upload";
    }

    if (duplicateReason) {
      duplicates.push({
        ...lead,
        reason: duplicateReason,
      });

      return;
    }

    /*
     * Add to new lead collection
     */

    newLeads.push(lead);

    if (email) {
      uploadEmails.add(email);
    }

    if (phone) {
      uploadPhones.add(phone);
    }

    if (nameCompany !== "|") {
      uploadNameCompany.add(nameCompany);
    }
  });

  /*
   * ---------------------------------------------------------
   * 5. Nothing new to insert
   * ---------------------------------------------------------
   */

  if (newLeads.length === 0) {
    const { count, error: countError } =
      await supabase
        .from("campaign_leads")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("campaign_id", campaignId)
        .eq("performance_id", performanceId);

    if (countError) {
      throw new Error(countError.message);
    }

    const { data: updatedPerformance, error: performanceError } =
      await supabase
        .from("campaign_performance")
        .update({
          positive_leads_count: count || 0,
          updated_by: user.id,
        })
        .eq("id", performanceId)
        .select()
        .single();

    if (performanceError) {
      throw new Error(performanceError.message);
    }

    return {
      leads: [],
      duplicates,
      performance: updatedPerformance,
    };
  }

  /*
   * ---------------------------------------------------------
   * 6. Prepare database rows
   * ---------------------------------------------------------
   */

  const rows = newLeads.map((lead) => ({
    campaign_id: campaignId,
    performance_id: performanceId,

    lead_name: lead.leadName,

    company: lead.company || null,

    email: lead.email || null,

    phone: lead.phone || null,

    designation: lead.designation || null,

    source: lead.source || null,

    status: lead.status || null,

    created_by: user.id,
  }));

  /*
   * ---------------------------------------------------------
   * 7. Insert only new leads
   * ---------------------------------------------------------
   */

  const { data: insertedLeads, error: insertError } =
    await supabase
      .from("campaign_leads")
      .insert(rows)
      .select();

  if (insertError) {
    throw new Error(insertError.message);
  }

  /*
   * ---------------------------------------------------------
   * 8. Recalculate actual lead count
   * ---------------------------------------------------------
   */

  const { count, error: countError } =
    await supabase
      .from("campaign_leads")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("campaign_id", campaignId)
      .eq("performance_id", performanceId);

  if (countError) {
    throw new Error(countError.message);
  }

  /*
   * ---------------------------------------------------------
   * 9. Update performance
   * ---------------------------------------------------------
   */

  const {
    data: updatedPerformance,
    error: performanceError,
  } = await supabase
    .from("campaign_performance")
    .update({
      positive_leads_count: count || 0,
      updated_by: user.id,
    })
    .eq("id", performanceId)
    .select()
    .single();

  if (performanceError) {
    throw new Error(performanceError.message);
  }

  return {
    leads: insertedLeads || [],
    duplicates,
    performance: updatedPerformance,
  };
}

/**
 * Calculate campaign achievement percentage.
 */
export function calculateAchievement(
  completed,
  target
) {
  if (!target || target <= 0) {
    return 0;
  }

  return Math.round(
    (completed / target) * 100
  );
}


/**
 * Calculate potential achievement percentage.
 */
export function calculatePotentialAchievement(
  completed,
  linedUp,
  target
) {
  if (!target || target <= 0) {
    return 0;
  }

  return Math.round(
    ((completed + linedUp) / target) * 100
  );
}


/**
 * Determine campaign performance status.
 */
export function getCampaignStatus({
  completed,
  linedUp,
  target,
}) {
  if (!target || target <= 0) {
    return "BEHIND";
  }

  const achievement = calculateAchievement(
    completed,
    target
  );

  const potentialAchievement =
    calculatePotentialAchievement(
      completed,
      linedUp,
      target
    );

  if (completed >= target) {
    return "COMPLETED";
  }

  if (potentialAchievement >= 100) {
    return "ON TRACK";
  }

  if (achievement >= 50) {
    return "AT RISK";
  }

  return "BEHIND";
}


/**
 * Calculate days remaining in the selected month.
 */
export function calculateDaysRemaining(month) {
  if (!month) {
    return 0;
  }

  const start = new Date(`${month}T00:00:00`);

  const end = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0
  );

  const today = new Date();

  // Remove time component
  today.setHours(0, 0, 0, 0);

  // Selected month has already ended
  if (today > end) {
    return 0;
  }

  // Selected month hasn't started
  if (today < start) {
    return end.getDate();
  }

  return Math.max(
    0,
    Math.ceil(
      (end.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
}


/**
 * Convert raw performance data into dashboard metrics.
 */
export function buildCampaignMetrics(performance) {
  if (!performance) {
    return {
      monthlyTarget: 0,
      meetingsCompleted: 0,
      meetingsLinedUp: 0,
      positiveLeads: 0,
      achievement: 0,
      potentialAchievement: 0,
      daysRemaining: 0,
      status: "BEHIND",
    };
  }

  const monthlyTarget =
    Number(performance.monthly_target) || 0;

  const meetingsCompleted =
    Number(performance.meetings_completed) || 0;

  const meetingsLinedUp =
    Number(performance.meetings_lined_up) || 0;

  const positiveLeads =
    Number(performance.positive_leads_count) || 0;

  const achievement = calculateAchievement(
    meetingsCompleted,
    monthlyTarget
  );

  const potentialAchievement =
    calculatePotentialAchievement(
      meetingsCompleted,
      meetingsLinedUp,
      monthlyTarget
    );

  const status = getCampaignStatus({
    completed: meetingsCompleted,
    linedUp: meetingsLinedUp,
    target: monthlyTarget,
  });

  return {
    monthlyTarget,
    meetingsCompleted,
    meetingsLinedUp,
    positiveLeads,
    achievement,
    potentialAchievement,
    daysRemaining: calculateDaysRemaining(
      performance.month
    ),
    status,
  };
}

/**
 * Get campaigns with their performance for a month.
 */
export async function getMyCampaignsWithPerformance(
  month
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data: campaigns, error: campaignError } =
    await supabase
      .from("campaigns")
      .select(`
        id,
        name,
        client_name,
        manager_id,
        is_active,
        created_at
      `)
      .eq("manager_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  if (campaignError) {
    throw new Error(campaignError.message);
  }

  if (!campaigns || campaigns.length === 0) {
    return [];
  }

  const campaignIds = campaigns.map(
    (campaign) => campaign.id
  );

  const {
    data: performances,
    error: performanceError,
  } = await supabase
    .from("campaign_performance")
    .select("*")
    .in("campaign_id", campaignIds)
    .eq("month", month);

  if (performanceError) {
    throw new Error(performanceError.message);
  }

  return campaigns.map((campaign) => {
    const performance =
      performances?.find(
        (item) =>
          item.campaign_id === campaign.id
      ) || null;

    return {
      ...campaign,
      performance,
      metrics: buildCampaignMetrics(
        performance
      ),
    };
  });
}

/**
 * Get all campaign performance for CEO / Executive dashboard.
 *
 * RLS controls access:
 * - CEO can read all campaigns
 * - Managers remain restricted to their own campaigns
 */
export async function getExecutiveCampaignPerformance(month) {
  if (!month) {
    throw new Error("Month is required.");
  }

  const { data: campaigns, error: campaignError } =
    await supabase
      .from("campaigns")
      .select(`
        id,
        name,
        client_name,
        manager_id,
        is_active,
        profiles:manager_id (
          id,
          full_name
        )
      `)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

  if (campaignError) {
    throw new Error(campaignError.message);
  }

  if (!campaigns || campaigns.length === 0) {
    return [];
  }

  const campaignIds = campaigns.map(
    (campaign) => campaign.id
  );

  const {
    data: performances,
    error: performanceError,
  } = await supabase
    .from("campaign_performance")
    .select("*")
    .in("campaign_id", campaignIds)
    .eq("month", month);

  if (performanceError) {
    throw new Error(performanceError.message);
  }

  return campaigns.map((campaign) => {
    const performance =
      performances?.find(
        (item) =>
          item.campaign_id === campaign.id
      ) || null;

    const metrics =
      buildCampaignMetrics(performance);

    const profile = Array.isArray(
      campaign.profiles
    )
      ? campaign.profiles[0]
      : campaign.profiles;

    return {
      id: campaign.id,
      name: campaign.name,
      clientName: campaign.client_name,

      teamMember:
        profile?.full_name ||
        "Unknown",

      monthlyTarget:
        metrics.monthlyTarget,

      meetingsCompleted:
        metrics.meetingsCompleted,

      meetingsLinedUp:
        metrics.meetingsLinedUp,

      positiveLeads:
        metrics.positiveLeads,

      achievement:
        metrics.achievement,

      potentialAchievement:
        metrics.potentialAchievement,

      daysRemaining:
        metrics.daysRemaining,

      status:
        metrics.status,
    };
  });
}