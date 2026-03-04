import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getCaseById, addCaseNote } from "@/lib/api";
import { summarizeNotes } from "@/lib/groq";
import type { Case, CaseNoteHistory } from "@/lib/supabase";
import { ArrowLeft, Brain, Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const riskBadgeClass: Record<string, string> = {
  critical: "bg-risk-critical text-risk-critical-foreground",
  high: "bg-risk-high text-risk-high-foreground",
  moderate: "bg-risk-moderate text-risk-moderate-foreground",
  stable: "bg-risk-stable text-risk-stable-foreground",
};

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [caseData, setCaseData] = useState<(Case & { note_history: CaseNoteHistory[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<{
    summary: string;
    risk_flags: string[];
    next_steps: string[];
    suggested_follow_up: string;
  } | null>(null);

  useEffect(() => {
    document.title = "Case Detail — CrisisCompass";
    if (!id) return;

    (async () => {
      const data = await getCaseById(id);
      setCaseData(data);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (caseData) {
      document.title = `${caseData.client_code} — CrisisCompass`;
    }
  }, [caseData]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return;
    const saved = await addCaseNote(id, newNote, "");
    if (saved) {
      setCaseData((prev) =>
        prev ? { ...prev, note_history: [saved, ...prev.note_history] } : prev
      );
      setNewNote("");
      toast({ title: "Note added" });
    } else {
      toast({ title: "Failed to save note", variant: "destructive" });
    }
  };

  const handleSummarize = async () => {
    if (!newNote.trim() || !id) return;
    setSummarizing(true);
    setAiSummaryResult(null);
    try {
      const result = await summarizeNotes(newNote);
      setAiSummaryResult(result);

      // Save to Supabase
      const saved = await addCaseNote(id, newNote, result.summary);
      if (saved) {
        setCaseData((prev) =>
          prev ? { ...prev, note_history: [saved, ...prev.note_history] } : prev
        );
        setNewNote("");
        toast({ title: "Note summarized and saved!" });
      }
    } catch {
      toast({ title: "AI summarization failed. Try again.", variant: "destructive" });
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">Case not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/cases")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cases
        </Button>
      </div>
    );
  }

  let parsedActions: string[] = [];
  try {
    if (caseData.recommended_actions) {
      parsedActions = JSON.parse(caseData.recommended_actions);
    }
  } catch {
    parsedActions = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/cases")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{caseData.client_code}</h2>
          <p className="text-sm text-muted-foreground">{caseData.presenting_issue}</p>
        </div>
        <Badge className={`ml-auto ${riskBadgeClass[caseData.risk_level] ?? ""} text-sm px-3 py-1`}>
          {caseData.risk_level}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Case Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                ["Status", caseData.status],
                ["Coordinator", caseData.coordinator],
                ["Date Opened", caseData.created_at ? new Date(caseData.created_at).toLocaleDateString() : "—"],
                ["Urgency", `${caseData.urgency_self_report}/5`],
                ["Support Network", caseData.support_network],
                ["Crisis History", caseData.crisis_history ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium mt-0.5">{value}</dd>
                </div>
              ))}
              {caseData.crisis_history_details && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Crisis Details</dt>
                  <dd className="font-medium mt-0.5">{caseData.crisis_history_details}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* AI Risk Panel */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> AI Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseData.risk_rationale ? (
              <p className="text-sm leading-relaxed">{caseData.risk_rationale}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No AI assessment available.</p>
            )}
            {parsedActions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Recommended Actions
                </p>
                <ul className="space-y-2">
                  {parsedActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Summary Result */}
      {aiSummaryResult && (
        <Card className="border-teal-500/30 bg-teal-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" /> AI Note Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="leading-relaxed">{aiSummaryResult.summary}</p>
            {aiSummaryResult.risk_flags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Risk Flags</p>
                <ul className="space-y-1">
                  {aiSummaryResult.risk_flags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-risk-high mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {aiSummaryResult.next_steps.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Next Steps</p>
                <ul className="space-y-1">
                  {aiSummaryResult.next_steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-muted-foreground">
              <span className="font-medium">Suggested follow-up:</span> {aiSummaryResult.suggested_follow_up}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Case Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Add a new note…"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                Add Note
              </Button>
              <Button size="sm" variant="outline" onClick={handleSummarize} disabled={summarizing || !newNote.trim()}>
                {summarizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" /> Summarizing…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" /> Summarize with AI
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            {(caseData.note_history ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
            ) : (
              caseData.note_history.map((note, i) => (
                <div key={note.id ?? i} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{note.author ?? "Coordinator"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {note.ai_summary ? (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-primary">AI Summary: </span>
                      {note.ai_summary}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">{note.raw_notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseDetail;
