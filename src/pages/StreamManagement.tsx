import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Video, Plus, Pencil, Trash2, Loader2, ExternalLink, Search, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

type Stream = Tables<"streams">;

const StreamManagement = () => {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStream, setEditingStream] = useState<Stream | null>(null);
    const [deleteStream, setDeleteStream] = useState<Stream | null>(null);
    const [saving, setSaving] = useState(false);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        stream_url: "",
        platform: "youtube",
        thumbnail_url: "",
        is_live: false,
    });

    const fetchStreams = async () => {
        try {
            const { data, error } = await supabase
                .from("streams")
                .select("*")
                .order("is_live", { ascending: false })
                .order("created_at", { ascending: false });

            if (error) throw error;
            setStreams(data || []);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal memuat data streams",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStreams();
    }, []);

    // Filter and Pagination Logic
    const filteredStreams = streams.filter(stream =>
        stream.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stream.platform?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStreams.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStreams = filteredStreams.slice(indexOfFirstItem, indexOfLastItem);

    const resetForm = () => {
        setFormData({
            title: "",
            stream_url: "",
            platform: "youtube",
            thumbnail_url: "",
            is_live: false,
        });
        setEditingStream(null);
    };

    const handleOpenDialog = (stream?: Stream) => {
        if (stream) {
            setEditingStream(stream);
            setFormData({
                title: stream.title,
                stream_url: stream.stream_url,
                platform: stream.platform,
                thumbnail_url: stream.thumbnail_url || "",
                is_live: stream.is_live,
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingStream) {
                const { error } = await supabase
                    .from("streams")
                    .update({
                        title: formData.title,
                        stream_url: formData.stream_url,
                        platform: formData.platform,
                        thumbnail_url: formData.thumbnail_url || null,
                        is_live: formData.is_live,
                    })
                    .eq("id", editingStream.id);

                if (error) throw error;
                toast({ title: "Sukses", description: "Stream berhasil diupdate" });
            } else {
                const { error } = await supabase.from("streams").insert({
                    title: formData.title,
                    stream_url: formData.stream_url,
                    platform: formData.platform,
                    thumbnail_url: formData.thumbnail_url || null,
                    is_live: formData.is_live,
                });

                if (error) throw error;
                toast({ title: "Sukses", description: "Stream berhasil ditambahkan" });
            }

            setIsDialogOpen(false);
            resetForm();
            fetchStreams();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menyimpan stream",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteStream) return;

        try {
            const { error } = await supabase
                .from("streams")
                .delete()
                .eq("id", deleteStream.id);

            if (error) throw error;
            toast({ title: "Sukses", description: "Stream berhasil dihapus" });
            setDeleteStream(null);
            fetchStreams();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menghapus stream",
            });
        }
    };

    const toggleLive = async (stream: Stream) => {
        try {
            const { error } = await supabase
                .from("streams")
                .update({ is_live: !stream.is_live })
                .eq("id", stream.id);

            if (error) throw error;
            fetchStreams();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal mengubah status",
            });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Live Streams Management</h2>
                        <p className="text-muted-foreground">
                            Kelola link live stream yang ditampilkan di landing page
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Stream
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingStream ? "Edit Stream" : "Tambah Stream Baru"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Stream</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        placeholder="Masukkan judul stream"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stream_url">URL Stream</Label>
                                    <Input
                                        id="stream_url"
                                        type="url"
                                        value={formData.stream_url}
                                        onChange={(e) =>
                                            setFormData({ ...formData, stream_url: e.target.value })
                                        }
                                        placeholder="https://youtube.com/watch?v=..."
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform</Label>
                                    <Select
                                        value={formData.platform}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, platform: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="youtube">YouTube</SelectItem>
                                            <SelectItem value="twitch">Twitch</SelectItem>
                                            <SelectItem value="facebook">Facebook</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="thumbnail_url">URL Thumbnail (opsional)</Label>
                                    <Input
                                        id="thumbnail_url"
                                        type="url"
                                        value={formData.thumbnail_url}
                                        onChange={(e) =>
                                            setFormData({ ...formData, thumbnail_url: e.target.value })
                                        }
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_live"
                                        checked={formData.is_live}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, is_live: checked })
                                        }
                                    />
                                    <Label htmlFor="is_live">Sedang Live</Label>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={saving}>
                                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {editingStream ? "Update" : "Simpan"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari judul atau platform..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9 bg-card border-border"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : streams.length === 0 ? (
                    <Card className="p-12 text-center bg-card border-border">
                        <p className="text-muted-foreground">Belum ada stream. Klik tombol "Tambah Stream" untuk menambahkan.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <Card className="bg-card border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border bg-muted/30">
                                        <TableHead>Judul</TableHead>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tanggal Dibuat</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentStreams.length > 0 ? (
                                        currentStreams.map((stream) => (
                                            <TableRow key={stream.id} className="border-border hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium">{stream.title}</TableCell>
                                                <TableCell className="text-muted-foreground capitalize">{stream.platform}</TableCell>
                                                <TableCell>
                                                    <a
                                                        href={stream.stream_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        Link
                                                    </a>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={stream.is_live}
                                                            onCheckedChange={() => toggleLive(stream)}
                                                        />
                                                        {stream.is_live ? (
                                                            <span className="text-red-500 font-semibold text-sm animate-pulse">
                                                                LIVE
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">
                                                                Offline
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(stream.created_at).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleOpenDialog(stream)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => setDeleteStream(stream)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                Tidak ada stream yang ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                    Halaman {currentPage} dari {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DeleteConfirmDialog
                open={!!deleteStream}
                onOpenChange={(open) => !open && setDeleteStream(null)}
                onConfirm={handleDelete}
                title="Hapus Stream"
                description={`Apakah Anda yakin ingin menghapus stream "${deleteStream?.title}"?`}
            />
        </AdminLayout>
    );
};

export default StreamManagement;
