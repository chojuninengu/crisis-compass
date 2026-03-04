import Sidebar from "@/components/dashboard/Sidebar";
import KpiCards from "@/components/dashboard/KpiCards";
import CaseTable from "@/components/dashboard/CaseTable";
import TriageAlerts from "@/components/dashboard/TriageAlerts";
import UtilizationChart from "@/components/dashboard/UtilizationChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your organization's mental health caseload
          </p>
        </div>

        {/* KPIs */}
        <KpiCards />

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <CaseTable />
            <UtilizationChart />
          </div>
          <div className="xl:col-span-1">
            <TriageAlerts />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
