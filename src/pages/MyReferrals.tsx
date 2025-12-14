import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ChevronLeft, ChevronRight, UserCheck } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ReferredUser {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    created_at: string;
}

const MyReferrals = () => {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState<ReferredUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchReferrals = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone, created_at')
                .eq('referred_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setReferrals(data || []);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal memuat data referral",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, [user]);

    // Filter and Pagination Logic
    const filteredReferrals = referrals.filter(referral =>
        referral.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referral.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReferrals = filteredReferrals.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <UserCheck className="h-8 w-8 text-primary" />
                            Referral Saya
                        </h2>
                        <p className="text-muted-foreground">
                            Daftar user yang memilih Anda saat registrasi ({referrals.length} orang)
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau email..."
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
                ) : referrals.length === 0 ? (
                    <Card className="p-12 text-center bg-card border-border">
                        <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">Belum ada user yang memilih Anda.</p>
                        <p className="text-muted-foreground text-sm mt-2">
                            User yang memilih nama Anda saat registrasi akan muncul di sini.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <Card className="bg-card border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border bg-muted/30">
                                        <TableHead>No</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>No. Telepon</TableHead>
                                        <TableHead>Tanggal Bergabung</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentReferrals.length > 0 ? (
                                        currentReferrals.map((referral, index) => (
                                            <TableRow key={referral.id} className="border-border hover:bg-muted/50 transition-colors">
                                                <TableCell className="text-muted-foreground">
                                                    {indexOfFirstItem + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">{referral.full_name}</TableCell>
                                                <TableCell className="text-muted-foreground">{referral.email}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {referral.phone || "-"}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(referral.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                Tidak ada user yang ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredReferrals.length)} dari {filteredReferrals.length} user
                                </p>
                                <div className="flex items-center space-x-2">
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
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default MyReferrals;
