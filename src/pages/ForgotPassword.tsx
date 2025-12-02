import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
    const { resetPassword } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await resetPassword(email);
        setLoading(false);

        if (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to send reset email. Please try again.",
                variant: "destructive",
            });
        } else {
            setEmailSent(true);
            toast({
                title: "Email Sent!",
                description: "Check your email for password reset instructions.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md p-8 bg-card border-border shadow-2xl">
                    {!emailSent ? (
                        <>
                            <div className="flex flex-col items-center mb-8">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                                    Reset Password
                                </h1>
                                <p className="text-muted-foreground mt-2 text-center">
                                    Enter your email and we'll send you a reset link
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="bg-secondary border-border focus:border-primary"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 shadow-[var(--glow-primary)]"
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    Send Reset Link
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm">
                                <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                                    ← Back to login
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <CheckCircle2 className="h-10 w-10 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
                                <p className="text-muted-foreground">
                                    We've sent password reset instructions to
                                </p>
                                <p className="text-primary font-medium mt-1">{email}</p>
                            </div>
                            <div className="pt-4 space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Didn't receive the email? Check your spam folder or
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setEmailSent(false)}
                                    className="w-full"
                                >
                                    Try another email
                                </Button>
                            </div>
                            <div className="pt-4">
                                <Link to="/login">
                                    <Button variant="ghost" className="w-full">
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
            <Footer />
        </div>
    );
};

export default ForgotPassword;
