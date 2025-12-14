import AdminLayout from "@/components/AdminLayout";
import TeamManagement from "@/pages/TeamManagement";

const AdminMyTeam = () => {
    return (
        <AdminLayout>
            <TeamManagement isAdminPage={true} />
        </AdminLayout>
    );
};

export default AdminMyTeam;
