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
        <header
            className={`border-b border-border/40 sticky top-0 z-50 transition-colors duration-300 ${mobileMenuOpen ? 'bg-background' : 'bg-background/80 backdrop-blur-sm'
                }`}
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <Gamepad2 className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
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

                        {/* Mobile Menu Button with Animation */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <div className={`transition-all duration-300 ${mobileMenuOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu - Full Screen Overlay with Solid Background */}
            <div
                className={`md:hidden fixed inset-x-0 top-[73px] bottom-0 z-50 transition-all duration-300 ease-out ${mobileMenuOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-4 pointer-events-none'
                    }`}
                style={{ backgroundColor: '#0d141f' }}
            >
                <nav className="h-full flex flex-col px-6 py-8" >
                    {/* Navigation Links */}
                    <div className="space-y-2 flex-1">
                        {navLinks.map((link, index) => (
                            <button
                                key={link.id}
                                onClick={() => scrollToSection(link.id)}
                                className={`block w-full text-left px-4 py-4 text-lg font-medium text-white/80 hover:text-primary hover:bg-white/5 rounded-xl transition-all duration-300 ${mobileMenuOpen
                                    ? 'translate-x-0 opacity-100'
                                    : '-translate-x-4 opacity-0'
                                    }`}
                                style={{
                                    transitionDelay: mobileMenuOpen ? `${index * 60}ms` : '0ms'
                                }}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div
                        className={`space-y-3 pt-6 border-t border-white/10 transition-all duration-300 ${mobileMenuOpen
                            ? 'translate-x-0 opacity-100'
                            : '-translate-x-4 opacity-0'
                            }`}
                        style={{
                            transitionDelay: mobileMenuOpen ? `${navLinks.length * 60}ms` : '0ms'
                        }}
                    >
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                            <Button
                                variant="outline"
                                className="h-10 px-6 text-sm bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full"
                            >
                                Login
                            </Button>
                        </Link>
                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="h-10 px-6 text-sm bg-primary hover:bg-primary/90 text-white rounded-full">
                                Register
                            </Button>
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
