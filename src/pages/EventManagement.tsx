import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import EventDialog from "@/components/EventDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url: string;
}

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

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

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) throw error;

      toast({
        title: "Event berhasil dihapus!",
        description: "Event telah dihapus dari database.",
      });

      fetchEvents();
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menghapus event",
      });
    }
  };

  const openDeleteDialog = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Event Management</h2>
            <p className="text-muted-foreground">Buat dan kelola event komunitas</p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              setSelectedEvent(null);
              setEventDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Buat Event
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <p className="text-muted-foreground">Belum ada event. Buat event pertama Anda!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.event_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-primary/50 hover:bg-primary/10"
                      onClick={() => handleEdit(event)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => openDeleteDialog(event)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        event={selectedEvent}
        onSuccess={fetchEvents}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Hapus Event"
        description={`Apakah Anda yakin ingin menghapus event "${eventToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </AdminLayout>
  );
};

export default EventManagement;