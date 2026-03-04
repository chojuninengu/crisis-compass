import supabase, { type Case, type CaseNoteHistory, type Resource } from "./supabase";

// ── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
    try {
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [activeRes, criticalHighRes, followUpRes, closedMonthRes] = await Promise.all([
            supabase.from("cases").select("id", { count: "exact", head: true }).neq("status", "closed"),
            supabase.from("cases").select("id", { count: "exact", head: true }).in("risk_level", ["critical", "high"]),
            supabase.from("cases").select("id", { count: "exact", head: true }).eq("status", "follow-up"),
            supabase
                .from("cases")
                .select("id", { count: "exact", head: true })
                .eq("status", "closed")
                .gte("updated_at", firstOfMonth),
        ]);

        return {
            totalActive: activeRes.count ?? 0,
            criticalAndHigh: criticalHighRes.count ?? 0,
            followUpsDue: followUpRes.count ?? 0,
            closedThisMonth: closedMonthRes.count ?? 0,
        };
    } catch {
        return null;
    }
}

// ── Cases ────────────────────────────────────────────────────────────────────

export async function getCases(filters?: {
    risk_level?: string;
    status?: string;
    search?: string;
}): Promise<Case[]> {
    try {
        let query = supabase.from("cases").select("*").order("created_at", { ascending: false });

        if (filters?.risk_level && filters.risk_level !== "all") {
            query = query.eq("risk_level", filters.risk_level);
        }
        if (filters?.status && filters.status !== "all") {
            query = query.eq("status", filters.status);
        }
        if (filters?.search) {
            const s = filters.search;
            query = query.or(
                `client_code.ilike.%${s}%,presenting_issue.ilike.%${s}%,coordinator.ilike.%${s}%`
            );
        }

        const { data, error } = await query;
        if (error) throw error;
        return data ?? [];
    } catch {
        return [];
    }
}

export async function getCaseById(id: string): Promise<(Case & { note_history: CaseNoteHistory[] }) | null> {
    try {
        const [caseRes, notesRes] = await Promise.all([
            supabase.from("cases").select("*").eq("id", id).single(),
            supabase
                .from("case_note_history")
                .select("*")
                .eq("case_id", id)
                .order("created_at", { ascending: false }),
        ]);

        if (caseRes.error) throw caseRes.error;
        return { ...caseRes.data, note_history: notesRes.data ?? [] };
    } catch {
        return null;
    }
}

export async function createCase(data: Partial<Case>): Promise<Case | null> {
    try {
        const { data: created, error } = await supabase.from("cases").insert(data).select().single();
        if (error) throw error;
        return created;
    } catch {
        return null;
    }
}

export async function updateCase(id: string, data: Partial<Case>): Promise<Case | null> {
    try {
        const { data: updated, error } = await supabase
            .from("cases")
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return updated;
    } catch {
        return null;
    }
}

// ── Case Note History ────────────────────────────────────────────────────────

export async function addCaseNote(
    caseId: string,
    rawNotes: string,
    aiSummary: string
): Promise<CaseNoteHistory | null> {
    try {
        const { data, error } = await supabase
            .from("case_note_history")
            .insert({ case_id: caseId, raw_notes: rawNotes, ai_summary: aiSummary })
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch {
        return null;
    }
}

// ── Resources ────────────────────────────────────────────────────────────────

export async function getResources(): Promise<Resource[]> {
    try {
        const { data, error } = await supabase.from("resources").select("*").order("name");
        if (error) throw error;
        return data ?? [];
    } catch {
        return [];
    }
}

export async function addResource(data: Omit<Resource, "id" | "created_at">): Promise<Resource | null> {
    try {
        const { data: created, error } = await supabase.from("resources").insert(data).select().single();
        if (error) throw error;
        return created;
    } catch {
        return null;
    }
}
