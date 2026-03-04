import supabase from "./supabase";

const PRESENTING_ISSUES = [
    "Severe anxiety with panic attacks and agoraphobia",
    "Major depressive episode following job loss",
    "PTSD from domestic violence and childhood trauma",
    "Suicidal ideation — passive, increasing frequency",
    "Alcohol use disorder with withdrawal symptoms",
    "Grief following sudden loss of spouse",
    "Bipolar II disorder — currently in depressive phase",
    "Social anxiety disorder with significant isolation",
    "Adolescent self-harm (cutting) with peer bullying",
    "Caregiver burnout and compassion fatigue",
    "Acute stress reaction after vehicle accident",
    "Chronic insomnia with generalized anxiety",
    "Opioid use disorder, seeking harm reduction support",
    "Psychosis — first episode, unmedicated",
    "Eating disorder (restriction) with medical risk",
];

const RATIONALES = [
    "Multiple high-severity markers detected including crisis history, limited social support, and high self-reported urgency. Immediate coordinator review is required to ensure client safety.",
    "Intake language suggests moderate distress with some protective factors present. Support network is underutilized. Follow-up within 3 days is recommended.",
    "Client presents significant risk markers including active suicidal ideation and absence of a safety plan. Crisis intervention protocol should be initiated immediately.",
    "Recent trauma exposure combined with lack of coping resources and social isolation elevates risk. Structured outpatient support and warm handoff to clinical team recommended.",
    "Stable presentation with adequate support network. Low immediate risk but vulnerability to relapse noted. Maintain current treatment plan with monthly check-ins.",
];

const ACTION_SETS = [
    ["Schedule crisis assessment within 24 hours", "Notify clinical supervisor", "Prepare safety plan template"],
    ["Schedule follow-up call within 48 hours", "Share coping resources packet", "Add to group therapy waitlist"],
    ["Continue current treatment plan", "Monitor at next monthly check-in", "Encourage peer support engagement"],
    ["Immediate outreach required", "Assign to senior coordinator", "Warm handoff to clinical team"],
    ["Refer to specialist for psychiatric evaluation", "Coordinate with case manager", "Schedule bi-weekly check-ins"],
];

const CASES_DATA = [
    // 3 critical
    { risk_level: "critical", status: "active", coordinator: "Sarah M.", support_network: "none", urgency: 5, crisis_history: true, follow_up_days: 1, issue_idx: 3, rationale_idx: 2, action_idx: 3 },
    { risk_level: "critical", status: "follow-up", coordinator: "James K.", support_network: "none", urgency: 5, crisis_history: true, follow_up_days: 1, issue_idx: 13, rationale_idx: 2, action_idx: 0 },
    { risk_level: "critical", status: "active", coordinator: "Sarah M.", support_network: "limited", urgency: 5, crisis_history: true, follow_up_days: 1, issue_idx: 8, rationale_idx: 3, action_idx: 3 },
    // 4 high
    { risk_level: "high", status: "active", coordinator: "James K.", support_network: "limited", urgency: 4, crisis_history: true, follow_up_days: 3, issue_idx: 0, rationale_idx: 0, action_idx: 0 },
    { risk_level: "high", status: "follow-up", coordinator: "Sarah M.", support_network: "limited", urgency: 4, crisis_history: false, follow_up_days: 3, issue_idx: 5, rationale_idx: 3, action_idx: 4 },
    { risk_level: "high", status: "active", coordinator: "James K.", support_network: "none", urgency: 4, crisis_history: true, follow_up_days: 3, issue_idx: 14, rationale_idx: 0, action_idx: 0 },
    { risk_level: "high", status: "follow-up", coordinator: "Sarah M.", support_network: "limited", urgency: 4, crisis_history: false, follow_up_days: 3, issue_idx: 12, rationale_idx: 3, action_idx: 4 },
    // 5 moderate
    { risk_level: "moderate", status: "active", coordinator: "James K.", support_network: "moderate", urgency: 3, crisis_history: false, follow_up_days: 7, issue_idx: 1, rationale_idx: 1, action_idx: 1 },
    { risk_level: "moderate", status: "follow-up", coordinator: "Sarah M.", support_network: "moderate", urgency: 3, crisis_history: false, follow_up_days: 7, issue_idx: 6, rationale_idx: 1, action_idx: 1 },
    { risk_level: "moderate", status: "new", coordinator: "James K.", support_network: "limited", urgency: 3, crisis_history: false, follow_up_days: 7, issue_idx: 10, rationale_idx: 1, action_idx: 1 },
    { risk_level: "moderate", status: "active", coordinator: "Sarah M.", support_network: "moderate", urgency: 3, crisis_history: true, follow_up_days: 7, issue_idx: 2, rationale_idx: 3, action_idx: 4 },
    { risk_level: "moderate", status: "follow-up", coordinator: "James K.", support_network: "moderate", urgency: 2, crisis_history: false, follow_up_days: 7, issue_idx: 11, rationale_idx: 1, action_idx: 1 },
    // 3 stable
    { risk_level: "stable", status: "closed", coordinator: "Sarah M.", support_network: "strong", urgency: 1, crisis_history: false, follow_up_days: 30, issue_idx: 7, rationale_idx: 4, action_idx: 2 },
    { risk_level: "stable", status: "closed", coordinator: "James K.", support_network: "strong", urgency: 2, crisis_history: false, follow_up_days: 30, issue_idx: 9, rationale_idx: 4, action_idx: 2 },
    { risk_level: "stable", status: "closed", coordinator: "Sarah M.", support_network: "strong", urgency: 1, crisis_history: false, follow_up_days: 30, issue_idx: 4, rationale_idx: 4, action_idx: 2 },
] as const;

export async function seedDemoCases(): Promise<void> {
    const now = new Date();

    const records = CASES_DATA.map((c, i) => {
        const daysBack = Math.floor(Math.random() * 60) + 1;
        const createdAt = new Date(now);
        createdAt.setDate(createdAt.getDate() - daysBack);

        let updatedAt: Date | null = null;
        if (c.status === "closed") {
            updatedAt = new Date(createdAt);
            updatedAt.setDate(updatedAt.getDate() + Math.floor(Math.random() * 20) + 5);
        }

        const padded = String(i + 1).padStart(3, "0");
        return {
            client_code: `DEMO-${padded}`,
            presenting_issue: PRESENTING_ISSUES[c.issue_idx],
            risk_level: c.risk_level,
            status: c.status,
            coordinator: c.coordinator,
            crisis_history: c.crisis_history,
            support_network: c.support_network,
            urgency_self_report: c.urgency,
            case_notes: "Demo case generated for testing purposes.",
            risk_rationale: RATIONALES[c.rationale_idx],
            recommended_actions: JSON.stringify(ACTION_SETS[c.action_idx]),
            follow_up_days: c.follow_up_days,
            created_at: createdAt.toISOString(),
            updated_at: updatedAt?.toISOString() ?? createdAt.toISOString(),
        };
    });

    const { error } = await supabase.from("cases").insert(records);
    if (error) throw new Error(`Failed to seed cases: ${error.message}`);
}
