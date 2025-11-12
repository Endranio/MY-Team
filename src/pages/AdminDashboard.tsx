import { Card } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Gamepad2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Overview of your gaming community</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold mt-1">1,234</p>
              </div>
              <Users className="h-10 w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-3xl font-bold mt-1">45</p>
              </div>
              <Calendar className="h-10 w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Games</p>
                <p className="text-3xl font-bold mt-1">12</p>
              </div>
              <Gamepad2 className="h-10 w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Growth</p>
                <p className="text-3xl font-bold mt-1">+23%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">New user registered</p>
                  <p className="text-sm text-muted-foreground">user{i}@example.com</p>
                </div>
                <span className="text-sm text-muted-foreground">2h ago</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
