import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, Brain } from "lucide-react";

const riskBadgeClass: Record<string, string> = {
  critical: "bg-risk-critical text-risk-critical-foreground",
  high: "bg-risk-high text-risk-high-foreground",
  moderate: "bg-risk-moderate text-risk-moderate-foreground",
  stable: "bg-risk-stable text-risk-stable-foreground",
};

const Intake = () => {
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
  const [result, setResult] = useState<null | {
    risk: string;
    rationale: string;
    actions: string[];
  }>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssessing(true);
    setResult(null);
    setTimeout(() => {
      const risks = ["critical", "high", "moderate", "stable"];
      const risk = urgency[0] >= 4 ? (crisisHistory ? "critical" : "high") : urgency[0] >= 3 ? "moderate" : "stable";
      setResult({
        risk,
        rationale:
          "AI analysis detected " +
          (risk === "critical" || risk === "high"
            ? "elevated distress markers including crisis history indicators, limited support infrastructure, and high self-reported urgency. Immediate coordinator review recommended."
            : "moderate distress markers with adequate support systems. Standard follow-up protocol recommended."),
        actions:
          risk === "critical" || risk === "high"
            ? [
                "Schedule crisis assessment within 24 hours",
                "Assign to senior coordinator for review",
                "Prepare safety plan template",
                "Notify clinical supervisor",
              ]
            : [
                "Schedule standard intake follow-up within 1 week",
                "Share coping resources packet",
                "Add to group therapy waitlist if appropriate",
              ],
      });
      setAssessing(false);
    }, 2500);
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
              <Label>Presenting Issue</Label>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Intake;
