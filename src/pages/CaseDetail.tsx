import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { mockCases } from "@/data/mockData";
import { ArrowLeft, Brain, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

const riskBadgeClass: Record<string, string> = {
  critical: "bg-risk-critical text-risk-critical-foreground",
  high: "bg-risk-high text-risk-high-foreground",
  moderate: "bg-risk-moderate text-risk-moderate-foreground",
  stable: "bg-risk-stable text-risk-stable-foreground",
};

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseData = mockCases.find((c) => c.id === id);
  const [newNote, setNewNote] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [notes, setNotes] = useState(caseData?.note_history ?? []);

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

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      { text: newNote, timestamp: new Date().toISOString().split("T")[0], author: "Maya Torres" },
      ...prev,
    ]);
    setNewNote("");
  };

  const handleSummarize = () => {
    setSummarizing(true);
    setTimeout(() => {
      setSummarizing(false);
      setNewNote(
        "AI Summary: Client shows signs of improvement with reduced anxiety scores. Continues to engage with support network. Recommend maintaining current treatment plan with bi-weekly check-ins."
      );
    }, 2000);
  };

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
        <Badge className={`ml-auto ${riskBadgeClass[caseData.risk_level]} text-sm px-3 py-1`}>
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
                ["Date Opened", caseData.date],
                ["Urgency", `${caseData.urgency}/5`],
                ["Support Network", caseData.support_network],
                ["Crisis History", caseData.crisis_history ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium mt-0.5">{value}</dd>
                </div>
              ))}
              {caseData.crisis_details && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Crisis Details</dt>
                  <dd className="font-medium mt-0.5">{caseData.crisis_details}</dd>
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
            <p className="text-sm leading-relaxed">{caseData.ai_rationale}</p>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Recommended Actions
              </p>
              <ul className="space-y-2">
                {caseData.recommended_actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <Button size="sm" variant="outline" onClick={handleSummarize} disabled={summarizing}>
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
            {notes.map((note, i) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{note.author}</span>
                  <span className="text-xs text-muted-foreground">{note.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{note.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseDetail;
