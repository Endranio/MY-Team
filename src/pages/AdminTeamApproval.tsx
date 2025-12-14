import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Crown, Loader2, Search, Check, X, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import AdminLayout from "@/components/AdminLayout";

type Team = Tables<"teams">;
type TeamMember = Tables<"team_members">;

interface TeamWithDetails extends Team {
    captain?: {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string | null;
    };
    member_count?: number;
}

interface TeamMemberWithProfile extends TeamMember {
    profile?: {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string | null;
    };
}

const AdminTeamApproval = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<TeamWithDetails[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("pending");

    // Detail dialog
    const [selectedTeam, setSelectedTeam] = useState<TeamWithDetails | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMemberWithProfile[]>([]);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Action dialogs
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            let query = supabase.from("teams").select("*");

            if (activeTab === "pending") {
                query = query.eq("status", "pending");
            } else if (activeTab === "approved") {
                query = query.eq("status", "approved");
            } else if (activeTab === "rejected") {
                query = query.eq("status", "rejected");
            }

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) throw error;

            // Get captain profiles and member counts
            const teamsWithDetails = await Promise.all(
                (data || []).map(async (team) => {
                    const { data: captain } = await supabase
                        .from("profiles")
                        .select("id, full_name, email, avatar_url")
                        .eq("id", team.captain_id)
                        .single();

                    const { count } = await supabase
                        .from("team_members")
                        .select("*", { count: "exact", head: true })
                        .eq("team_id", team.id)
                        .in("status", ["pending", "active"]);

                    return {
                        ...team,
                        captain: captain || undefined,
                        member_count: count || 0
                    };
                })
            );

            setTeams(teamsWithDetails);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal memuat data tim",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamMembers = async (teamId: string) => {
        const { data, error } = await supabase
            .from("team_members")
            .select("*")
            .eq("team_id", teamId)
            .in("status", ["pending", "active"]);

        if (error) throw error;

        // Fetch profiles
        const memberIds = data.map(m => m.user_id);
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .in("id", memberIds);

        const membersWithProfiles = data.map(member => ({
            ...member,
            profile: profiles?.find(p => p.id === member.user_id)
        }));

        setTeamMembers(membersWithProfiles);
    };

    useEffect(() => {
        fetchTeams();
    }, [activeTab]);

    const handleViewDetails = async (team: TeamWithDetails) => {
        setSelectedTeam(team);
        await fetchTeamMembers(team.id);
        setDetailDialogOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedTeam || !user) return;

        setActionLoading(true);
        try {
            // Update team status
            const { error: teamError } = await supabase
                .from("teams")
                .update({
                    status: "approved",
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                })
                .eq("id", selectedTeam.id);

            if (teamError) throw teamError;

            // Update captain member status to active
            const { error: memberError } = await supabase
                .from("team_members")
                .update({
                    status: "active",
                    joined_at: new Date().toISOString(),
                })
                .eq("team_id", selectedTeam.id)
                .eq("role_in_team", "captain");

            if (memberError) throw memberError;

            // Log audit
            await supabase.from("team_audit_logs").insert({
                team_id: selectedTeam.id,
                user_id: user.id,
                action: "team_approved",
                details: { approved_by_name: "Admin" },
            });

            toast({
                title: "Tim disetujui!",
                description: `Tim "${selectedTeam.team_name}" berhasil diaktifkan.`,
            });

            setApproveDialogOpen(false);
            setDetailDialogOpen(false);
            fetchTeams();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedTeam || !user) return;

        setActionLoading(true);
        try {
            // Update team status
            const { error: teamError } = await supabase
                .from("teams")
                .update({
                    status: "rejected",
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                })
                .eq("id", selectedTeam.id);

            if (teamError) throw teamError;

            // Update captain member status to rejected
            const { error: memberError } = await supabase
                .from("team_members")
                .update({ status: "rejected" })
                .eq("team_id", selectedTeam.id)
                .eq("role_in_team", "captain");

            if (memberError) throw memberError;

            // Log audit
            await supabase.from("team_audit_logs").insert({
                team_id: selectedTeam.id,
                user_id: user.id,
                action: "team_rejected",
            });

            toast({
                title: "Tim ditolak",
                description: `Tim "${selectedTeam.team_name}" telah ditolak.`,
            });

            setRejectDialogOpen(false);
            setDetailDialogOpen(false);
            fetchTeams();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setActionLoading(false);
        }
    };

    const filteredTeams = teams.filter(team =>
        team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.captain?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/50"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case "approved":
                return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/50"><CheckCircle className="h-3 w-3 mr-1" />Aktif</Badge>;
            case "rejected":
                return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/50"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AdminLayout>
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Manajemen Tim</h2>
                <p className="text-muted-foreground">Kelola permintaan dan status tim.</p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Aktif
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Ditolak
                    </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari tim atau kapten..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Teams Table */}
                    <TabsContent value={activeTab} className="mt-0">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredTeams.length === 0 ? (
                            <Card className="p-12 text-center">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    {searchTerm
                                        ? "Tidak ada tim yang sesuai pencarian."
                                        : `Tidak ada tim dengan status ${activeTab}.`}
                                </p>
                            </Card>
                        ) : (
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tim</TableHead>
                                            <TableHead>Kapten</TableHead>
                                            <TableHead>Anggota</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTeams.map((team) => (
                                            <TableRow key={team.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={team.team_logo || undefined} />
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {team.team_name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{team.team_name}</p>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {team.team_description || "Tidak ada deskripsi"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Crown className="h-4 w-4 text-yellow-500" />
                                                        <span>{team.captain?.full_name || "Unknown"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span>{team.member_count}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(team.status)}</TableCell>
                                                <TableCell>
                                                    {new Date(team.created_at).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewDetails(team)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {team.status === "pending" && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-green-600 hover:bg-green-500/10"
                                                                    onClick={() => {
                                                                        setSelectedTeam(team);
                                                                        setApproveDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-destructive hover:bg-destructive/10"
                                                                    onClick={() => {
                                                                        setSelectedTeam(team);
                                                                        setRejectDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}
                    </TabsContent>
                </div>
            </Tabs>

            {/* Team Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={selectedTeam?.team_logo || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {selectedTeam?.team_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {selectedTeam?.team_name}
                            {selectedTeam && getStatusBadge(selectedTeam.status)}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTeam?.team_description || "Tidak ada deskripsi"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Captain Info */}
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Crown className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Kapten Tim</p>
                                <p className="font-medium">{selectedTeam?.captain?.full_name}</p>
                                <p className="text-sm text-muted-foreground">{selectedTeam?.captain?.email}</p>
                            </div>
                        </div>

                        {/* Members */}
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Anggota ({teamMembers.length})
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {teamMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.profile?.avatar_url || undefined} />
                                                <AvatarFallback>
                                                    {member.profile?.full_name?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.profile?.full_name}</p>
                                                <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {member.role_in_team === "captain" && (
                                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                                                    <Crown className="h-3 w-3 mr-1" />
                                                    Kapten
                                                </Badge>
                                            )}
                                            <Badge variant={member.status === "active" ? "default" : "secondary"}>
                                                {member.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions for pending teams */}
                        {selectedTeam?.status === "pending" && (
                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => setApproveDialogOpen(true)}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Setujui Tim
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => setRejectDialogOpen(true)}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Tolak Tim
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Setujui Tim?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tim "{selectedTeam?.team_name}" akan diaktifkan dan dapat mulai menerima anggota baru.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Setujui
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tolak Tim?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tim "{selectedTeam?.team_name}" akan ditolak. Kapten harus membuat tim baru jika ingin mencoba lagi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={actionLoading}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Tolak
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        </AdminLayout>
    );
};

export default AdminTeamApproval;
