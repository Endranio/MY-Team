import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Zap, Star, TrendingUp, Shield, Clock, Video, Calendar, ArrowRight, Play, ExternalLink, Crown, Info, Gift, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import AnimatedSection from "@/components/AnimatedSection";
import CounterStat from "@/components/CounterStat";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

type Event = Tables<"events">;
type Team = Tables<"teams"> & { captain?: { full_name: string } | null };
type Stream = {
  id: string;
  title: string;
  stream_url: string;
  platform: string;
  thumbnail_url: string | null;
  is_live: boolean;
};
type Testimonial = {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  rating: number;
  is_active: boolean;
};
type InfoCard = {
  id: string;
  title: string;
  description: string | null;
  prize_image_url: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  is_active: boolean;
  display_order: number;
};

// EventCard Component - List style to match other dropdowns
const EventCard = ({ event, index }: { event: Event; index?: number }) => {
  // Get first available image for thumbnail
  const thumbnail = event.image_url || event.image_url_2 || event.image_url_3;

  return (
    <div className="group/item flex items-center gap-4 p-4 transition-all duration-300 hover:bg-primary/5 border border-transparent hover:border-primary/10 w-full">
      {index !== undefined && (
        <span className="text-lg font-bold text-muted-foreground/30 group-hover/item:text-primary transition-colors font-mono w-6 text-center">
          {(index + 1).toString().padStart(2, '0')}
        </span>
      )}

      <div className="relative h-12 w-12 rounded-xl bg-muted overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover/item:ring-primary/20 transition-all">
        {thumbnail ? (
          <img src={thumbnail} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="h-5 w-5" />
          </div>
        )}
        {/* Date Badge */}
        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-[10px] font-bold">
          {new Date(event.event_date).getDate()}
        </div>
      </div>

      <div className="flex-1 text-left min-w-0">
        <p className="font-semibold truncate text-sm text-foreground/80 group-hover/item:text-primary transition-colors">
          {event.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover/item:text-primary transition-colors flex-shrink-0" />
    </div>
  );
};

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [infoCards, setInfoCards] = useState<InfoCard[]>([]);

  // Scroll animation refs
  const featuresRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const testimonialsRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const aboutRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const ctaRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  useEffect(() => {
    const fetchData = async () => {
      // Get today's date in YYYY-MM-DD format for proper comparison
      const today = new Date().toISOString().split('T')[0];

      // Fetch all data in parallel for faster loading
      const [eventsResult, teamsResult, streamsResult, testimonialsResult, infoCardsResult] = await Promise.all([
        // Fetch all events (no date filter)
        supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: false })
          .limit(10),

        // Fetch active teams
        supabase
          .from('teams')
          .select('*, profiles!captain_id(full_name)')
          .eq('status', 'approved')
          .limit(5),

        // Fetch streams
        supabase
          .from('streams')
          .select('*')
          .order('is_live', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5),

        // Fetch testimonials
        supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6),

        // Fetch info cards
        supabase
          .from('info_cards')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(10)
      ]);

      // Set events
      if (eventsResult.data) setEvents(eventsResult.data);

      // Set teams
      if (teamsResult.data) {
        const formattedTeams = teamsResult.data.map((t: any) => ({
          ...t,
          captain: t.profiles ? { full_name: t.profiles.full_name } : null
        }));
        setTeams(formattedTeams as Team[]);
      }

      // Set streams
      if (streamsResult.data) {
        setStreams(streamsResult.data as unknown as Stream[]);
      }

      // Set testimonials
      if (testimonialsResult.data) {
        setTestimonials(testimonialsResult.data as unknown as Testimonial[]);
      }

      // Set info cards
      if (infoCardsResult.data) {
        setInfoCards(infoCardsResult.data as unknown as InfoCard[]);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/232036.jpg')" }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />

        {/* Radial Glow Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60" />

        {/* Content with animation */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 py-12 sm:py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <AnimatedSection animation="blur-in" delay={0}>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight drop-shadow-2xl">
                Gabung dengan Ultimate
                <span className="block bg-gradient-to-r from-primary via-green-400 to-primary bg-clip-text text-transparent drop-shadow-lg">
                  MY Team
                </span>
              </h2>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <p className="text-base sm:text-xl text-muted-foreground/90 max-w-2xl mx-auto px-2 backdrop-blur-sm">
                Terhubung dengan sesama gamer, ikuti acara eksklusif, dan menjadi bagian dari sesuatu yang lebih besar.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 px-4 sm:px-0">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-base sm:text-lg px-8 sm:px-10 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
                    Mulai Sekarang
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 border-primary/50 hover:bg-primary/10 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                    Masuk
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section with counter animation */}
      <section className="container mx-auto px-3 sm:px-4 py-10 sm:py-16">
        <div className="w-full sm:w-[80%] md:w-[50%] mx-auto grid grid-cols-3 gap-4 sm:gap-8">
          <CounterStat
            value={700}
            suffix="+"
            label="Anggota Aktif"
            delay={0}
            duration={2500}
          />
          <CounterStat
            value={50}
            suffix="+"
            label="Acara"
            delay={200}
            duration={2000}
          />
          {/* 24/7 tidak menggunakan counter karena format khusus */}
          <AnimatedSection animation="fade-up" delay={400} className="text-center space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-4xl font-bold text-primary">24/7</div>
            <div className="text-xs sm:text-base text-muted-foreground">Dukungan</div>
          </AnimatedSection>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <AnimatedSection animation="fade-up" className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Mengapa Memilih MY Team?</h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Rasakan platform komunitas gaming terbaik dengan fitur yang dirancang untuk gamer, oleh gamer
          </p>
        </AnimatedSection>

        <div
          ref={featuresRef.ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8"
        >
          {/* Card 1: Streams - Dropdown Style */}
          <div
            className={cn(
              "group relative z-20 scroll-animate animate-fade-up",
              featuresRef.isVisible && "is-visible"
            )}
            style={{ transitionDelay: '0ms' }}
          >
            <Card className="bg-card border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50">
              <div className="p-6 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Video className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Live Streams</h3>
                    <p className="text-sm text-muted-foreground">Tonton turnamen live</p>
                  </div>
                </div>
                <div className="text-primary transition-transform duration-300 group-hover:rotate-180">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>

              {/* Dropdown Content */}
              <div className="max-h-0 group-hover:max-h-[400px] transition-all duration-500 ease-in-out overflow-hidden bg-muted/30">
                <div className="">
                  {streams.length > 0 ? (
                    streams.map((stream, index) => (
                      <a
                        key={stream.id}
                        href={stream.stream_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item flex items-center gap-4 p-4 transition-all duration-300 hover:bg-primary/5 border border-transparent hover:border-primary/10 w-full"
                      >
                        <span className="text-lg font-bold text-muted-foreground/30 group-hover/item:text-primary transition-colors font-mono w-6 text-center">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>

                        <div className="relative h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover/item:ring-primary/20 transition-all">
                          {stream.thumbnail_url ? (
                            <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                              <Play className="h-4 w-4" />
                            </div>
                          )}
                          {stream.is_live && (
                            <div className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                          )}
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold truncate text-sm text-foreground/80 group-hover/item:text-primary transition-colors">
                            {stream.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            {stream.is_live ? (
                              <span className="text-red-500 font-bold">● LIVE</span>
                            ) : (
                              <span className="capitalize">{stream.platform}</span>
                            )}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground/50 group-hover/item:text-primary transition-colors" />
                      </a>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4 text-sm">
                      Belum ada stream aktif.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Card 2: Events - Dropdown Style */}
          <div
            className={cn(
              "group relative z-20 scroll-animate animate-fade-up",
              featuresRef.isVisible && "is-visible"
            )}
            style={{ transitionDelay: '150ms' }}
          >
            <Card className="bg-card border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50">
              <div className="p-6 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Events</h3>
                    <p className="text-sm text-muted-foreground">Turnamen mendatang</p>
                  </div>
                </div>
                <div className="text-primary transition-transform duration-300 group-hover:rotate-180">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>

              {/* Dropdown Content */}
              <div className="max-h-0 group-hover:max-h-[500px] transition-all duration-500 ease-in-out overflow-hidden bg-muted/30">
                <div className="">
                  {events.length > 0 ? (
                    events.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} />
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4 text-sm">
                      Belum ada event mendatang.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Card 3: Teams - Dropdown Style */}
          <div
            className={cn(
              "group relative z-20 scroll-animate animate-fade-up",
              featuresRef.isVisible && "is-visible"
            )}
            style={{ transitionDelay: '300ms' }}
          >
            <Card className="bg-card border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50">
              <div className="p-6 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Teams</h3>
                    <p className="text-sm text-muted-foreground">Komunitas aktif</p>
                  </div>
                </div>
                <div className="text-primary transition-transform duration-300 group-hover:rotate-180">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>

              {/* Dropdown Content */}
              <div className="max-h-0 group-hover:max-h-[400px] transition-all duration-500 ease-in-out overflow-hidden bg-muted/30">
                <div className="">
                  {teams.length > 0 ? (
                    teams.map((team, index) => (
                      <div
                        key={team.id}
                        className="group/item flex items-center gap-4 p-4 transition-all duration-300 hover:bg-primary/5 border border-transparent hover:border-primary/10 w-full"
                      >
                        <span className="text-lg font-bold text-muted-foreground/30 group-hover/item:text-primary transition-colors font-mono w-6 text-center">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>

                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover/item:ring-primary/20 transition-all">
                          {team.team_logo ? (
                            <img src={team.team_logo} alt={team.team_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                              {team.team_name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold truncate text-sm text-foreground/80 group-hover/item:text-primary transition-colors">
                            {team.team_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <Crown className="h-3 w-3 text-yellow-500/50 group-hover/item:text-yellow-500 transition-colors" />
                            {team.captain?.full_name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4 text-sm">
                      Belum ada tim aktif.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Card 4: Info Cards - Dropdown Style */}
          {infoCards.length > 0 && (
            <div
              className={cn(
                "group relative z-20 scroll-animate animate-fade-up",
                featuresRef.isVisible && "is-visible"
              )}
              style={{ transitionDelay: '450ms' }}
            >
              <Card className="bg-card border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50">
                <div className="p-6 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Info className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold">Info & Hadiah</h3>
                      <p className="text-sm text-muted-foreground">Informasi turnamen & kontak</p>
                    </div>
                  </div>
                  <div className="text-primary transition-transform duration-300 group-hover:rotate-180">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>

                {/* Dropdown Content */}
                <div className="max-h-0 group-hover:max-h-[800px] transition-all duration-500 ease-in-out overflow-hidden bg-muted/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    {infoCards.map((infoCard) => (
                      <div
                        key={infoCard.id}
                        className="bg-card/80 rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300"
                      >
                        {/* Prize Image */}
                        {infoCard.prize_image_url && (
                          <div className="w-full h-40 sm:h-48 overflow-hidden">
                            <img
                              src={infoCard.prize_image_url}
                              alt={infoCard.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}

                        <div className="p-4">
                          <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            {infoCard.title}
                          </h4>

                          {infoCard.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {infoCard.description}
                            </p>
                          )}

                          {(infoCard.contact_email || infoCard.contact_whatsapp) && (
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/30">
                              {infoCard.contact_email && (
                                <a
                                  href={`mailto:${infoCard.contact_email}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-xs text-primary transition-colors"
                                >
                                  <Mail className="h-3 w-3" />
                                  Email
                                </a>
                              )}
                              {infoCard.contact_whatsapp && (
                                <a
                                  href={`https://wa.me/${infoCard.contact_whatsapp}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 hover:bg-green-500/20 text-xs text-green-500 transition-colors"
                                >
                                  <Phone className="h-3 w-3" />
                                  WhatsApp
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container mx-auto px-3 sm:px-4 py-12 sm:py-20 bg-muted/30">
        <AnimatedSection animation="fade-up" className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Apa Kata Anggota Kami</h2>
          <p className="text-sm sm:text-lg text-muted-foreground px-2">
            Pengalaman nyata dari komunitas gaming kami
          </p>
        </AnimatedSection>

        <div
          ref={testimonialsRef.ref}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto"
        >
          {testimonials.length > 0 ? (
            testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.id}
                className={cn(
                  "p-4 sm:p-6 bg-card border-border scroll-animate animate-scale-in",
                  testimonialsRef.isVisible && "is-visible"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  "{testimonial.content}"
                </p>
                <div className="font-semibold text-sm sm:text-base">{testimonial.author_name}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.author_role}</div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Belum ada testimoni.
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <div
          ref={aboutRef.ref}
          className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6"
        >
          <h2
            className={cn(
              "text-2xl sm:text-4xl font-bold scroll-animate animate-blur-in",
              aboutRef.isVisible && "is-visible"
            )}
          >
            Tentang MY Team
          </h2>
          <p
            className={cn(
              "text-sm sm:text-lg text-muted-foreground leading-relaxed px-2 scroll-animate animate-fade-up",
              aboutRef.isVisible && "is-visible"
            )}
            style={{ transitionDelay: '150ms' }}
          >
            MY Team lebih dari sekadar komunitas—ini adalah rumah bagi gamer yang bersemangat. Kami menyelenggarakan acara rutin, menyediakan platform untuk kompetisi gaming, dan menciptakan koneksi bermakna antara pemain di seluruh dunia. Bergabunglah hari ini dan tingkatkan pengalaman gaming Anda.
          </p>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-12 sm:py-20 overflow-hidden bg-muted/20">
        <div ref={ctaRef.ref} className="container mx-auto px-3 sm:px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Didukung Oleh</h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Partner dan sponsor yang mendukung komunitas gaming kami
            </p>
          </AnimatedSection>
        </div>

        {/* Infinite Scroll Marquee - Row 1 (Left to Right) */}
        <div
          className={cn(
            "relative w-full scroll-animate animate-fade-up",
            ctaRef.isVisible && "is-visible"
          )}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="flex animate-marquee-left hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex shrink-0">
                {/* Sponsor Items */}
                <div className="flex items-center justify-center mx-6 sm:mx-10 w-32 sm:w-44 h-20 sm:h-28 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">SPONSOR 1</div>
                </div>
                <div className="flex items-center justify-center mx-6 sm:mx-10 w-32 sm:w-44 h-20 sm:h-28 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">SPONSOR 2</div>
                </div>
                <div className="flex items-center justify-center mx-6 sm:mx-10 w-32 sm:w-44 h-20 sm:h-28 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">SPONSOR 3</div>
                </div>
                <div className="flex items-center justify-center mx-6 sm:mx-10 w-32 sm:w-44 h-20 sm:h-28 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">SPONSOR 4</div>
                </div>
                <div className="flex items-center justify-center mx-6 sm:mx-10 w-32 sm:w-44 h-20 sm:h-28 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">SPONSOR 5</div>
                </div>
              </div>
            ))}
          </div>
          {/* Gradient Overlays for smooth fade effect */}
          <div className="absolute inset-y-0 left-0 w-20 sm:w-40 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-20 sm:w-40 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </div>

        {/* Infinite Scroll Marquee - Row 2 (Right to Left) */}
        <div
          className={cn(
            "relative w-full mt-4 sm:mt-6 scroll-animate animate-fade-up",
            ctaRef.isVisible && "is-visible"
          )}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="flex animate-marquee-right hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex shrink-0">
                {/* Sponsor Items */}
                <div className="flex items-center justify-center mx-6 sm:mx-10 w-32 sm:w-44 h-20 sm:h-28 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">SPONSOR 6</div>
                </div>
                <div className="flex items-center justify-center mx-6 sm:mx-10 w-32 sm:w-44 h-20 sm:h-28 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">SPONSOR 7</div>
                </div>
                <div className="flex items-center justify-center mx-6 sm:mx-10 w-32 sm:w-44 h-20 sm:h-28 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">SPONSOR 8</div>
                </div>
                <div className="flex items-center justify-center mx-6 sm:mx-10 w-32 sm:w-44 h-20 sm:h-28 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">SPONSOR 9</div>
                </div>
                <div className="flex items-center justify-center mx-6 sm:mx-10 w-32 sm:w-44 h-20 sm:h-28 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">SPONSOR 10</div>
                </div>
              </div>
            ))}
          </div>
          {/* Gradient Overlays for smooth fade effect */}
          <div className="absolute inset-y-0 left-0 w-20 sm:w-40 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-20 sm:w-40 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
