import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { utilizationData } from "@/data/mockCases";

const UtilizationChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="bg-card rounded-lg border border-border p-5"
    >
      <h3 className="font-display font-semibold text-card-foreground mb-4">Service Utilization</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={utilizationData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 10% 88%)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(200 10% 45%)" }} />
            <YAxis
              type="category"
              dataKey="service"
              tick={{ fontSize: 12, fill: "hsl(200 10% 45%)" }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(200 10% 88%)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(value: number, name: string) => [value, name === "count" ? "Utilized" : "Capacity"]}
            />
            <Bar dataKey="capacity" fill="hsl(200 10% 88%)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {utilizationData.map((entry) => {
                const ratio = entry.count / entry.capacity;
                const color =
                  ratio > 0.9 ? "hsl(4 72% 58%)" : ratio > 0.7 ? "hsl(35 85% 55%)" : "hsl(160 30% 42%)";
                return <Cell key={entry.service} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Color indicates utilization: <span className="text-risk-low">● healthy</span>{" "}
        <span className="text-risk-medium">● moderate</span>{" "}
        <span className="text-risk-high">● near capacity</span>
      </p>
    </motion.div>
  );
};

export default UtilizationChart;
