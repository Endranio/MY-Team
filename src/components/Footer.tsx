import { Gamepad2, Mail, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    const scrollToSection = (sectionId: string) => {
        if (!isHomePage) {
            window.location.href = `/#${sectionId}`;
            return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <footer className="border-t border-border/40 bg-muted/30 mt-20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <Gamepad2 className="h-8 w-8 text-primary" />
                            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                                MY Team
                            </h3>
                        </Link>
                        <p className="text-muted-foreground">
                            The ultimate gaming community platform where gamers connect, compete, and thrive together.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-muted-foreground hover:text-primary transition-colors">
                                    Register
                                </Link>
                            </li>
                            {isHomePage ? (
                                <>
                                    <li>
                                        <button
                                            onClick={() => scrollToSection("about")}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            About Us
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => scrollToSection("features")}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Features
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <a href="/#about" className="text-muted-foreground hover:text-primary transition-colors">
                                            About Us
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/#features" className="text-muted-foreground hover:text-primary transition-colors">
                                            Features
                                        </a>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Contact Us</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                                <Mail className="h-5 w-5 flex-shrink-0" />
                                <a href="mailto:anjasraharjo12345@gmail.com" className="break-all">
                                    anjasraharjo12345@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-border/40 pt-8 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} MY Team. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
