import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockCases, type RiskLevel, type CaseStatus } from "@/data/mockCases";

const riskStyles: Record<RiskLevel, string> = {
  high: "bg-risk-high/10 text-risk-high border-risk-high/20",
  medium: "bg-risk-medium/10 text-risk-medium border-risk-medium/20",
  low: "bg-risk-low/10 text-risk-low border-risk-low/20",
};

const statusStyles: Record<CaseStatus, string> = {
  active: "bg-primary/10 text-primary",
  intake: "bg-risk-medium/10 text-risk-medium",
  "follow-up": "bg-secondary text-secondary-foreground",
  closed: "bg-muted text-muted-foreground",
};

const CaseTable = () => {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");

  const filtered = useMemo(() => {
    return mockCases
      .filter((c) => c.status !== "closed")
      .filter((c) => riskFilter === "all" || c.riskLevel === riskFilter)
      .filter(
        (c) =>
          search === "" ||
          c.clientId.toLowerCase().includes(search.toLowerCase()) ||
          c.primaryConcern.toLowerCase().includes(search.toLowerCase()) ||
          c.assignedTo.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 25);
  }, [search, riskFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-card rounded-lg border border-border"
    >
      <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <h3 className="font-display font-semibold text-card-foreground">Case Overview</h3>
        <div className="flex items-center gap-2 ml-auto">
          {(["all", "high", "medium", "low"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                riskFilter === level
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Client ID</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Risk</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Primary Concern</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden lg:table-cell">Assigned To</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden lg:table-cell">Last Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                <td className="px-5 py-3 font-medium text-card-foreground">{c.clientId}</td>
                <td className="px-5 py-3">
                  <Badge variant="outline" className={`text-xs ${riskStyles[c.riskLevel]}`}>
                    {c.riskLevel}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusStyles[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{c.primaryConcern}</td>
                <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">{c.assignedTo}</td>
                <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">{c.lastContact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
        Showing {filtered.length} of {mockCases.filter((c) => c.status !== "closed").length} active cases
      </div>
    </motion.div>
  );
};

export default CaseTable;
