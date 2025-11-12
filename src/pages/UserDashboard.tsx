import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Calendar, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for events
const mockEvents = [
  {
    id: 1,
    title: "Valorant Championship",
    date: "2024-12-20",
    description: "Join our first Valorant tournament with amazing prizes!",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
  },
  {
    id: 2,
    title: "League of Legends Clash",
    date: "2024-12-25",
    description: "Team up and compete in the ultimate LoL showdown.",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80"
  },
  {
    id: 3,
    title: "CS2 Community Night",
    date: "2024-12-30",
    description: "Casual games and fun with the community.",
    image: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800&q=80"
  }
];

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              GameHub
            </h1>
          </div>
          <Button variant="ghost" className="hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">User Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Check out the latest events.</p>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.date).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <h3 className="text-xl font-bold">{event.title}</h3>
                <p className="text-muted-foreground">{event.description}</p>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
