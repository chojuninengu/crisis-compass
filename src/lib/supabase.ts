import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

// ── TypeScript interfaces matching the DB schema ─────────────────────────────

export interface Case {
  id: string;
  client_code: string;
  presenting_issue: string;
  risk_level: "critical" | "high" | "moderate" | "stable";
  status: "active" | "follow-up" | "closed" | "new";
  coordinator: string;
  crisis_history: boolean;
  crisis_history_details?: string;
  support_network: "none" | "limited" | "moderate" | "strong";
  urgency_self_report: number;
  case_notes?: string;
  risk_rationale?: string;
  recommended_actions?: string; // stored as JSON string
  follow_up_days?: number;
  created_at: string;
  updated_at?: string;
}

export interface CaseNoteHistory {
  id: string;
  case_id: string;
  raw_notes: string;
  ai_summary?: string;
  risk_flags?: string; // stored as JSON string
  next_steps?: string; // stored as JSON string
  suggested_follow_up?: string;
  author?: string;
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  category: string;
  contact: string;
  availability: string;
  notes?: string;
  created_at?: string;
}
