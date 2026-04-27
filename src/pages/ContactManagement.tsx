import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

type Contact = Tables<"contacts">;

const ContactManagement = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
    const [saving, setSaving] = useState(false);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
    });

    const fetchContacts = async () => {
        try {
            const { data, error } = await supabase
                .from("contacts")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setContacts(data || []);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal memuat data kontak",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // Filter and Pagination Logic
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContacts = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);

    const resetForm = () => {
        setFormData({
            name: "",
            phone: "",
        });
        setEditingContact(null);
    };

    const handleOpenDialog = (contact?: Contact) => {
        if (contact) {
            setEditingContact(contact);
            setFormData({
                name: contact.name,
                phone: contact.phone,
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
            if (editingContact) {
                const { error } = await supabase
                    .from("contacts")
                    .update({
                        name: formData.name,
                        phone: formData.phone,
                    })
                    .eq("id", editingContact.id);

                if (error) throw error;
                toast({ title: "Sukses", description: "Kontak berhasil diupdate" });
            } else {
                const { error } = await supabase.from("contacts").insert({
                    name: formData.name,
                    phone: formData.phone,
                });

                if (error) throw error;
                toast({ title: "Sukses", description: "Kontak berhasil ditambahkan" });
            }

            setIsDialogOpen(false);
            resetForm();
            fetchContacts();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menyimpan kontak",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteContact) return;

        try {
            const { error } = await supabase
                .from("contacts")
                .delete()
                .eq("id", deleteContact.id);

            if (error) throw error;
            toast({ title: "Sukses", description: "Kontak berhasil dihapus" });
            setDeleteContact(null);
            fetchContacts();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal menghapus kontak",
            });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Contact Us Management</h2>
                        <p className="text-muted-foreground">
                            Kelola daftar kontak yang ditampilkan di footer landing page
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Kontak
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingContact ? "Edit Kontak" : "Tambah Kontak Baru"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="Contoh: Admin CS"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Nomor WhatsApp</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        placeholder="Contoh: 6281234567890"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">Mulai dengan kode negara (contoh: 62) tanpa karakter tambahan.</p>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={saving}>
                                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {editingContact ? "Update" : "Simpan"}
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
                            placeholder="Cari nama atau nomor..."
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
                ) : contacts.length === 0 ? (
                    <Card className="p-12 text-center bg-card border-border">
                        <p className="text-muted-foreground">Belum ada kontak. Klik tombol "Tambah Kontak" untuk menambahkan.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <Card className="bg-card border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border bg-muted/30">
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Nomor WhatsApp</TableHead>
                                        <TableHead>Tanggal Dibuat</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentContacts.length > 0 ? (
                                        currentContacts.map((contact) => (
                                            <TableRow key={contact.id} className="border-border hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium">
                                                    {contact.name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{contact.phone}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(contact.created_at).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleOpenDialog(contact)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => setDeleteContact(contact)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                Tidak ada kontak yang ditemukan.
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
                open={!!deleteContact}
                onOpenChange={(open) => !open && setDeleteContact(null)}
                onConfirm={handleDelete}
                title="Hapus Kontak"
                description={`Apakah Anda yakin ingin menghapus kontak "${deleteContact?.name}"?`}
            />
        </AdminLayout>
    );
};

export default ContactManagement;
