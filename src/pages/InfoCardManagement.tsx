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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Info, Plus, Pencil, Trash2, Loader2, Search, ChevronLeft, ChevronRight, Mail, Phone, Image, Upload, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

type InfoCard = Tables<"info_cards">;

const InfoCardManagement = () => {
    const [infoCards, setInfoCards] = useState<InfoCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingInfoCard, setEditingInfoCard] = useState<InfoCard | null>(null);
    const [deleteInfoCard, setDeleteInfoCard] = useState<InfoCard | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        prize_image_url: "",
        contact_email: "",
        contact_whatsapp: "",
        display_order: 0,
        is_active: true,
    });

    const fetchInfoCards = async () => {
        try {
            const { data, error } = await supabase
                .from("info_cards")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) throw error;
            setInfoCards(data || []);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal memuat data info cards",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInfoCards();
    }, []);

    // Filter and Pagination Logic
    const filteredInfoCards = infoCards.filter(card =>
        card.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredInfoCards.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentInfoCards = filteredInfoCards.slice(indexOfFirstItem, indexOfLastItem);

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            prize_image_url: "",
            contact_email: "",
            contact_whatsapp: "",
            display_order: 0,
            is_active: true,
        });
        setEditingInfoCard(null);
        setImageFile(null);
        setImagePreview("");
    };

    const handleOpenDialog = (infoCard?: InfoCard) => {
        if (infoCard) {
            setEditingInfoCard(infoCard);
            setFormData({
                title: infoCard.title,
                description: infoCard.description || "",
                prize_image_url: infoCard.prize_image_url || "",
                contact_email: infoCard.contact_email || "",
                contact_whatsapp: infoCard.contact_whatsapp || "",
                display_order: infoCard.display_order,
                is_active: infoCard.is_active,
            });
            setImagePreview(infoCard.prize_image_url || "");
            setImageFile(null);
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

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
        const fileName = `info-cards/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('my-team')
            .upload(fileName, file, {
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
            .getPublicUrl(fileName);

        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setUploading(true);

        try {
            let imageUrl = formData.prize_image_url;

            // Upload new image if file is selected
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            if (editingInfoCard) {
                const { error } = await supabase
                    .from("info_cards")
                    .update({
                        title: formData.title,
                        description: formData.description || null,
                        prize_image_url: imageUrl || null,
                        contact_email: formData.contact_email || null,
                        contact_whatsapp: formData.contact_whatsapp || null,
                        display_order: formData.display_order,
                        is_active: formData.is_active,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingInfoCard.id);

                if (error) throw error;
                toast({ title: "Sukses", description: "Info Card berhasil diupdate" });
            } else {
                const { error } = await supabase.from("info_cards").insert({
                    title: formData.title,
                    description: formData.description || null,
                    prize_image_url: imageUrl || null,
                    contact_email: formData.contact_email || null,
                    contact_whatsapp: formData.contact_whatsapp || null,
                    display_order: formData.display_order,
                    is_active: formData.is_active,
                });

                if (error) throw error;
                toast({ title: "Sukses", description: "Info Card berhasil ditambahkan" });
            }

            setIsDialogOpen(false);
            resetForm();
            fetchInfoCards();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menyimpan info card",
            });
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteInfoCard) return;

        try {
            const { error } = await supabase
                .from("info_cards")
                .delete()
                .eq("id", deleteInfoCard.id);

            if (error) throw error;
            toast({ title: "Sukses", description: "Info Card berhasil dihapus" });
            setDeleteInfoCard(null);
            fetchInfoCards();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menghapus info card",
            });
        }
    };

    const toggleActive = async (infoCard: InfoCard) => {
        try {
            const { error } = await supabase
                .from("info_cards")
                .update({ is_active: !infoCard.is_active, updated_at: new Date().toISOString() })
                .eq("id", infoCard.id);

            if (error) throw error;
            fetchInfoCards();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal mengubah status",
            });
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(editingInfoCard?.prize_image_url || "");
        if (!editingInfoCard?.prize_image_url) {
            setFormData({ ...formData, prize_image_url: "" });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Info Card Management</h2>
                        <p className="text-muted-foreground">
                            Kelola informasi, gambar hadiah, dan kontak di landing page
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Info Card
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar bg-card border-border">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingInfoCard ? "Edit Info Card" : "Tambah Info Card Baru"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        placeholder="Masukkan judul"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        placeholder="Tulis deskripsi di sini..."
                                        rows={3}
                                    />
                                </div>

                                {/* Image Upload Section */}
                                <div className="space-y-2">
                                    <Label>Gambar Hadiah</Label>
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-40 object-cover rounded-md border border-border"
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
                                                    setImagePreview("");
                                                    setFormData({ ...formData, prize_image_url: "" });
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
                                                Klik untuk upload gambar hadiah
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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email">Email Kontak</Label>
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            value={formData.contact_email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, contact_email: e.target.value })
                                            }
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_whatsapp">WhatsApp</Label>
                                        <Input
                                            id="contact_whatsapp"
                                            value={formData.contact_whatsapp}
                                            onChange={(e) =>
                                                setFormData({ ...formData, contact_whatsapp: e.target.value })
                                            }
                                            placeholder="6281234567890"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="display_order">Urutan Tampil</Label>
                                    <Input
                                        id="display_order"
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) =>
                                            setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                                        }
                                        placeholder="0"
                                    />
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
                                        {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {editingInfoCard ? "Update" : "Simpan"}
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
                            placeholder="Cari judul atau deskripsi..."
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
                ) : infoCards.length === 0 ? (
                    <Card className="p-12 text-center bg-card border-border">
                        <p className="text-muted-foreground">Belum ada info card. Klik tombol "Tambah Info Card" untuk menambahkan.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <Card className="bg-card border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border bg-muted/30">
                                        <TableHead>Urutan</TableHead>
                                        <TableHead>Judul</TableHead>
                                        <TableHead>Gambar</TableHead>
                                        <TableHead>Kontak</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentInfoCards.length > 0 ? (
                                        currentInfoCards.map((infoCard) => (
                                            <TableRow key={infoCard.id} className="border-border hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-mono text-center">
                                                    {infoCard.display_order}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <p>{infoCard.title}</p>
                                                        {infoCard.description && (
                                                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                                {infoCard.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {infoCard.prize_image_url ? (
                                                        <img
                                                            src={infoCard.prize_image_url}
                                                            alt="Hadiah"
                                                            className="h-12 w-16 object-cover rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-16 bg-muted/50 rounded-md flex items-center justify-center">
                                                            <Image className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {infoCard.contact_email && (
                                                            <a
                                                                href={`mailto:${infoCard.contact_email}`}
                                                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                                                            >
                                                                <Mail className="h-3 w-3" />
                                                                {infoCard.contact_email}
                                                            </a>
                                                        )}
                                                        {infoCard.contact_whatsapp && (
                                                            <a
                                                                href={`https://wa.me/${infoCard.contact_whatsapp}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-xs text-green-500 hover:underline"
                                                            >
                                                                <Phone className="h-3 w-3" />
                                                                {infoCard.contact_whatsapp}
                                                            </a>
                                                        )}
                                                        {!infoCard.contact_email && !infoCard.contact_whatsapp && (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={infoCard.is_active}
                                                            onCheckedChange={() => toggleActive(infoCard)}
                                                        />
                                                        <span
                                                            className={`text-sm ${infoCard.is_active
                                                                ? "text-green-500"
                                                                : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            {infoCard.is_active ? "Aktif" : "Nonaktif"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleOpenDialog(infoCard)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => setDeleteInfoCard(infoCard)}
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
                                                Tidak ada info card yang ditemukan.
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
                open={!!deleteInfoCard}
                onOpenChange={(open) => !open && setDeleteInfoCard(null)}
                onConfirm={handleDelete}
                title="Hapus Info Card"
                description={`Apakah Anda yakin ingin menghapus info card "${deleteInfoCard?.title}"?`}
            />
        </AdminLayout>
    );
};

export default InfoCardManagement;
