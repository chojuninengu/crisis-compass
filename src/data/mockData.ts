export type RiskLevel = "critical" | "high" | "moderate" | "stable";
export type CaseStatus = "active" | "follow-up" | "closed" | "new";

export interface CaseRecord {
  id: string;
  client_code: string;
  presenting_issue: string;
  risk_level: RiskLevel;
  status: CaseStatus;
  coordinator: string;
  date: string;
  crisis_history: boolean;
  crisis_details?: string;
  support_network: "none" | "limited" | "moderate" | "strong";
  urgency: number;
  notes: string;
  ai_rationale: string;
  recommended_actions: string[];
  note_history: { text: string; timestamp: string; author: string }[];
}

export interface Resource {
  id: string;
  name: string;
  category: string;
  contact: string;
  availability: string;
  notes: string;
}

const coordinators = ["Dr. Maya Torres", "James Okafor", "Lin Zhang", "Priya Sharma", "Alex Rivera"];
const issues = [
  "Severe anxiety with panic attacks",
  "Major depressive episode",
  "PTSD from domestic violence",
  "Suicidal ideation — passive",
  "Substance use disorder (alcohol)",
  "Grief and bereavement",
  "Bipolar II — depressive phase",
  "Social anxiety and isolation",
  "Adolescent self-harm",
  "Caregiver burnout and depression",
  "Acute stress reaction",
  "Chronic insomnia with anxiety",
];

const rationales = [
  "NLP analysis detected multiple crisis indicators including references to hopelessness, sleep disruption >2 weeks, and withdrawal from support network. Historical pattern shows escalation during seasonal transitions.",
  "Intake language suggests moderate distress. Support network is present but underutilized. No immediate safety concerns detected, but follow-up within 48 hours recommended.",
  "Client presents with stable mood but limited coping strategies. AI assessment indicates low immediate risk but elevated vulnerability to relapse without continued support.",
  "Multiple high-severity markers detected: crisis history, limited support network, urgency self-rating of 4/5. Immediate coordinator review recommended.",
];

const actionSets = [
  ["Schedule crisis assessment within 24 hours", "Notify supervisor", "Prepare safety plan template", "Connect with crisis hotline"],
  ["Schedule follow-up within 48 hours", "Share coping resources", "Consider group therapy referral"],
  ["Continue current treatment plan", "Monitor at next check-in", "Encourage peer support engagement"],
  ["Immediate outreach required", "Assign to senior coordinator", "Prepare warm handoff to clinical team", "Document in incident log"],
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCode(i: number): string {
  return `CC-2026-${String(i).padStart(3, "0")}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function timeAgo(n: number): string {
  if (n === 0) return "Today";
  if (n === 1) return "Yesterday";
  if (n < 7) return `${n} days ago`;
  if (n < 30) return `${Math.floor(n / 7)} weeks ago`;
  return `${Math.floor(n / 30)} months ago`;
}

export function generateCases(count: number = 25): CaseRecord[] {
  const riskLevels: RiskLevel[] = ["critical", "high", "moderate", "stable"];
  const statuses: CaseStatus[] = ["active", "follow-up", "closed", "new"];
  const networks: CaseRecord["support_network"][] = ["none", "limited", "moderate", "strong"];

  return Array.from({ length: count }, (_, i) => {
    const risk = randomFrom(riskLevels);
    const daysBack = Math.floor(Math.random() * 90);
    return {
      id: `case-${i + 1}`,
      client_code: generateCode(i + 1),
      presenting_issue: randomFrom(issues),
      risk_level: risk,
      status: randomFrom(statuses),
      coordinator: randomFrom(coordinators),
      date: daysAgo(daysBack),
      crisis_history: Math.random() > 0.6,
      crisis_details: Math.random() > 0.5 ? "Previous crisis intervention in 2025. Hospitalization for 72-hour hold." : undefined,
      support_network: randomFrom(networks),
      urgency: Math.floor(Math.random() * 5) + 1,
      notes: "Initial intake completed. Client consented to AI-assisted risk assessment.",
      ai_rationale: randomFrom(rationales),
      recommended_actions: randomFrom(actionSets),
      note_history: [
        { text: "Intake form completed via online portal.", timestamp: daysAgo(daysBack), author: randomFrom(coordinators) },
        { text: "Initial risk assessment performed. AI flagged for review.", timestamp: daysAgo(Math.max(0, daysBack - 1)), author: "AI System" },
        ...(Math.random() > 0.5 ? [{ text: "Follow-up call completed. Client stable.", timestamp: daysAgo(Math.max(0, daysBack - 3)), author: randomFrom(coordinators) }] : []),
      ],
    };
  });
}

export const mockCases = generateCases(25);

export const mockResources: Resource[] = [
  { id: "r1", name: "City Crisis Hotline", category: "Crisis", contact: "1-800-555-0199", availability: "24/7", notes: "Primary crisis line for metro area" },
  { id: "r2", name: "Harbor House Shelter", category: "Housing", contact: "shelter@harbor.org", availability: "Intake M-F 9-5", notes: "Women and children only" },
  { id: "r3", name: "Community Mental Health Center", category: "Outpatient", contact: "(555) 234-5678", availability: "M-F 8am-6pm", notes: "Sliding scale fees available" },
  { id: "r4", name: "NAMI Support Group", category: "Peer Support", contact: "nami-local@groups.org", availability: "Tuesdays 7pm", notes: "Open to all, virtual option" },
  { id: "r5", name: "Sunrise Detox Center", category: "Substance Use", contact: "(555) 876-5432", availability: "24/7 intake", notes: "Accepts Medicaid" },
  { id: "r6", name: "Youth & Family Services", category: "Youth", contact: "(555) 345-6789", availability: "M-F 9-5", notes: "Ages 12-24" },
];

export { timeAgo, daysAgo };
