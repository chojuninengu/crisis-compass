const GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

function getKey(): string {
    const key = import.meta.env.VITE_GROQ_API_KEY as string;
    if (!key) throw new Error("VITE_GROQ_API_KEY is not set");
    return key;
}

async function callGroq(systemPrompt: string, userContent: string): Promise<string> {
    const response = await fetch(GROQ_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getKey()}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
            ],
            temperature: 0.3,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq API error ${response.status}: ${err}`);
    }

    const json = await response.json();
    const raw: string = json.choices[0].message.content;
    // Strip markdown code fences if present
    return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

// ── assessRisk ───────────────────────────────────────────────────────────────

export interface RiskAssessmentResult {
    risk_level: "critical" | "high" | "moderate" | "stable";
    risk_rationale: string;
    recommended_actions: string[];
    follow_up_days: number;
}

export async function assessRisk(intakeData: {
    presenting_issue: string;
    crisis_history: boolean;
    crisis_history_details: string;
    support_network: string;
    urgency_self_report: number;
    case_notes: string;
}): Promise<RiskAssessmentResult> {
    const system = `You are a clinical risk assessment assistant for mental health coordinators. Analyze the intake data and return ONLY valid JSON with no markdown, no explanation, just the JSON object with keys: risk_level (critical/high/moderate/stable), risk_rationale (2-3 sentences), recommended_actions (array of 3 strings), follow_up_days (1, 3, 7, or 30).`;

    const content = JSON.stringify(intakeData, null, 2);
    const raw = await callGroq(system, content);
    const parsed = JSON.parse(raw) as RiskAssessmentResult;
    return parsed;
}

// ── summarizeNotes ───────────────────────────────────────────────────────────

export interface NotesSummaryResult {
    summary: string;
    risk_flags: string[];
    next_steps: string[];
    suggested_follow_up: string;
}

export async function summarizeNotes(rawNotes: string): Promise<NotesSummaryResult> {
    const system = `You are assisting a mental health coordinator. Summarize the case notes and return ONLY valid JSON with keys: summary (3 sentences), risk_flags (array of up to 3 strings), next_steps (array of 3 strings), suggested_follow_up (string).`;

    const raw = await callGroq(system, rawNotes);
    const parsed = JSON.parse(raw) as NotesSummaryResult;
    return parsed;
}

// ── generateReport ───────────────────────────────────────────────────────────

export interface ReportResult {
    executive_summary: string;
    risk_analysis: string;
    outcomes: string;
    recommendations: string;
}

export async function generateReport(payload: {
    org_name: string;
    start_date: string;
    end_date: string;
    total_cases: number;
    critical_count: number;
    high_count: number;
    moderate_count: number;
    stable_count: number;
    closed_count: number;
}): Promise<ReportResult> {
    const system = `Write a professional mental health services funder report. Return ONLY valid JSON with keys: executive_summary, risk_analysis, outcomes, recommendations. Each value is a full paragraph.`;

    const content = JSON.stringify(payload, null, 2);
    const raw = await callGroq(system, content);
    const parsed = JSON.parse(raw) as ReportResult;
    return parsed;
}
