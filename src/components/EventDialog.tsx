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
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
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

  // State for 3 images
  const [imageFile1, setImageFile1] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [imageFile3, setImageFile3] = useState<File | null>(null);

  const [imagePreview1, setImagePreview1] = useState<string>('');
  const [imagePreview2, setImagePreview2] = useState<string>('');
  const [imagePreview3, setImagePreview3] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    image_url: '',
    image_url_2: '',
    image_url_3: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        image_url: event.image_url || '',
        image_url_2: event.image_url_2 || '',
        image_url_3: event.image_url_3 || '',
      });
      setImagePreview1(event.image_url || '');
      setImagePreview2(event.image_url_2 || '');
      setImagePreview3(event.image_url_3 || '');
      setImageFile1(null);
      setImageFile2(null);
      setImageFile3(null);
    } else {
      setFormData({
        title: '',
        description: '',
        event_date: '',
        image_url: '',
        image_url_2: '',
        image_url_3: '',
      });
      setImagePreview1('');
      setImagePreview2('');
      setImagePreview3('');
      setImageFile1(null);
      setImageFile2(null);
      setImageFile3(null);
    }
  }, [event, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2 | 3) => {
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

    // Set appropriate file and preview based on image number
    if (imageNumber === 1) {
      setImageFile1(file);
    } else if (imageNumber === 2) {
      setImageFile2(file);
    } else {
      setImageFile3(file);
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (imageNumber === 1) {
        setImagePreview1(reader.result as string);
      } else if (imageNumber === 2) {
        setImagePreview2(reader.result as string);
      } else {
        setImagePreview3(reader.result as string);
      }
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
      let imageUrl1 = formData.image_url;
      let imageUrl2 = formData.image_url_2;
      let imageUrl3 = formData.image_url_3;

      // Upload new images if files are selected
      if (imageFile1) {
        imageUrl1 = await uploadImage(imageFile1);
      }
      if (imageFile2) {
        imageUrl2 = await uploadImage(imageFile2);
      }
      if (imageFile3) {
        imageUrl3 = await uploadImage(imageFile3);
      }

      if (event) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title: formData.title,
            description: formData.description,
            event_date: formData.event_date,
            image_url: imageUrl1 || null,
            image_url_2: imageUrl2 || null,
            image_url_3: imageUrl3 || null,
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
            image_url: imageUrl1 || null,
            image_url_2: imageUrl2 || null,
            image_url_3: imageUrl3 || null,
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

  const clearImage = (imageNumber: 1 | 2 | 3) => {
    if (imageNumber === 1) {
      setImageFile1(null);
      setImagePreview1(event?.image_url || '');
      if (!event?.image_url) {
        setFormData({ ...formData, image_url: '' });
      }
    } else if (imageNumber === 2) {
      setImageFile2(null);
      setImagePreview2(event?.image_url_2 || '');
      if (!event?.image_url_2) {
        setFormData({ ...formData, image_url_2: '' });
      }
    } else {
      setImageFile3(null);
      setImagePreview3(event?.image_url_3 || '');
      if (!event?.image_url_3) {
        setFormData({ ...formData, image_url_3: '' });
      }
    }
  };

  const renderImageUploadSection = (
    imageNumber: 1 | 2 | 3,
    preview: string,
    label: string
  ) => {
    const inputId = `image-upload-${imageNumber}`;
    const replaceId = `image-replace-${imageNumber}`;

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt={`Preview ${imageNumber}`}
              className="w-full h-40 object-cover rounded-md border border-border"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
              <Label
                htmlFor={replaceId}
                className="cursor-pointer bg-white text-black px-4 py-2 rounded-md hover:bg-white/90 transition-colors flex items-center gap-2 text-sm"
              >
                <Upload className="h-4 w-4" />
                Ganti
              </Label>
              <Input
                id={replaceId}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, imageNumber)}
                className="hidden"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => clearImage(imageNumber)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <Label
              htmlFor={inputId}
              className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
            >
              Klik untuk upload gambar
              <Input
                id={inputId}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, imageNumber)}
                className="hidden"
              />
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WEBP (Max. 5MB)
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar bg-card border-border">
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

          {/* Image Upload Sections */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="text-sm text-muted-foreground">
              Upload gambar event (opsional, maksimal 3 gambar)
            </div>

            {renderImageUploadSection(1, imagePreview1, 'Gambar 1 (Opsional)')}
            {renderImageUploadSection(2, imagePreview2, 'Gambar 2 (Opsional)')}
            {renderImageUploadSection(3, imagePreview3, 'Gambar 3 (Opsional)')}
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
            <Button type="submit" disabled={loading}>
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