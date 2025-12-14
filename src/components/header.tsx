import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Calendar, LogOut, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";



const Header = () => {
    const { signOut } = useAuth();
    return (
        <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <a href="/dashboard" className="flex items-center gap-2">
                    <Gamepad2 className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                        GameHub
                    </h1>
                </a>
                <div className="flex items-center gap-2">
                    <Link to="/team" className="flex-shrink-0">
                        <Button variant="outline" className="hover:bg-primary/10 flex-shrink-0">
                            <Users className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Tim Saya</span>
                        </Button>
                    </Link>
                    <Button variant="ghost" className="hover:bg-destructive/10 hover:text-destructive" onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;