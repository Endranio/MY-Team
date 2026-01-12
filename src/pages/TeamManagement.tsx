import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Users, Crown, Plus, LogOut, Loader2, Search, UserPlus, Shield, Clock, Check, X, Upload, UserMinus, Trash2, Edit2, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import Header from "@/components/header";

type Team = Tables<"teams">;
type TeamMember = Tables<"team_members">;

interface TeamWithCaptain extends Team {
    captain?: {
        id: string;
        full_name: string;
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

interface TeamManagementProps {
    isAdminPage?: boolean;
}

const TeamManagement = ({ isAdminPage = false }: TeamManagementProps) => {
    const { user, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [myTeam, setMyTeam] = useState<TeamWithCaptain | null>(null);
    const [myMembership, setMyMembership] = useState<TeamMember | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMemberWithProfile[]>([]);
    const [availableTeams, setAvailableTeams] = useState<TeamWithCaptain[]>([]);
    const [pendingRequests, setPendingRequests] = useState<TeamMemberWithProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Form states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newTeam, setNewTeam] = useState({
        team_name: "",
        team_description: "",
        team_logo: null as File | null,
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Edit Team State
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editTeamData, setEditTeamData] = useState({
        team_name: "",
        team_description: "",
        team_logo: null as File | null,
    });
    const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
        const file = e.target.files?.[0] || null;
        if (isEdit) {
            setEditTeamData(prev => ({ ...prev, team_logo: file }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setEditLogoPreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                setEditLogoPreview(null);
            }
        } else {
            setNewTeam(prev => ({ ...prev, team_logo: file }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setLogoPreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                setLogoPreview(null);
            }
        }
    };

    const openEditDialog = () => {
        if (!myTeam) return;
        setEditTeamData({
            team_name: myTeam.team_name,
            team_description: myTeam.team_description || "",
            team_logo: null,
        });
        setEditLogoPreview(myTeam.team_logo);
        setEditDialogOpen(true);
    };

    // Check user's current team status
    const checkUserTeamStatus = async () => {
        if (!user) return;

        try {
            // Check if user is in any team (pending or active)
            const { data: membership, error: memberError } = await supabase
                .from("team_members")
                .select("*, teams(*)")
                .eq("user_id", user.id)
                .in("status", ["pending", "active"])
                .single();

            if (memberError && memberError.code !== "PGRST116") throw memberError;

            if (membership) {
                setMyMembership(membership);

                // Fetch full team details with captain info
                const { data: team, error: teamError } = await supabase
                    .from("teams")
                    .select("*")
                    .eq("id", membership.team_id)
                    .single();

                if (teamError) throw teamError;

                // Get captain profile
                const { data: captain } = await supabase
                    .from("profiles")
                    .select("id, full_name, avatar_url")
                    .eq("id", team.captain_id)
                    .single();

                setMyTeam({ ...team, captain: captain || undefined });

                // If user is in an active approved team (or pending approval), fetch members
                if ((membership.status === "active" || membership.status === "pending") && team.status === "approved") {
                    await fetchTeamMembers(team.id);

                    // If user is captain, fetch pending join requests
                    if (team.captain_id === user.id) {
                        await fetchPendingRequests(team.id);
                    }
                }
            } else {
                // User is not in any team, fetch available teams
                await fetchAvailableTeams();
            }
        } catch (error: any) {
            console.error("Error checking team status:", error);
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
            .eq("status", "active");

        if (error) throw error;

        // Fetch profiles for each member
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

    const fetchPendingRequests = async (teamId: string) => {
        const { data, error } = await supabase
            .from("team_members")
            .select("*")
            .eq("team_id", teamId)
            .eq("status", "pending")
            .eq("role_in_team", "member");

        if (error) throw error;

        // If no pending requests, reset state
        if (!data || data.length === 0) {
            setPendingRequests([]);
            return;
        }

        // Fetch profiles for each requester
        const requesterIds = data.map(m => m.user_id);
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .in("id", requesterIds);

        const requestsWithProfiles = data.map(member => ({
            ...member,
            profile: profiles?.find(p => p.id === member.user_id)
        }));

        setPendingRequests(requestsWithProfiles);
    };

    const fetchAvailableTeams = async () => {
        const { data, error } = await supabase
            .from("teams")
            .select("*")
            .eq("status", "approved")
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Get captain profiles and member counts
        const teamsWithDetails = await Promise.all(
            (data || []).map(async (team) => {
                const { data: captain } = await supabase
                    .from("profiles")
                    .select("id, full_name, avatar_url")
                    .eq("id", team.captain_id)
                    .single();

                const { count } = await supabase
                    .from("team_members")
                    .select("*", { count: "exact", head: true })
                    .eq("team_id", team.id)
                    .eq("status", "active");

                return {
                    ...team,
                    captain: captain || undefined,
                    member_count: count || 0
                };
            })
        );

        setAvailableTeams(teamsWithDetails);
    };

    useEffect(() => {
        checkUserTeamStatus();
    }, [user]);

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setCreateLoading(true);
        try {
            let logoUrl = null;

            // Upload logo if provided
            if (newTeam.team_logo) {
                const fileExt = newTeam.team_logo.name.split(".").pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("team-logos")
                    .upload(fileName, newTeam.team_logo);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("team-logos")
                    .getPublicUrl(fileName);

                logoUrl = publicUrl;
            }

            // Create team (admin gets auto-approved)
            const teamStatus = isAdmin ? "approved" : "pending";

            const { data: team, error: teamError } = await supabase
                .from("teams")
                .insert({
                    team_name: newTeam.team_name,
                    team_description: newTeam.team_description || null,
                    team_logo: logoUrl,
                    captain_id: user.id,
                    status: teamStatus,
                    approved_by: isAdmin ? user.id : null,
                    approved_at: isAdmin ? new Date().toISOString() : null,
                })
                .select()
                .single();

            if (teamError) throw teamError;

            // Add captain as team member
            const memberStatus = isAdmin ? "active" : "pending";

            const { error: memberError } = await supabase
                .from("team_members")
                .insert({
                    team_id: team.id,
                    user_id: user.id,
                    role_in_team: "captain",
                    status: memberStatus,
                    joined_at: isAdmin ? new Date().toISOString() : null,
                });

            if (memberError) throw memberError;

            // Log audit
            await supabase.from("team_audit_logs").insert({
                team_id: team.id,
                user_id: user.id,
                action: "team_created",
                details: { team_name: newTeam.team_name, auto_approved: isAdmin },
            });

            toast({
                title: isAdmin ? "Tim berhasil dibuat!" : "Permintaan tim terkirim!",
                description: isAdmin
                    ? "Tim Anda sudah aktif."
                    : "Menunggu approval dari admin.",
            });

            setCreateDialogOpen(false);
            setNewTeam({ team_name: "", team_description: "", team_logo: null });
            setLogoPreview(null);
            checkUserTeamStatus();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal membuat tim",
            });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleJoinTeam = async (teamId: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from("team_members")
                .insert({
                    team_id: teamId,
                    user_id: user.id,
                    role_in_team: "member",
                    status: "pending",
                });

            if (error) throw error;

            await supabase.from("team_audit_logs").insert({
                team_id: teamId,
                user_id: user.id,
                action: "join_requested",
            });

            toast({
                title: "Permintaan bergabung terkirim!",
                description: "Menunggu approval dari kapten tim.",
            });

            checkUserTeamStatus();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal mengajukan permintaan",
            });
        }
    };

    const handleApproveRequest = async (memberId: string, memberUserId: string) => {
        try {
            const { error } = await supabase
                .from("team_members")
                .update({
                    status: "active",
                    joined_at: new Date().toISOString(),
                })
                .eq("id", memberId);

            if (error) throw error;

            await supabase.from("team_audit_logs").insert({
                team_id: myTeam?.id,
                user_id: user?.id,
                action: "member_approved",
                details: { approved_user_id: memberUserId },
            });

            toast({ title: "Anggota berhasil diterima!" });
            checkUserTeamStatus();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        }
    };

    const handleRejectRequest = async (memberId: string, memberUserId: string) => {
        try {
            const { error } = await supabase
                .from("team_members")
                .update({ status: "rejected" })
                .eq("id", memberId);

            if (error) throw error;

            await supabase.from("team_audit_logs").insert({
                team_id: myTeam?.id,
                user_id: user?.id,
                action: "member_rejected",
                details: { rejected_user_id: memberUserId },
            });

            toast({ title: "Permintaan ditolak." });
            checkUserTeamStatus();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        }
    };

    const handleLeaveTeam = async () => {
        if (!user || !myTeam || !myMembership) return;

        // Check if user is captain
        if (myMembership.role_in_team === "captain") {
            // Check if there are other active members
            const otherMembers = teamMembers.filter(m => m.user_id !== user.id);
            if (otherMembers.length > 0) {
                toast({
                    variant: "destructive",
                    title: "Tidak dapat keluar",
                    description: "Anda harus transfer kapten ke anggota lain terlebih dahulu.",
                });
                return;
            }

            // No other members, delete the team
            try {
                await supabase.from("team_audit_logs").insert({
                    team_id: myTeam.id,
                    user_id: user.id,
                    action: "team_deleted",
                    details: { reason: "Captain left with no members" },
                });

                const { error } = await supabase
                    .from("teams")
                    .delete()
                    .eq("id", myTeam.id);

                if (error) throw error;

                toast({ title: "Tim berhasil dihapus." });
                setMyTeam(null);
                setMyMembership(null);
                setTeamMembers([]);
                checkUserTeamStatus();
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message,
                });
            }
        } else {
            // Regular member leaving
            try {
                const { error } = await supabase
                    .from("team_members")
                    .update({ status: "left" })
                    .eq("id", myMembership.id);

                if (error) throw error;

                await supabase.from("team_audit_logs").insert({
                    team_id: myTeam.id,
                    user_id: user.id,
                    action: "member_left",
                });

                toast({ title: "Anda telah keluar dari tim." });
                setMyTeam(null);
                setMyMembership(null);
                setTeamMembers([]);
                checkUserTeamStatus();
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message,
                });
            }
        }
    };

    const handleKickMember = async (memberId: string, memberName: string) => {
        if (!user || !myTeam) return;

        try {
            const { error } = await supabase
                .from("team_members")
                .delete()
                .eq("id", memberId)
                .eq("team_id", myTeam.id);

            if (error) throw error;

            await supabase.from("team_audit_logs").insert({
                team_id: myTeam.id,
                user_id: user.id,
                action: "member_removed",
                details: { removed_member_name: memberName },
            });

            toast({ title: `Anggota ${memberName} berhasil dikeluarkan.` });

            // Optimistic update
            setTeamMembers(prev => prev.filter(m => m.id !== memberId));
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal mengeluarkan anggota.",
            });
        }
    };

    const handleTransferCaptain = async (newCaptainId: string) => {
        if (!user || !myTeam) return;

        try {
            // Update old captain to member
            const { error: oldCaptainError } = await supabase
                .from("team_members")
                .update({ role_in_team: "member" })
                .eq("team_id", myTeam.id)
                .eq("user_id", user.id);

            if (oldCaptainError) {
                console.error("Failed to update old captain:", oldCaptainError);
                throw oldCaptainError;
            }

            // Update new captain
            const { error: newCaptainError } = await supabase
                .from("team_members")
                .update({ role_in_team: "captain" })
                .eq("team_id", myTeam.id)
                .eq("user_id", newCaptainId);

            if (newCaptainError) {
                console.error("Failed to update new captain:", newCaptainError);
                throw newCaptainError;
            }

            // Update team captain_id
            const { error: teamError } = await supabase
                .from("teams")
                .update({ captain_id: newCaptainId })
                .eq("id", myTeam.id);

            if (teamError) {
                console.error("Failed to update team captain_id:", teamError);
                throw teamError;
            }

            await supabase.from("team_audit_logs").insert({
                team_id: myTeam.id,
                user_id: user.id,
                action: "captain_transferred",
                details: { new_captain_id: newCaptainId },
            });

            toast({ title: "Kapten berhasil dipindahkan!" });
            checkUserTeamStatus();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal memindahkan kapten. Silakan coba lagi.",
            });
        }
    };

    const handleUpdateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !myTeam) return;

        setEditLoading(true);
        try {
            let logoUrl = myTeam.team_logo;

            // Upload new logo if provided
            if (editTeamData.team_logo) {
                const fileExt = editTeamData.team_logo.name.split(".").pop();
                const fileName = `${user.id}/${Date.now()}_edit.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("team-logos")
                    .upload(fileName, editTeamData.team_logo);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("team-logos")
                    .getPublicUrl(fileName);

                logoUrl = publicUrl;
            }

            const { error } = await supabase
                .from("teams")
                .update({
                    team_name: editTeamData.team_name,
                    team_description: editTeamData.team_description,
                    team_logo: logoUrl
                })
                .eq("id", myTeam.id);

            if (error) throw error;

            await supabase.from("team_audit_logs").insert({
                team_id: myTeam.id,
                user_id: user.id,
                action: "team_updated",
                details: {
                    old_name: myTeam.team_name,
                    new_name: editTeamData.team_name
                }
            });

            toast({ title: "Tim berhasil diperbarui!" });
            setEditDialogOpen(false);
            checkUserTeamStatus();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Gagal memperbarui tim",
            });
        } finally {
            setEditLoading(false);
        }
    };

    const filteredTeams = availableTeams.filter(team =>
        team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // User has a team (pending or active)
    if (myTeam && myMembership) {
        const isCaptain = myMembership.role_in_team === "captain";
        const isPending = myMembership.status === "pending" || myTeam.status === "pending";

        return (
            <div>
                {!isAdminPage && <Header />}

                {/* Edit Team Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Tim</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi tim Anda di sini.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateTeam} className="space-y-4 py-4">
                            <div className="flex justify-center mb-6">
                                <div className="relative group cursor-pointer">
                                    <Avatar className="h-24 w-24 border-2 border-border group-hover:border-primary transition-all">
                                        <AvatarImage src={editLogoPreview || undefined} />
                                        <AvatarFallback className="text-2xl">
                                            {editTeamData.team_name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => handleLogoChange(e, true)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nama Tim</Label>
                                <Input
                                    id="edit-name"
                                    value={editTeamData.team_name}
                                    onChange={(e) => setEditTeamData({ ...editTeamData, team_name: e.target.value })}
                                    placeholder="Masukkan nama tim"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-desc">Deskripsi</Label>
                                <Textarea
                                    id="edit-desc"
                                    value={editTeamData.team_description}
                                    onChange={(e) => setEditTeamData({ ...editTeamData, team_description: e.target.value })}
                                    placeholder="Ceritakan tentang tim Anda..."
                                    className="resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editLoading}>
                                    {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className={isAdminPage ? "space-y-6" : "space-y-6 m-6"}>
                    {/* Team Status Banner */}
                    {isPending && (
                        <Card className="bg-yellow-500/10 border-yellow-500/50">
                            <CardContent className="py-4 flex items-center gap-3">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="font-medium text-yellow-500">
                                        {myTeam.status === "pending"
                                            ? "Tim sedang menunggu approval admin"
                                            : "Menunggu approval kapten tim"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Anda akan mendapat notifikasi setelah disetujui.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {myTeam.status === "rejected" && (
                        <Card className="bg-destructive/10 border-destructive/50">
                            <CardContent className="py-4 flex items-center gap-3">
                                <X className="h-5 w-5 text-destructive" />
                                <div>
                                    <p className="font-medium text-destructive">Tim ditolak oleh admin</p>
                                    <p className="text-sm text-muted-foreground">
                                        Silakan buat tim baru atau bergabung ke tim lain.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Team Info Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={myTeam.team_logo || undefined} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {myTeam.team_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-2xl">{myTeam.team_name}</CardTitle>
                                    <Badge variant={myTeam.status === "approved" ? "default" : "secondary"}>
                                        {myTeam.status === "approved" ? "Aktif" : myTeam.status === "pending" ? "Pending" : "Ditolak"}
                                    </Badge>
                                    {isCaptain && (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/50">
                                                <Crown className="h-3 w-3 mr-1" />
                                                Kapten
                                            </Badge>
                                            <Button size="sm" variant="ghost" onClick={openEditDialog}>
                                                <Edit2 className="h-3 w-3 mr-1" />
                                                Edit Tim
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <CardDescription className="mt-1">
                                    {myTeam.team_description || "Tidak ada deskripsi"}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Captain Info */}
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Crown className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Kapten Tim</p>
                                    <p className="font-medium">{myTeam.captain?.full_name || "Unknown"}</p>
                                </div>
                            </div>

                            {/* Team Members */}
                            {myTeam.status === "approved" && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Anggota Tim ({teamMembers.length})
                                    </h4>
                                    <div className="space-y-2">
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
                                                        <p className="font-medium flex items-center gap-2">
                                                            {member.profile?.full_name}
                                                            {member.role_in_team === "captain" && (
                                                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 px-1.5 py-0 h-5 text-[10px] md:hidden">
                                                                    Kapten
                                                                </Badge>
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {member.role_in_team === "captain" && (
                                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 hidden md:inline-flex">
                                                            <Crown className="h-3 w-3 mr-1" />
                                                            Kapten
                                                        </Badge>
                                                    )}
                                                    {isCaptain && member.user_id !== user?.id && (
                                                        <>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                                        Keluarkan
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Keluarkan Anggota?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Apakah Anda yakin ingin mengeluarkan {member.profile?.full_name} dari tim?
                                                                            Mereka harus meminta bergabung lagi jika ingin kembali.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            onClick={() => handleKickMember(member.id, member.profile?.full_name || "Anggota")}
                                                                        >
                                                                            Keluarkan
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>

                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button size="sm" variant="outline">
                                                                        <Crown className="h-3 w-3 mr-1" />
                                                                        Jadikan Kapten
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Transfer Kapten?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Anda akan menyerahkan posisi kapten kepada {member.profile?.full_name}.
                                                                            Anda akan menjadi anggota biasa setelah ini.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleTransferCaptain(member.user_id)}>
                                                                            Transfer
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pending Join Requests (Captain Only) */}
                            {isCaptain && pendingRequests.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Permintaan Bergabung ({pendingRequests.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {pendingRequests.map((request) => (
                                            <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={request.profile?.avatar_url || undefined} />
                                                        <AvatarFallback>
                                                            {request.profile?.full_name?.charAt(0) || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{request.profile?.full_name}</p>
                                                        <p className="text-sm text-muted-foreground">{request.profile?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 hover:bg-green-500/10"
                                                        onClick={() => handleApproveRequest(request.id, request.user_id)}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleRejectRequest(request.id, request.user_id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Leave Team Button */}
                            {myTeam.status !== "rejected" && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                            <LogOut className="h-4 w-4 mr-2" />
                                            {isCaptain && teamMembers.length <= 1 ? "Hapus Tim" : "Keluar Tim"}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                {isCaptain && teamMembers.length <= 1 ? "Hapus Tim?" : "Keluar dari Tim?"}
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {isCaptain && teamMembers.length > 1
                                                    ? "Anda harus memindahkan posisi kapten ke anggota lain terlebih dahulu sebelum keluar."
                                                    : isCaptain
                                                        ? "Karena tidak ada anggota lain, tim akan dihapus secara permanen."
                                                        : "Anda yakin ingin keluar dari tim ini?"}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            {!(isCaptain && teamMembers.length > 1) && (
                                                <AlertDialogAction onClick={handleLeaveTeam} className="bg-destructive hover:bg-destructive/90">
                                                    {isCaptain ? "Hapus Tim" : "Keluar"}
                                                </AlertDialogAction>
                                            )}
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // User doesn't have a team - show available teams and create option
    return (
        <div>
            {!isAdminPage && <Header />}
            <div className={isAdminPage ? "space-y-6" : "space-y-6 m-6"}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Tim Saya</h2>
                        <p className="text-muted-foreground">
                            Anda belum memiliki tim. Buat tim baru atau bergabung ke tim yang ada.
                        </p>
                    </div>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Tim
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Buat Tim Baru</DialogTitle>
                                <DialogDescription>
                                    {isAdmin
                                        ? "Tim Anda akan langsung aktif tanpa perlu approval."
                                        : "Tim Anda akan menunggu approval dari admin."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="team_name">Nama Tim *</Label>
                                    <Input
                                        id="team_name"
                                        value={newTeam.team_name}
                                        onChange={(e) => setNewTeam({ ...newTeam, team_name: e.target.value })}
                                        placeholder="Masukkan nama tim"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="team_description">Deskripsi</Label>
                                    <Textarea
                                        id="team_description"
                                        value={newTeam.team_description}
                                        onChange={(e) => setNewTeam({ ...newTeam, team_description: e.target.value })}
                                        placeholder="Deskripsi tim (opsional)"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="team_logo">Logo Tim</Label>
                                    <Input
                                        id="team_logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                    {logoPreview && (
                                        <div className="mt-3 flex justify-center">
                                            <div className="relative">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="w-24 h-24 rounded-lg object-cover border-2 border-primary/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNewTeam(prev => ({ ...prev, team_logo: null }));
                                                        setLogoPreview(null);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Button type="submit" className="w-full" disabled={createLoading}>
                                    {createLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {isAdmin ? "Buat Tim" : "Ajukan Tim"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari tim..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Available Teams */}
                {filteredTeams.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {searchTerm ? "Tidak ada tim yang sesuai pencarian." : "Belum ada tim yang tersedia."}
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTeams.map((team) => (
                            <Card key={team.id} className="hover:border-primary/50 transition-colors">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Avatar className="h-14 w-14">
                                        <AvatarImage src={team.team_logo || undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {team.team_name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg truncate">{team.team_name}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <Users className="h-3 w-3" />
                                            {team.member_count} anggota
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {team.team_description || "Tidak ada deskripsi"}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Crown className="h-4 w-4 text-yellow-500" />
                                        <span className="text-muted-foreground">Kapten:</span>
                                        <span className="font-medium truncate">{team.captain?.full_name}</span>
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => handleJoinTeam(team.id)}
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Minta Bergabung
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamManagement;
