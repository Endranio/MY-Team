import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Megaphone, Plus, Loader2, ImagePlus, Trash2, Calendar, Bell, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Announcement {
    id: string;
    team_id: string;
    created_by: string;
    message: string;
    image_url: string | null;
    created_at: string;
    creator?: {
        full_name: string;
        avatar_url: string | null;
    };
}

interface TeamAnnouncementsProps {
    teamId: string;
    isCaptain: boolean;
}

const TeamAnnouncements = ({ teamId, isCaptain }: TeamAnnouncementsProps) => {
    const { user, isAdmin } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Form state
    const [newAnnouncement, setNewAnnouncement] = useState({
        message: "",
        image: null as File | null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const canCreate = isCaptain || isAdmin;
    const storageKey = `announcements_last_read_${teamId}`;

    // Calculate unread count based on last read time
    const calculateUnreadCount = (announcementsList: Announcement[]) => {
        const lastReadTime = localStorage.getItem(storageKey);
        if (!lastReadTime) {
            // Never opened before - all are unread
            return announcementsList.length;
        }
        const lastRead = new Date(lastReadTime).getTime();
        return announcementsList.filter(a => new Date(a.created_at).getTime() > lastRead).length;
    };

    // Mark as read when dialog opens
    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);
        if (open) {
            // Save current time as last read
            localStorage.setItem(storageKey, new Date().toISOString());
            setUnreadCount(0);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const { data, error } = await supabase
                .from("team_announcements")
                .select("*")
                .eq("team_id", teamId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                const creatorIds = [...new Set(data.map(a => a.created_by))];
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("id, full_name, avatar_url")
                    .in("id", creatorIds);

                const announcementsWithCreators = data.map(announcement => ({
                    ...announcement,
                    creator: profiles?.find(p => p.id === announcement.created_by)
                }));

                setAnnouncements(announcementsWithCreators);
                setUnreadCount(calculateUnreadCount(announcementsWithCreators));
            } else {
                setAnnouncements([]);
                setUnreadCount(0);
            }
        } catch (error: any) {
            console.error("Error fetching announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (teamId) {
            fetchAnnouncements();
        }
    }, [teamId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setNewAnnouncement(prev => ({ ...prev, image: file }));

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newAnnouncement.message.trim()) return;

        setCreateLoading(true);
        try {
            let imageUrl = null;

            if (newAnnouncement.image) {
                const fileExt = newAnnouncement.image.name.split(".").pop();
                const fileName = `${teamId}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("team-announcements")
                    .upload(fileName, newAnnouncement.image);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("team-announcements")
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            const { error } = await supabase
                .from("team_announcements")
                .insert({
                    team_id: teamId,
                    created_by: user.id,
                    message: newAnnouncement.message.trim(),
                    image_url: imageUrl,
                });

            if (error) throw error;

            toast({
                title: "Pengumuman berhasil dibuat!",
                description: "Anggota tim akan melihat pengumuman ini."
            });

            setCreateDialogOpen(false);
            setNewAnnouncement({ message: "", image: null });
            setImagePreview(null);
            fetchAnnouncements();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal membuat pengumuman"
            });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteAnnouncement = async (announcementId: string) => {
        try {
            const { error } = await supabase
                .from("team_announcements")
                .delete()
                .eq("id", announcementId);

            if (error) throw error;

            toast({ title: "Pengumuman berhasil dihapus" });
            setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
            setSelectedAnnouncement(null);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menghapus pengumuman"
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "Baru saja";
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;

        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return null;
    }

    return (
        <>
            {/* Announcement Detail Popup */}
            <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
                    {selectedAnnouncement && (
                        <>
                            {/* Header */}
                            <div className="bg-muted/50 p-6 pb-4 border-b">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                                        <AvatarImage src={selectedAnnouncement.creator?.avatar_url || undefined} />
                                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                            {selectedAnnouncement.creator?.full_name?.charAt(0) || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg">{selectedAnnouncement.creator?.full_name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(selectedAnnouncement.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 pt-4 space-y-4">
                                <p className="text-base leading-relaxed whitespace-pre-wrap">
                                    {selectedAnnouncement.message}
                                </p>

                                {selectedAnnouncement.image_url && (
                                    <img
                                        src={selectedAnnouncement.image_url}
                                        alt="Announcement"
                                        className="w-full max-h-[400px] object-cover rounded-xl border shadow-lg"
                                    />
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Main Announcements Popup */}
            <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                    {/* Simple Button Trigger */}
                    <Button variant="outline" size="sm" className="gap-2 relative">
                        <Megaphone className="h-4 w-4" />
                        Pengumuman
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[600px] max-h-[85vh] p-0 overflow-hidden bg-background [&>button]:hidden">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-muted/50 border-b p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary rounded-xl">
                                    <Megaphone className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold">Pengumuman Tim</DialogTitle>
                                    <p className="text-sm text-muted-foreground">{announcements.length} pengumuman</p>
                                </div>
                            </div>

                            {canCreate && (
                                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            <span className="hidden sm:inline">Buat Baru</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <Megaphone className="h-5 w-5 text-primary" />
                                                Buat Pengumuman Baru
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleCreateAnnouncement} className="space-y-4 mt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="message">Pesan Pengumuman *</Label>
                                                <Textarea
                                                    id="message"
                                                    value={newAnnouncement.message}
                                                    onChange={(e) => setNewAnnouncement(prev => ({
                                                        ...prev,
                                                        message: e.target.value
                                                    }))}
                                                    placeholder="Tulis pengumuman untuk tim..."
                                                    rows={4}
                                                    required
                                                    className="resize-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="image">Gambar (Opsional)</Label>
                                                <div className="flex flex-col gap-3">
                                                    <Input
                                                        id="image"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor="image"
                                                        className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                                                    >
                                                        <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">
                                                            Klik untuk upload gambar
                                                        </span>
                                                    </label>

                                                    {imagePreview && (
                                                        <div className="relative">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="w-full max-h-48 object-cover rounded-xl border"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setNewAnnouncement(prev => ({ ...prev, image: null }));
                                                                    setImagePreview(null);
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90 shadow-lg"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <Button type="submit" className="w-full" disabled={createLoading}>
                                                {createLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                                Kirim Pengumuman
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>

                    {/* Announcements List */}
                    <ScrollArea className="h-[calc(85vh-140px)]">
                        {announcements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                <div className="p-5 bg-muted rounded-full mb-4">
                                    <Bell className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-lg">Belum ada pengumuman</p>
                                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                    {canCreate
                                        ? "Buat pengumuman pertama untuk tim Anda"
                                        : "Pengumuman dari kapten akan muncul di sini"
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-3">
                                {announcements.map((announcement, index) => (
                                    <div
                                        key={announcement.id}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${index === 0
                                            ? "bg-primary/5 border-primary/30"
                                            : "bg-card border-border"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-primary/20 shrink-0">
                                                <AvatarImage src={announcement.creator?.avatar_url || undefined} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                    {announcement.creator?.full_name?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedAnnouncement(announcement)}>
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-semibold text-sm">
                                                        {announcement.creator?.full_name || "Unknown"}
                                                    </span>
                                                    {index === 0 && (
                                                        <Badge className="text-[10px] px-1.5 py-0 bg-primary text-white border-0">
                                                            Terbaru
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        • {formatDate(announcement.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {announcement.message}
                                                </p>
                                                {announcement.image_url && (
                                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                                                        <ImagePlus className="h-3.5 w-3.5" />
                                                        <span>Lihat gambar</span>
                                                    </div>
                                                )}
                                            </div>
                                            {canCreate ? (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus Pengumuman?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Pengumuman ini akan dihapus secara permanen.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 cursor-pointer" onClick={() => setSelectedAnnouncement(announcement)} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TeamAnnouncements;
