import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, ImageIcon } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
}

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
}

const EventDetailsDialog = ({ open, onOpenChange, event }: EventDetailsDialogProps) => {
  if (!event) return null;

  // Collect all available images
  const images = [
    event.image_url,
    event.image_url_2,
    event.image_url_3
  ].filter(Boolean) as string[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Images - Full width, stacked vertically */}
          {images.length > 0 ? (
            <div className="space-y-2">
              {images.map((img, idx) => (
                <div key={idx} className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`${event.title} - ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            // No images placeholder
            <div className="aspect-video bg-muted/30 rounded-lg flex flex-col items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada gambar</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">
              {new Date(event.event_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Deskripsi Event</h3>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;