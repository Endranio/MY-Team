import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Zap, Star, TrendingUp, Shield, Clock, Video, Calendar, ArrowRight, Play, ExternalLink, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

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

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(5);
      if (eventsData) setEvents(eventsData);

      // Fetch active teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*, profiles!captain_id(full_name)')
        .eq('status', 'approved')
        .limit(5);

      if (teamsData) {
        const formattedTeams = teamsData.map((t: any) => ({
          ...t,
          captain: t.profiles ? { full_name: t.profiles.full_name } : null
        }));
        setTeams(formattedTeams as Team[]);
      }

      // Fetch streams
      try {
        const { data: streamsData } = await supabase
          .from('streams')
          .select('*')
          .order('is_live', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5);

        if (streamsData) {
          // Cast to unknown first if there are mismatches, then to Stream[]
          setStreams(streamsData as unknown as Stream[]);
        }
      } catch (e) {
        console.log("Streams table might not exist yet");
      }

      // Fetch testimonials
      try {
        const { data: testimonialsData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (testimonialsData) {
          setTestimonials(testimonialsData as unknown as Testimonial[]);
        }
      } catch (e) {
        console.log("Testimonials table might not exist yet");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Gabung dengan Ultimate
            <span className="block bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
              MY Team
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Terhubung dengan sesama gamer, ikuti acara eksklusif, dan menjadi bagian dari sesuatu yang lebih besar.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 shadow-[var(--glow-primary)]">
                Mulai
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary/50 hover:bg-primary/10">
                Masuk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="w-[50%] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">700+</div>
            <div className="text-muted-foreground">Anggota Aktif</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">50+</div>
            <div className="text-muted-foreground">Acara Diselenggarakan</div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">24/7</div>
            <div className="text-muted-foreground">Dukungan</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Mengapa Memilih MY Team?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rasakan platform komunitas gaming terbaik dengan fitur yang dirancang untuk gamer, oleh gamer
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">



          {/* Card 1: Streams - Dropdown Style */}
          <div className="group relative z-20">
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
          <div className="group relative z-20">
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
              <div className="max-h-0 group-hover:max-h-[400px] transition-all duration-500 ease-in-out overflow-hidden bg-muted/30">
                <div className="">
                  {events.length > 0 ? (
                    events.map((event, index) => (
                      <div
                        key={event.id}
                        className="group/item flex items-center gap-4 p-4 transition-all duration-300 hover:bg-primary/5 border border-transparent hover:border-primary/10 w-full"
                      >
                        <span className="text-lg font-bold text-muted-foreground/30 group-hover/item:text-primary transition-colors font-mono w-6 text-center">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>

                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold flex-shrink-0 group-hover/item:bg-primary/20 transition-all">
                          {new Date(event.event_date).getDate()}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold truncate text-sm text-foreground/80 group-hover/item:text-primary transition-colors">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {new Date(event.event_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 line-clamp-2 leading-tight">
                            {event.description}
                          </p>
                        </div>
                      </div>
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
          <div className="group relative z-20">
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
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Apa Kata Anggota Kami</h2>
          <p className="text-lg text-muted-foreground">
            Pengalaman nyata dari komunitas gaming kami
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.length > 0 ? (
            testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 bg-card border-border">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "{testimonial.content}"
                </p>
                <div className="font-semibold">{testimonial.author_name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.author_role}</div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center text-muted-foreground py-8">
              Belum ada testimoni.
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">Tentang MY Team</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            MY Team lebih dari sekadar komunitas—ini adalah rumah bagi gamer yang bersemangat. Kami menyelenggarakan acara rutin, menyediakan platform untuk kompetisi gaming, dan menciptakan koneksi bermakna antara pemain di seluruh dunia. Bergabunglah hari ini dan tingkatkan pengalaman gaming Anda.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-blue-400/10 border-primary/20 p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Siap Bergabung?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Mulailah perjalanan gaming Anda dengan MY Team hari ini. Terhubung dengan pemain, ikuti turnamen, dan menjadi bagian dari komunitas yang luar biasa.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-4 md:px-12">
              Buat Akun Anda Sekarang
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
