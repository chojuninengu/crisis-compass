import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertTriangle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getCases } from "@/lib/api";
import { seedDemoCases } from "@/lib/seedData";
import { useToast } from "@/hooks/use-toast";
import type { Case } from "@/lib/supabase";

const riskColors: Record<string, string> = {
  critical: "hsl(0, 72%, 51%)",
  high: "hsl(25, 95%, 53%)",
  moderate: "hsl(45, 93%, 47%)",
  stable: "hsl(152, 69%, 41%)",
};

const riskBadgeClass: Record<string, string> = {
  critical: "bg-risk-critical text-risk-critical-foreground",
  high: "bg-risk-high text-risk-high-foreground",
  moderate: "bg-risk-moderate text-risk-moderate-foreground",
  stable: "bg-risk-stable text-risk-stable-foreground",
};

const statusBadgeClass: Record<string, string> = {
  active: "bg-primary/15 text-primary border-primary/30",
  "follow-up": "bg-risk-moderate/15 text-risk-moderate border-risk-moderate/30",
  closed: "bg-muted text-muted-foreground border-border",
  new: "bg-secondary text-secondary-foreground border-secondary",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [statsLoading, setStatsLoading] = useState(true);
  const [casesLoading, setCasesLoading] = useState(true);
  const [error, setError] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [stats, setStats] = useState({ totalActive: 0, criticalAndHigh: 0, followUpsDue: 0, closedThisMonth: 0 });
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    document.title = "Dashboard — CrisisCompass";
  }, []);

  const loadData = useCallback(async () => {
    setStatsLoading(true);
    setCasesLoading(true);
    setError(false);

    const [statsData, casesData] = await Promise.all([getDashboardStats(), getCases()]);

    if (!statsData) {
      setError(true);
    } else {
      setStats(statsData);
    }
    setStatsLoading(false);

    setCases(casesData ?? []);
    setCasesLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const riskData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, moderate: 0, stable: 0 };
    cases.forEach((c) => {
      if (counts[c.risk_level] !== undefined) counts[c.risk_level]++;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [cases]);

  const recentCases = cases.slice(0, 6);

  const statCards = [
    { label: "Total Active Cases", value: stats.totalActive, icon: Users, accent: "text-primary" },
    { label: "Critical + High Risk", value: stats.criticalAndHigh, icon: AlertTriangle, accent: "text-risk-critical" },
    { label: "Follow-ups Due", value: stats.followUpsDue, icon: Clock, accent: "text-risk-moderate" },
    { label: "Closed This Month", value: stats.closedThisMonth, icon: CheckCircle, accent: "text-risk-stable" },
  ];

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedDemoCases();
      toast({ title: "Demo data loaded successfully!" });
      loadData();
    } catch {
      toast({ title: "Failed to load demo data", variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">Could not load data.</p>
        <Button variant="ghost" className="mt-4" onClick={loadData}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Overview of your organization's caseload</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleSeedData} disabled={seeding} className="text-xs">
          {seeding ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Loading…</> : "Load Demo Data"}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{s.value}</p>
                  )}
                </div>
                <s.icon className={`w-8 h-8 ${s.accent} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {casesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-48 w-48 rounded-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskData.map((entry) => (
                        <Cell key={entry.name} fill={riskColors[entry.name.toLowerCase()]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Cases</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Issue</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {casesLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : recentCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No cases yet. Load demo data to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentCases.map((c) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/cases/${c.id}`)}
                    >
                      <TableCell className="font-medium">{c.client_code}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                        {c.presenting_issue}
                      </TableCell>
                      <TableCell>
                        <Badge className={riskBadgeClass[c.risk_level] ?? ""}>{c.risk_level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClass[c.status] ?? ""}>{c.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
