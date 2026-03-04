export type RiskLevel = "high" | "medium" | "low";
export type CaseStatus = "active" | "intake" | "follow-up" | "closed";

export interface CaseRecord {
  id: string;
  clientId: string;
  age: number;
  gender: string;
  riskLevel: RiskLevel;
  status: CaseStatus;
  primaryConcern: string;
  lastContact: string;
  assignedTo: string;
  intakeDate: string;
  flagReason?: string;
}

const concerns = [
  "Depression & anxiety",
  "Substance use disorder",
  "PTSD / trauma",
  "Suicidal ideation",
  "Grief & loss",
  "Family conflict",
  "Eating disorder",
  "Bipolar disorder",
  "Chronic stress / burnout",
  "Social isolation",
  "Self-harm behavior",
  "Panic disorder",
  "OCD",
  "Adjustment disorder",
  "Housing instability & distress",
];

const staff = ["Dr. Amara Chen", "James Okafor", "Maria Santos", "Dr. Leah Kim", "Raj Patel"];
const genders = ["Male", "Female", "Non-binary"];
const flagReasons = [
  "PHQ-9 score ≥ 20 — severe depression",
  "Missed 3 consecutive appointments",
  "Reported SI in last session",
  "Substance relapse indicated",
  "Crisis call logged within 48h",
  "GAD-7 score ≥ 15 — severe anxiety",
];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString()
    .split("T")[0];
}

function generateCase(i: number): CaseRecord {
  const riskRoll = Math.random();
  const riskLevel: RiskLevel = riskRoll < 0.12 ? "high" : riskRoll < 0.4 ? "medium" : "low";
  const statusRoll = Math.random();
  const status: CaseStatus =
    statusRoll < 0.5 ? "active" : statusRoll < 0.7 ? "follow-up" : statusRoll < 0.85 ? "intake" : "closed";

  return {
    id: `CASE-${String(i).padStart(4, "0")}`,
    clientId: `CLT-${String(1000 + i)}`,
    age: 16 + Math.floor(Math.random() * 55),
    gender: genders[Math.floor(Math.random() * genders.length)],
    riskLevel,
    status,
    primaryConcern: concerns[Math.floor(Math.random() * concerns.length)],
    lastContact: randomDate(new Date("2025-12-01"), new Date("2026-03-03")),
    assignedTo: staff[Math.floor(Math.random() * staff.length)],
    intakeDate: randomDate(new Date("2024-06-01"), new Date("2026-02-01")),
    flagReason: riskLevel === "high" ? flagReasons[Math.floor(Math.random() * flagReasons.length)] : undefined,
  };
}

export const mockCases: CaseRecord[] = Array.from({ length: 500 }, (_, i) => generateCase(i + 1));

export const dashboardStats = {
  totalActive: mockCases.filter((c) => c.status !== "closed").length,
  highRisk: mockCases.filter((c) => c.riskLevel === "high").length,
  pendingIntake: mockCases.filter((c) => c.status === "intake").length,
  avgCaseload: Math.round(mockCases.filter((c) => c.status === "active").length / staff.length),
  staffCount: staff.length,
  closedThisMonth: mockCases.filter((c) => c.status === "closed").length,
};

export const utilizationData = [
  { service: "Individual Therapy", count: 187, capacity: 220 },
  { service: "Group Sessions", count: 64, capacity: 80 },
  { service: "Crisis Hotline", count: 43, capacity: 50 },
  { service: "Psychiatry Consult", count: 31, capacity: 40 },
  { service: "Peer Support", count: 92, capacity: 120 },
  { service: "Case Management", count: 145, capacity: 160 },
];
