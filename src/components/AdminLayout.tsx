import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, LayoutDashboard, Users, Calendar, UserCheck, LogOut, Menu, Video, MessageSquare, Info, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop sidebar width
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile sidebar visibility

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "User Management", path: "/admin/users" },
    { icon: Calendar, label: "Event Management", path: "/admin/events" },
    { icon: Video, label: "Live Streams", path: "/admin/streams" },
    { icon: MessageSquare, label: "Testimonials", path: "/admin/testimonials" },
    { icon: Info, label: "Info Cards", path: "/admin/info-cards" },
    { icon: UserCheck, label: "Referral Saya", path: "/admin/referrals" },
    { icon: Users, label: "Tim Management", path: "/admin/teams" },
    { icon: Users, label: "Tim Saya", path: "/admin/my-team" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-border bg-card p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
            GameHub
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="transition-all duration-300"
        >
          <div className={`transition-all duration-300 ${mobileOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </div>
        </Button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-r border-border transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 h-full md:sticky md:top-0 md:h-screen md:translate-x-0",
          sidebarOpen ? "md:w-64" : "md:w-20",
          mobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className={cn("flex items-center gap-2 overflow-hidden transition-all duration-300",
            !sidebarOpen && "md:w-0 md:opacity-0",
            sidebarOpen && "md:w-auto md:opacity-100"
          )}>
            <Gamepad2 className="h-8 w-8 text-primary shrink-0" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent whitespace-nowrap">
              GameHub
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-primary/10 hidden md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* Close button for mobile inside sidebar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 hover:bg-primary/10",
                    isActive && "bg-primary/20 text-primary hover:bg-primary/20",
                    !sidebarOpen && "md:justify-center"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={cn(
                    "transition-all duration-300",
                    !sidebarOpen && "md:hidden",
                    sidebarOpen && "md:inline"
                  )}>
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={signOut}
            className={cn(
              "w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive transition-colors",
              !sidebarOpen && "md:justify-center md:px-2"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={cn(
              "transition-all duration-300",
              !sidebarOpen && "md:hidden",
              sidebarOpen && "md:inline"
            )}>
              Logout
            </span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full md:w-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;