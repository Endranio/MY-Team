import { Button } from "@/components/ui/button";
import { Gamepad2, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isHomePage = location.pathname === "/";

    const scrollToSection = (sectionId: string) => {
        if (!isHomePage) {
            // If not on home page, navigate to home first
            window.location.href = `/#${sectionId}`;
            return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setMobileMenuOpen(false);
        }
    };

    const navLinks = [
        { id: "home", label: "Home" },
        { id: "features", label: "Features" },
        { id: "testimonials", label: "Testimonials" },
        { id: "about", label: "About" },
    ];

    return (
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <Gamepad2 className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            MY Team
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => scrollToSection(link.id)}
                                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                                {link.label}
                            </button>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="hidden md:block">
                            <Button variant="ghost" className="hover:bg-primary/10">
                                Login
                            </Button>
                        </Link>
                        <Link to="/register" className="hidden md:block">
                            <Button className="bg-primary hover:bg-primary/90">
                                Register
                            </Button>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-3">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => scrollToSection(link.id)}
                                className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            >
                                {link.label}
                            </button>
                        ))}
                        <div className="flex flex-col gap-2 px-4 pt-2">
                            <Link to="/login" className="w-full">
                                <Button variant="ghost" className="w-full hover:bg-primary/10">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register" className="w-full">
                                <Button className="w-full bg-primary hover:bg-primary/90">
                                    Register
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
