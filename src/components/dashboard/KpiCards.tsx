import { motion } from "framer-motion";
import { Users, AlertTriangle, ClipboardList, TrendingUp } from "lucide-react";
import { dashboardStats } from "@/data/mockCases";

const cards = [
  {
    label: "Active Cases",
    value: dashboardStats.totalActive,
    icon: Users,
    color: "text-primary",
    bgColor: "bg-secondary",
  },
  {
    label: "High-Risk Flags",
    value: dashboardStats.highRisk,
    icon: AlertTriangle,
    color: "text-risk-high",
    bgColor: "bg-risk-high/10",
    pulse: true,
  },
  {
    label: "Pending Intake",
    value: dashboardStats.pendingIntake,
    icon: ClipboardList,
    color: "text-risk-medium",
    bgColor: "bg-risk-medium/10",
  },
  {
    label: "Avg. Caseload",
    value: `${dashboardStats.avgCaseload} / staff`,
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-secondary",
  },
];

const KpiCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {cards.map((card, i) => (
      <motion.div
        key={card.label}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.08, duration: 0.4 }}
        className="bg-card rounded-lg border border-border p-5 flex items-start gap-4"
      >
        <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center flex-shrink-0`}>
          <card.icon className={`w-5 h-5 ${card.color} ${card.pulse ? "animate-pulse-soft" : ""}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
          <p className="text-2xl font-display font-bold text-card-foreground mt-0.5">{card.value}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

export default KpiCards;
