import { motion } from "framer-motion";
import { AlertTriangle, Clock } from "lucide-react";
import { mockCases } from "@/data/mockCases";
import { Badge } from "@/components/ui/badge";

const highRiskCases = mockCases.filter((c) => c.riskLevel === "high").slice(0, 8);

const TriageAlerts = () => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3, duration: 0.5 }}
    className="bg-card rounded-lg border border-border"
  >
    <div className="px-5 py-4 border-b border-border flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-risk-high" />
      <h3 className="font-display font-semibold text-card-foreground">AI Triage Alerts</h3>
      <Badge variant="destructive" className="ml-auto text-xs">
        {highRiskCases.length} flagged
      </Badge>
    </div>
    <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
      {highRiskCases.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.05 }}
          className="px-5 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-card-foreground">{c.clientId}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {c.lastContact}
            </span>
          </div>
          <p className="text-xs text-risk-high font-medium">{c.flagReason}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {c.primaryConcern} · {c.assignedTo}
          </p>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default TriageAlerts;
