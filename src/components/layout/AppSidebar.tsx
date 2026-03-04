import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardPlus,
  FileBarChart,
  BookOpen,
  LogOut,
  Compass,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Cases", path: "/cases" },
  { icon: ClipboardPlus, label: "Intake", path: "/intake" },
  { icon: FileBarChart, label: "Reports", path: "/reports" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
];

const AppSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-primary-foreground p-2 rounded-lg"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-40 transition-transform duration-200",
          collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0",
          "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Compass className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-accent-foreground tracking-tight">
              CrisisCompass
            </h1>
            <p className="text-xs text-sidebar-foreground">Case Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
              MT
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-accent-foreground">Maya Torres</p>
              <p className="text-xs text-sidebar-foreground">Coordinator</p>
            </div>
            <Link to="/login" className="text-sidebar-foreground hover:text-sidebar-accent-foreground">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
