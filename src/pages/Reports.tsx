import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();
  const [orgName, setOrgName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<null | {
    executive: string;
    risk: string;
    outcomes: string;
    recommendations: string;
  }>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setReport(null);
    setTimeout(() => {
      setReport({
        executive: `${orgName || "Organization"} served 487 unique clients during the reporting period (${startDate || "2026-01-01"} to ${endDate || "2026-03-01"}). Case volume increased 12% compared to the previous quarter, with notable growth in adolescent referrals. Average time-to-first-contact was 2.3 business days, meeting the target benchmark of <3 days.`,
        risk: `Risk distribution: 8% Critical, 15% High, 42% Moderate, 35% Stable. Critical cases decreased 3% from the prior period. The AI triage system flagged 94% of eventually-escalated cases at intake, with a false-positive rate of 11%. Top presenting issues: anxiety disorders (28%), depressive episodes (22%), substance use (15%).`,
        outcomes: `Case resolution rate: 67% of cases opened during the period reached stable status or were successfully closed. Average case duration: 34 days. Client satisfaction scores averaged 4.2/5. 89% of high-risk clients received follow-up within the 48-hour target window.`,
        recommendations: `1. Expand crisis intervention capacity — demand exceeded availability on 23% of critical-flag days. 2. Implement peer support program to address "limited support network" factor present in 41% of high-risk intakes. 3. Increase coordinator staffing ratio from 1:100 to 1:75 to reduce follow-up delays. 4. Continue AI triage integration with quarterly model review.`,
      });
      setGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    if (!report) return;
    const text = `Executive Summary\n${report.executive}\n\nRisk Analysis\n${report.risk}\n\nOutcomes\n${report.outcomes}\n\nRecommendations\n${report.recommendations}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleDownload = () => {
    if (!report) return;
    const text = `GRANT REPORT — ${orgName || "Organization"}\nPeriod: ${startDate} to ${endDate}\n\n== Executive Summary ==\n${report.executive}\n\n== Risk Analysis ==\n${report.risk}\n\n== Outcomes ==\n${report.outcomes}\n\n== Recommendations ==\n${report.recommendations}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grant-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate grant-ready reports with AI</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input placeholder="Your organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating Report…
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Report Preview</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { title: "Executive Summary", content: report.executive },
              { title: "Risk Analysis", content: report.risk },
              { title: "Outcomes", content: report.outcomes },
              { title: "Recommendations", content: report.recommendations },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-sm text-foreground mb-2">{section.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
