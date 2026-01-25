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
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Search, ChevronLeft, ChevronRight, ImageIcon, Handshake } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

type Sponsor = Tables<"sponsors">;

const SponsorManagement = () => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
    const [deleteSponsor, setDeleteSponsor] = useState<Sponsor | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        logo_url: "",
        description: "",
        is_active: true,
        display_order: 0,
    });

    // Image preview state
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchSponsors = async () => {
        try {
            const { data, error } = await supabase
                .from("sponsors")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) throw error;
            setSponsors(data || []);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal memuat data sponsor",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSponsors();
    }, []);

    // Filter and Pagination Logic
    const filteredSponsors = sponsors.filter((sponsor) =>
        sponsor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sponsor.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredSponsors.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSponsors = filteredSponsors.slice(indexOfFirstItem, indexOfLastItem);

    const resetForm = () => {
        setFormData({
            name: "",
            logo_url: "",
            description: "",
            is_active: true,
            display_order: 0,
        });
        setEditingSponsor(null);
        setImagePreview(null);
        setSelectedFile(null);
    };

    const handleOpenDialog = (sponsor?: Sponsor) => {
        if (sponsor) {
            setEditingSponsor(sponsor);
            setFormData({
                name: sponsor.name,
                logo_url: sponsor.logo_url || "",
                description: sponsor.description || "",
                is_active: sponsor.is_active,
                display_order: sponsor.display_order,
            });
            setImagePreview(sponsor.logo_url);
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "File harus berupa gambar",
                });
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Ukuran file maksimal 2MB",
                });
                return;
            }

            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = fileName;

            const { error: uploadError } = await supabase.storage
                .from('sponsor-logos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('sponsor-logos')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error Upload",
                description: error.message || "Gagal mengupload gambar",
            });
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let logoUrl = formData.logo_url;

            // Upload image if a new file is selected
            if (selectedFile) {
                const uploadedUrl = await uploadImage(selectedFile);
                if (uploadedUrl) {
                    logoUrl = uploadedUrl;
                }
            }

            if (editingSponsor) {
                const { error } = await supabase
                    .from("sponsors")
                    .update({
                        name: formData.name,
                        logo_url: logoUrl,
                        description: formData.description,
                        is_active: formData.is_active,
                        display_order: formData.display_order,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingSponsor.id);

                if (error) throw error;
                toast({ title: "Sukses", description: "Sponsor berhasil diupdate" });
            } else {
                const { error } = await supabase.from("sponsors").insert({
                    name: formData.name,
                    logo_url: logoUrl,
                    description: formData.description,
                    is_active: formData.is_active,
                    display_order: formData.display_order,
                });

                if (error) throw error;
                toast({ title: "Sukses", description: "Sponsor berhasil ditambahkan" });
            }

            setIsDialogOpen(false);
            resetForm();
            fetchSponsors();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menyimpan sponsor",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteSponsor) return;

        try {
            const { error } = await supabase
                .from("sponsors")
                .delete()
                .eq("id", deleteSponsor.id);

            if (error) throw error;
            toast({ title: "Sukses", description: "Sponsor berhasil dihapus" });
            setDeleteSponsor(null);
            fetchSponsors();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menghapus sponsor",
            });
        }
    };

    const toggleActive = async (sponsor: Sponsor) => {
        try {
            const { error } = await supabase
                .from("sponsors")
                .update({
                    is_active: !sponsor.is_active,
                    updated_at: new Date().toISOString()
                })
                .eq("id", sponsor.id);

            if (error) throw error;

            // Update local state immediately for better UX
            setSponsors(prev => prev.map(s =>
                s.id === sponsor.id
                    ? { ...s, is_active: !s.is_active }
                    : s
            ));

            toast({
                title: "Status diubah",
                description: `Sponsor "${sponsor.name}" sekarang ${!sponsor.is_active ? 'aktif' : 'nonaktif'}.`,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal mengubah status",
            });
            // Refetch to ensure data is in sync
            fetchSponsors();
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Sponsor Management</h2>
                        <p className="text-muted-foreground">
                            Kelola sponsor yang ditampilkan di landing page
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Sponsor
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau deskripsi..."
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
                ) : sponsors.length === 0 ? (
                    <Card className="p-12 text-center bg-card border-border">
                        <Handshake className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Belum ada sponsor. Klik tombol "Tambah Sponsor" untuk menambahkan.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <Card className="bg-card border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border bg-muted/30">
                                        <TableHead>Logo</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>Urutan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentSponsors.length > 0 ? (
                                        currentSponsors.map((sponsor) => (
                                            <TableRow
                                                key={sponsor.id}
                                                className="border-border hover:bg-muted/50 transition-colors"
                                            >
                                                <TableCell>
                                                    {sponsor.logo_url ? (
                                                        <img
                                                            src={sponsor.logo_url}
                                                            alt={sponsor.name}
                                                            className="h-12 w-20 object-contain rounded border border-border bg-white p-1"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-20 bg-muted/30 rounded border border-border flex items-center justify-center">
                                                            <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {sponsor.name}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                    {sponsor.description || "-"}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {sponsor.display_order}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={sponsor.is_active}
                                                            onCheckedChange={() => toggleActive(sponsor)}
                                                        />
                                                        <span
                                                            className={`text-sm ${sponsor.is_active
                                                                ? "text-green-500"
                                                                : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            {sponsor.is_active ? "Aktif" : "Nonaktif"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleOpenDialog(sponsor)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => setDeleteSponsor(sponsor)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                Tidak ada sponsor yang ditemukan.
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
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                    }
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

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
            }}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSponsor ? "Edit Sponsor" : "Tambah Sponsor Baru"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Sponsor *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Masukkan nama sponsor"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo Sponsor</Label>
                            <div className="space-y-3">
                                {imagePreview && (
                                    <div className="relative w-full h-32 border border-border rounded-lg overflow-hidden bg-white">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                )}
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Format: JPG, PNG, WebP. Maksimal 2MB.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Deskripsi sponsor (opsional)"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="display_order">Urutan Tampilan</Label>
                            <Input
                                id="display_order"
                                type="number"
                                min="0"
                                value={formData.display_order}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        display_order: parseInt(e.target.value) || 0,
                                    })
                                }
                                placeholder="0"
                            />
                            <p className="text-xs text-muted-foreground">
                                Angka kecil tampil lebih dulu
                            </p>
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

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={saving || uploading}>
                                {(saving || uploading) && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                {uploading ? "Mengupload..." : editingSponsor ? "Update" : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={!!deleteSponsor}
                onOpenChange={(open) => !open && setDeleteSponsor(null)}
                onConfirm={handleDelete}
                title="Hapus Sponsor"
                description={`Apakah Anda yakin ingin menghapus sponsor "${deleteSponsor?.name}"?`}
            />
        </AdminLayout>
    );
};

export default SponsorManagement;
