import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDashboardStats } from "@/lib/api";
import { generateReport } from "@/lib/groq";

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

  useEffect(() => {
    document.title = "Reports — CrisisCompass";
  }, []);

  const handleGenerate = async () => {
    if (!orgName.trim() || !startDate || !endDate) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Organization Name, Start Date, and End Date.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setReport(null);

    try {
      const stats = await getDashboardStats();
      const total = (stats?.totalActive ?? 0) + (stats?.closedThisMonth ?? 0);

      const result = await generateReport({
        org_name: orgName,
        start_date: startDate,
        end_date: endDate,
        total_cases: total,
        critical_count: 0,
        high_count: stats?.criticalAndHigh ?? 0,
        moderate_count: 0,
        stable_count: 0,
        closed_count: stats?.closedThisMonth ?? 0,
      });

      setReport({
        executive: result.executive_summary,
        risk: result.risk_analysis,
        outcomes: result.outcomes,
        recommendations: result.recommendations,
      });
    } catch {
      toast({
        title: "Report generation failed",
        description: "Groq AI could not generate the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    const text = `Executive Summary\n${report.executive}\n\nRisk Analysis\n${report.risk}\n\nOutcomes\n${report.outcomes}\n\nRecommendations\n${report.recommendations}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate grant-ready reports with AI</p>
      </div>

      <Card className="no-print">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Organization Name *</Label>
            <Input placeholder="Your organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating report with AI…
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card id="print-report">
          <CardHeader className="flex flex-row items-center justify-between no-print">
            <CardTitle className="text-base">Report Preview</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" /> Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="print-header hidden">
              <h1 className="text-xl font-bold">Grant Report — {orgName}</h1>
              <p className="text-sm text-gray-600">
                Period: {startDate} to {endDate}
              </p>
            </div>
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

      {/* Print stylesheet */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-report, #print-report * { visibility: visible; }
          #print-report { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-header { display: block !important; margin-bottom: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
