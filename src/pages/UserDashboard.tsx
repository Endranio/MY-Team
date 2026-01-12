import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Calendar, LogOut, Loader2, Users, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/header";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
}

// Multi-image grid component
const EventImageGrid = ({ event }: { event: Event }) => {
  const images = [event.image_url, event.image_url_2, event.image_url_3].filter(Boolean) as string[];

  // No images
  if (images.length === 0) {
    return (
      <div className="aspect-video bg-muted/30 flex items-center justify-center">
        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
      </div>
    );
  }

  // 1 image - full width
  if (images.length === 1) {
    return (
      <div className="aspect-video overflow-hidden">
        <img src={images[0]} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
    );
  }

  // 2 images - side by side (60% left, 40% right)
  if (images.length === 2) {
    return (
      <div className="aspect-video flex gap-0.5 overflow-hidden">
        <div className="w-[60%] h-full">
          <img src={images[0]} alt={`${event.title} - 1`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="w-[40%] h-full">
          <img src={images[1]} alt={`${event.title} - 2`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      </div>
    );
  }

  // 3 images - 60% left + 40% right (2 stacked vertically)
  return (
    <div className="aspect-video flex gap-0.5 overflow-hidden">
      <div className="w-[60%] h-full">
        <img src={images[0]} alt={`${event.title} - 1`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="w-[40%] h-full flex flex-col gap-0.5">
        <div className="h-1/2">
          <img src={images[1]} alt={`${event.title} - 2`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="h-1/2">
          <img src={images[2]} alt={`${event.title} - 3`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal memuat events",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">User Dashboard</h2>
          <p className="text-muted-foreground">Selamat datang kembali! Lihat event terbaru.</p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <p className="text-muted-foreground">Belum ada event tersedia.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card key={event.id} className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 flex flex-col h-full">
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <EventImageGrid event={event} />
                  <Badge className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md border-white/10 text-white hover:bg-black/70 transition-colors">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(event.event_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </Badge>
                </div>

                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="space-y-2 flex-grow">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1" title={event.title}>
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-auto">
                    <Button
                      className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-medium group-hover:translate-y-0 translate-y-1"
                      onClick={() => handleViewDetails(event)}
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <EventDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        event={selectedEvent}
      />
    </div>
  );
};

export default UserDashboard;
