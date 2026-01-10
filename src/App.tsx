import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import EventManagement from "./pages/EventManagement";
import StreamManagement from "./pages/StreamManagement";
import TestimonialManagement from "./pages/TestimonialManagement";
import InfoCardManagement from "./pages/InfoCardManagement";
import MyReferrals from "./pages/MyReferrals";
import TeamManagement from "./pages/TeamManagement";
import AdminTeamApproval from "./pages/AdminTeamApproval";
import AdminMyTeam from "./pages/AdminMyTeam";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute requireAdmin>
                <EventManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/streams" element={
              <ProtectedRoute requireAdmin>
                <StreamManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/testimonials" element={
              <ProtectedRoute requireAdmin>
                <TestimonialManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/info-cards" element={
              <ProtectedRoute requireAdmin>
                <InfoCardManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/referrals" element={
              <ProtectedRoute requireAdmin>
                <MyReferrals />
              </ProtectedRoute>
            } />
            <Route path="/admin/teams" element={
              <ProtectedRoute requireAdmin>
                <AdminTeamApproval />
              </ProtectedRoute>
            } />
            <Route path="/admin/my-team" element={
              <ProtectedRoute requireAdmin>
                <AdminMyTeam />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <TeamManagement />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;