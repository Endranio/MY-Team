import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { MessageSquare, Plus, Pencil, Trash2, Loader2, Star, Search, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

type Testimonial = Tables<"testimonials">;

const TestimonialManagement = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [deleteTestimonial, setDeleteTestimonial] = useState<Testimonial | null>(null);
    const [saving, setSaving] = useState(false);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Form state
    const [formData, setFormData] = useState({
        author_name: "",
        author_role: "",
        content: "",
        rating: 5,
        is_active: true,
    });

    const fetchTestimonials = async () => {
        try {
            // Admins can view all testimonials (including inactive) via RLS
            const { data, error } = await supabase
                .from("testimonials")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setTestimonials(data || []);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal memuat data testimonials",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    // Filter and Pagination Logic
    const filteredTestimonials = testimonials.filter(testimonial =>
        testimonial.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.author_role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTestimonials = filteredTestimonials.slice(indexOfFirstItem, indexOfLastItem);

    const resetForm = () => {
        setFormData({
            author_name: "",
            author_role: "",
            content: "",
            rating: 5,
            is_active: true,
        });
        setEditingTestimonial(null);
    };

    const handleOpenDialog = (testimonial?: Testimonial) => {
        if (testimonial) {
            setEditingTestimonial(testimonial);
            setFormData({
                author_name: testimonial.author_name,
                author_role: testimonial.author_role,
                content: testimonial.content,
                rating: testimonial.rating,
                is_active: testimonial.is_active,
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
            if (editingTestimonial) {
                const { error } = await supabase
                    .from("testimonials")
                    .update({
                        author_name: formData.author_name,
                        author_role: formData.author_role,
                        content: formData.content,
                        rating: formData.rating,
                        is_active: formData.is_active,
                    })
                    .eq("id", editingTestimonial.id);

                if (error) throw error;
                toast({ title: "Sukses", description: "Testimonial berhasil diupdate" });
            } else {
                const { error } = await supabase.from("testimonials").insert({
                    author_name: formData.author_name,
                    author_role: formData.author_role,
                    content: formData.content,
                    rating: formData.rating,
                    is_active: formData.is_active,
                });

                if (error) throw error;
                toast({ title: "Sukses", description: "Testimonial berhasil ditambahkan" });
            }

            setIsDialogOpen(false);
            resetForm();
            fetchTestimonials();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menyimpan testimonial",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTestimonial) return;

        try {
            const { error } = await supabase
                .from("testimonials")
                .delete()
                .eq("id", deleteTestimonial.id);

            if (error) throw error;
            toast({ title: "Sukses", description: "Testimonial berhasil dihapus" });
            setDeleteTestimonial(null);
            fetchTestimonials();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menghapus testimonial",
            });
        }
    };

    const toggleActive = async (testimonial: Testimonial) => {
        try {
            const { error } = await supabase
                .from("testimonials")
                .update({ is_active: !testimonial.is_active })
                .eq("id", testimonial.id);

            if (error) throw error;
            fetchTestimonials();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal mengubah status",
            });
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating ? "fill-primary text-primary" : "text-muted-foreground"
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Testimonial Management</h2>
                        <p className="text-muted-foreground">
                            Kelola testimoni yang ditampilkan di landing page
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Testimonial
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingTestimonial ? "Edit Testimonial" : "Tambah Testimonial Baru"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="author_name">Nama</Label>
                                    <Input
                                        id="author_name"
                                        value={formData.author_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, author_name: e.target.value })
                                        }
                                        placeholder="Masukkan nama"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="author_role">Role/Jabatan</Label>
                                    <Input
                                        id="author_role"
                                        value={formData.author_role}
                                        onChange={(e) =>
                                            setFormData({ ...formData, author_role: e.target.value })
                                        }
                                        placeholder="Pro Gamer, Esports Player, dll"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Isi Testimonial</Label>
                                    <Textarea
                                        id="content"
                                        value={formData.content}
                                        onChange={(e) =>
                                            setFormData({ ...formData, content: e.target.value })
                                        }
                                        placeholder="Tulis testimonial di sini..."
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rating">Rating</Label>
                                    <Select
                                        value={formData.rating.toString()}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, rating: parseInt(value) })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[5, 4, 3, 2, 1].map((r) => (
                                                <SelectItem key={r} value={r.toString()}>
                                                    {r} Bintang
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, is_active: checked })
                                        }
                                    />
                                    <Label htmlFor="is_active">Aktif (tampil di landing page)</Label>
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
                                        {editingTestimonial ? "Update" : "Simpan"}
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
                            placeholder="Cari nama, role, atau konten..."
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
                ) : testimonials.length === 0 ? (
                    <Card className="p-12 text-center bg-card border-border">
                        <p className="text-muted-foreground">Belum ada testimonial. Klik tombol "Tambah Testimonial" untuk menambahkan.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <Card className="bg-card border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border bg-muted/30">
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Konten</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tanggal Dibuat</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentTestimonials.length > 0 ? (
                                        currentTestimonials.map((testimonial) => (
                                            <TableRow key={testimonial.id} className="border-border hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium">
                                                    {testimonial.author_name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{testimonial.author_role}</TableCell>
                                                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                    {testimonial.content}
                                                </TableCell>
                                                <TableCell>{renderStars(testimonial.rating)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={testimonial.is_active}
                                                            onCheckedChange={() => toggleActive(testimonial)}
                                                        />
                                                        <span
                                                            className={`text-sm ${testimonial.is_active
                                                                    ? "text-green-500"
                                                                    : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            {testimonial.is_active ? "Aktif" : "Nonaktif"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(testimonial.created_at).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleOpenDialog(testimonial)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => setDeleteTestimonial(testimonial)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Tidak ada testimonial yang ditemukan.
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
                open={!!deleteTestimonial}
                onOpenChange={(open) => !open && setDeleteTestimonial(null)}
                onConfirm={handleDelete}
                title="Hapus Testimonial"
                description={`Apakah Anda yakin ingin menghapus testimonial dari "${deleteTestimonial?.author_name}"?`}
            />
        </AdminLayout>
    );
};

export default TestimonialManagement;
