import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCases, type RiskLevel, type CaseStatus } from "@/data/mockData";
import { Search, Eye } from "lucide-react";

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

const Cases = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return mockCases.filter((c) => {
      const matchSearch =
        !search ||
        c.client_code.toLowerCase().includes(search.toLowerCase()) ||
        c.presenting_issue.toLowerCase().includes(search.toLowerCase()) ||
        c.coordinator.toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === "all" || c.risk_level === riskFilter;
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchRisk && matchStatus;
    });
  }, [search, riskFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Cases</h2>
        <p className="text-sm text-muted-foreground mt-1">Browse and filter all case records</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by client code, issue, or coordinator…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Code</TableHead>
                <TableHead className="hidden md:table-cell">Presenting Issue</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Coordinator</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No cases match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.client_code}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[220px] truncate">
                      {c.presenting_issue}
                    </TableCell>
                    <TableCell>
                      <Badge className={riskBadgeClass[c.risk_level]}>{c.risk_level}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass[c.status]}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{c.coordinator}</TableCell>
                    <TableCell className="hidden lg:table-cell">{c.date}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/cases/${c.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cases;
