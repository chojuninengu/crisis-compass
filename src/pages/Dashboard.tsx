import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCases } from "@/data/mockData";
import { Users, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

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
  const activeCases = mockCases.filter((c) => c.status !== "closed").length;
  const criticalHigh = mockCases.filter((c) => c.risk_level === "critical" || c.risk_level === "high").length;
  const followUps = mockCases.filter((c) => c.status === "follow-up").length;
  const closedMonth = mockCases.filter((c) => c.status === "closed").length;

  const riskData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, moderate: 0, stable: 0 };
    mockCases.forEach((c) => counts[c.risk_level]++);
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, []);

  const recentCases = mockCases.slice(0, 8);

  const stats = [
    { label: "Total Active Cases", value: activeCases, icon: Users, accent: "text-primary" },
    { label: "Critical + High Risk", value: criticalHigh, icon: AlertTriangle, accent: "text-risk-critical" },
    { label: "Follow-ups Due", value: followUps, icon: Clock, accent: "text-risk-moderate" },
    { label: "Closed This Month", value: closedMonth, icon: CheckCircle, accent: "text-risk-stable" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Overview of your organization's caseload</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
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
                      <Cell
                        key={entry.name}
                        fill={riskColors[entry.name.toLowerCase()]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
                {recentCases.map((c) => (
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
                      <Badge className={riskBadgeClass[c.risk_level]}>{c.risk_level}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass[c.status]}>{c.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
