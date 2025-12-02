import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url: string;
}

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  onSuccess: () => void;
}

const EventDialog = ({ open, onOpenChange, event, onSuccess }: EventDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    image_url: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        image_url: event.image_url,
      });
      setImagePreview(event.image_url);
      setImageFile(null);
    } else {
      setFormData({
        title: '',
        description: '',
        event_date: '',
        image_url: '',
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [event, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'File harus berupa gambar (JPG, PNG, WEBP)',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ukuran file maksimal 5MB',
      });
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('my-team')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload Error Details:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('my-team')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setUploading(true);

    try {
      let imageUrl = formData.image_url;

      // Upload new image if file is selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (!imageUrl) {
        throw new Error('Image is required');
      }

      if (event) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title: formData.title,
            description: formData.description,
            event_date: formData.event_date,
            image_url: imageUrl,
          })
          .eq('id', event.id);

        if (error) throw error;

        toast({
          title: 'Event berhasil diupdate!',
          description: 'Perubahan telah disimpan.',
        });
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert({
            title: formData.title,
            description: formData.description,
            event_date: formData.event_date,
            image_url: imageUrl,
            created_by: user.id,
          });

        if (error) throw error;

        toast({
          title: 'Event berhasil dibuat!',
          description: 'Event baru telah ditambahkan.',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Gagal menyimpan event',
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(event?.image_url || '');
    if (!event?.image_url) {
      setFormData({ ...formData, image_url: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {event ? 'Edit Event' : 'Buat Event Baru'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Event</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Valorant Championship"
              required
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsikan event Anda..."
              required
              rows={4}
              className="bg-background border-border resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_date">Tanggal Event</Label>
            <Input
              id="event_date"
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              required
              className="bg-background border-border"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="image">Gambar Event</Label>
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md border border-border"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
                  <Label
                    htmlFor="image-replace"
                    className="cursor-pointer bg-white text-black px-4 py-2 rounded-md hover:bg-white/90 transition-colors flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Ganti Gambar
                  </Label>
                  <Input
                    id="image-replace"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    setFormData({ ...formData, image_url: '' });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-md p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
                >
                  Klik untuk upload gambar
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WEBP (Max. 5MB)
                </p>
              </div>
            )}
            {!imagePreview && !event && (
              <p className="text-sm text-muted-foreground">* Gambar wajib diupload</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || (!imagePreview && !formData.image_url)}>
              {uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {event ? 'Update Event' : 'Buat Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;