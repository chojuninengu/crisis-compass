import AppSidebar from "./AppSidebar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="lg:ml-64 p-4 pt-16 lg:pt-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
