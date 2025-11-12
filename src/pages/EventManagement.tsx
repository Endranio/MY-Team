import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Pencil, Trash2, Plus } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

// Mock data
const mockEvents = [
  {
    id: 1,
    title: "Valorant Championship",
    description: "Join our first Valorant tournament with amazing prizes!",
    date: "2024-12-20",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
  },
  {
    id: 2,
    title: "League of Legends Clash",
    description: "Team up and compete in the ultimate LoL showdown.",
    date: "2024-12-25",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80"
  },
  {
    id: 3,
    title: "CS2 Community Night",
    description: "Casual games and fun with the community.",
    date: "2024-12-30",
    image: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800&q=80"
  }
];

const EventManagement = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Event Management</h2>
            <p className="text-muted-foreground">Create and manage community events</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
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
                <p className="text-muted-foreground text-sm">{event.description}</p>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-primary/50 hover:bg-primary/10"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EventManagement;
