import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Trophy, Zap, Star, TrendingUp, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Join The Ultimate
            <span className="block bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
              MY Team
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

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">10K+</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">Events Hosted</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Game Titles</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Why Choose MY Team?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the best gaming community platform with features designed for gamers, by gamers
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Active Community</h3>
            <p className="text-muted-foreground">
              Join thousands of gamers sharing experiences and building friendships.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <Trophy className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Exclusive Events</h3>
            <p className="text-muted-foreground">
              Participate in tournaments, competitions, and special gaming events.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Fast Updates</h3>
            <p className="text-muted-foreground">
              Stay updated with the latest news, patches, and community announcements.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure Platform</h3>
            <p className="text-muted-foreground">
              Your data is protected with enterprise-grade security measures.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <Clock className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
            <p className="text-muted-foreground">
              Our team is always ready to help you with any questions or issues.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <TrendingUp className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Skill Development</h3>
            <p className="text-muted-foreground">
              Improve your gaming skills with coaching and training programs.
            </p>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">What Our Members Say</h2>
          <p className="text-lg text-muted-foreground">
            Real experiences from our gaming community
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-6 bg-card border-border">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              "Best gaming community I've ever been part of! The events are amazing and I've made so many friends here."
            </p>
            <div className="font-semibold">Sarah Martinez</div>
            <div className="text-sm text-muted-foreground">Pro Gamer</div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              "The tournaments are well-organized and the prizes are great. MY Team has helped me improve my skills tremendously!"
            </p>
            <div className="font-semibold">Alex Chen</div>
            <div className="text-sm text-muted-foreground">Esports Player</div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              "Amazing platform with a supportive community. The 24/7 support team is always helpful and responsive!"
            </p>
            <div className="font-semibold">David Thompson</div>
            <div className="text-sm text-muted-foreground">Casual Gamer</div>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">About MY Team</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            MY Team is more than just a community—it's a home for passionate gamers.
            We organize regular events, provide a platform for competitive gaming,
            and create meaningful connections between players worldwide. Join us today
            and level up your gaming experience.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-blue-400/10 border-primary/20 p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your gaming journey with MY Team today. Connect with players, compete in tournaments, and be part of an amazing community.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-12">
              Create Your Account Now
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
