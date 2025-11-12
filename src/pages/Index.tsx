import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Users, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              GameHub
            </h1>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-primary/10">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Join The Ultimate
            <span className="block bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
              Gaming Community
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow gamers, join exclusive events, and be part of something bigger.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 shadow-[var(--glow-primary)]">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary/50 hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Active Community</h3>
            <p className="text-muted-foreground">
              Join thousands of gamers sharing experiences and building friendships.
            </p>
          </Card>
          
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <Trophy className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Exclusive Events</h3>
            <p className="text-muted-foreground">
              Participate in tournaments, competitions, and special gaming events.
            </p>
          </Card>
          
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Fast Updates</h3>
            <p className="text-muted-foreground">
              Stay updated with the latest news, patches, and community announcements.
            </p>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">About GameHub</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            GameHub is more than just a community—it's a home for passionate gamers. 
            We organize regular events, provide a platform for competitive gaming, 
            and create meaningful connections between players worldwide. Join us today 
            and level up your gaming experience.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 GameHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
