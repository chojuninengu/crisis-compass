import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, Brain, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assessRisk } from "@/lib/groq";
import { createCase } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const riskBadgeClass: Record<string, string> = {
  critical: "bg-risk-critical text-risk-critical-foreground",
  high: "bg-risk-high text-risk-high-foreground",
  moderate: "bg-risk-moderate text-risk-moderate-foreground",
  stable: "bg-risk-stable text-risk-stable-foreground",
};

const Intake = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clientCode] = useState(() => {
    const num = Math.floor(Math.random() * 900) + 100;
    return `CC-2026-${num}`;
  });
  const [presentingIssue, setPresentingIssue] = useState("");
  const [crisisHistory, setCrisisHistory] = useState(false);
  const [crisisDetails, setCrisisDetails] = useState("");
  const [supportNetwork, setSupportNetwork] = useState("");
  const [urgency, setUrgency] = useState([3]);
  const [coordinator, setCoordinator] = useState("");
  const [caseNotes, setCaseNotes] = useState("");
  const [assessing, setAssessing] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    risk: string;
    rationale: string;
    actions: string[];
  }>(null);

  useEffect(() => {
    document.title = "New Case Intake — CrisisCompass";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presentingIssue.trim()) return;

    setAssessing(true);
    setResult(null);
    setSavedCaseId(null);

    let riskLevel: "critical" | "high" | "moderate" | "stable" = "moderate";
    let rationale = "";
    let actions: string[] = [];
    let followUpDays = 7;

    // 1. Call Groq AI
    try {
      const aiResult = await assessRisk({
        presenting_issue: presentingIssue,
        crisis_history: crisisHistory,
        crisis_history_details: crisisDetails,
        support_network: supportNetwork || "unknown",
        urgency_self_report: urgency[0],
        case_notes: caseNotes,
      });
      riskLevel = aiResult.risk_level;
      rationale = aiResult.risk_rationale;
      actions = aiResult.recommended_actions;
      followUpDays = aiResult.follow_up_days;
    } catch {
      toast({
        title: "AI assessment unavailable",
        description: "Case saved with moderate risk. Please review manually.",
        variant: "destructive",
      });
      rationale = "AI assessment could not be completed. Please assess risk manually.";
      actions = ["Review case manually", "Schedule follow-up", "Assign coordinator"];
    }

    setResult({ risk: riskLevel, rationale, actions });

    // 2. Save to Supabase
    const saved = await createCase({
      client_code: clientCode,
      presenting_issue: presentingIssue,
      risk_level: riskLevel,
      status: "new",
      coordinator: coordinator || "Unassigned",
      crisis_history: crisisHistory,
      crisis_history_details: crisisDetails,
      support_network: (supportNetwork as "none" | "limited" | "moderate" | "strong") || "limited",
      urgency_self_report: urgency[0],
      case_notes: caseNotes,
      risk_rationale: rationale,
      recommended_actions: JSON.stringify(actions),
      follow_up_days: followUpDays,
      created_at: new Date().toISOString(),
    });

    if (saved) {
      setSavedCaseId(saved.id);
      toast({ title: "Case saved successfully!" });
    } else {
      toast({ title: "Failed to save case to database", variant: "destructive" });
    }

    setAssessing(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">New Case Intake</h2>
        <p className="text-sm text-muted-foreground mt-1">Complete the intake form to create a new case</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Code</Label>
                <Input value={clientCode} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Assigned Coordinator</Label>
                <Input
                  placeholder="Coordinator name"
                  value={coordinator}
                  onChange={(e) => setCoordinator(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Presenting Issue *</Label>
              <Textarea
                placeholder="Describe the client's primary presenting concern…"
                value={presentingIssue}
                onChange={(e) => setPresentingIssue(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch checked={crisisHistory} onCheckedChange={setCrisisHistory} />
                <Label>Crisis History</Label>
              </div>
              {crisisHistory && (
                <Textarea
                  placeholder="Provide details about crisis history…"
                  value={crisisDetails}
                  onChange={(e) => setCrisisDetails(e.target.value)}
                  rows={2}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Support Network</Label>
                <Select value={supportNetwork} onValueChange={setSupportNetwork}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urgency Level: {urgency[0]}/5</Label>
                <Slider min={1} max={5} step={1} value={urgency} onValueChange={setUrgency} className="mt-3" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Case Notes</Label>
              <Textarea
                placeholder="Additional notes…"
                value={caseNotes}
                onChange={(e) => setCaseNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={assessing || !presentingIssue.trim()}>
              {assessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Assessing risk with AI…
                </>
              ) : (
                "Assess & Save Case"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> AI Risk Assessment Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Risk Level:</span>
              <Badge className={`${riskBadgeClass[result.risk]} text-sm px-3 py-1`}>
                {result.risk}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed">{result.rationale}</p>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Recommended Actions
              </p>
              <ul className="space-y-2">
                {result.actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            {savedCaseId && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => navigate(`/cases/${savedCaseId}`)}
              >
                <Eye className="w-4 h-4 mr-1" /> View Case
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Intake;
