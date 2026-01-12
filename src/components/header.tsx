import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2, Calendar, LogOut, Users, Home, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
    const { signOut } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/team", label: "Tim Saya", icon: Users },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <Gamepad2 className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            GameHub
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link key={item.href} to={item.href}>
                                <Button
                                    variant={isActive(item.href) ? "default" : "ghost"}
                                    className={`gap-2 ${isActive(item.href)
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-primary/10"
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                        <div className="w-px h-6 bg-border mx-2" />
                        <Button
                            variant="ghost"
                            className="gap-2 hover:bg-destructive/10 hover:text-destructive"
                            onClick={signOut}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden transition-all duration-300"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <div className={`transition-all duration-300 ${mobileMenuOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </div>
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <div
                className={`md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-md border-b border-border/40 shadow-lg transition-all duration-300 ease-in-out transform origin-top ${mobileMenuOpen
                        ? 'opacity-100 translate-y-0 visible'
                        : 'opacity-0 -translate-y-4 invisible pointer-events-none'
                    }`}
            >
                <nav className="container mx-auto px-4 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Button
                                variant={isActive(item.href) ? "default" : "ghost"}
                                className={`w-full justify-start gap-2 mb-2 ${isActive(item.href)
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-primary/10"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                    <div className="border-t border-border/40 pt-2 mt-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive"
                            onClick={signOut}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;