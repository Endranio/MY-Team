import { Gamepad2, Phone, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Contact = Tables<"contacts">;

const Footer = () => {
    const location = useLocation();
    const isHomePage = location.pathname === "/";
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const { data, error } = await supabase
                    .from("contacts")
                    .select("*")
                    .order("created_at", { ascending: true });
                
                if (!error && data) {
                    setContacts(data);
                }
            } catch (error) {
                console.error("Error fetching contacts:", error);
            } finally {
                setLoadingContacts(false);
            }
        };

        fetchContacts();
    }, []);

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
                            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
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
                            {loadingContacts ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Memuat kontak...</span>
                                </div>
                            ) : contacts.length > 0 ? (
                                contacts.map((contact) => (
                                    <div key={contact.id} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                                        <Phone className="h-5 w-5 flex-shrink-0" />
                                        <a href={`https://wa.me/${contact.phone}`} target="_blank" rel="noopener noreferrer" className="break-all flex flex-col">
                                            <span className="font-medium text-foreground">{contact.name}</span>
                                            <span className="text-sm">{contact.phone}</span>
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground text-sm">
                                    Belum ada informasi kontak.
                                </div>
                            )}
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
