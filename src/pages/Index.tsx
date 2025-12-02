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
        <div className="w-[50%] mx-auto grid grid-cols-2 md:grid-cols-3 gap-8">
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
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Komunitas Aktif</h3>
            <p className="text-muted-foreground">
              Bergabung dengan ribuan gamer yang berbagi pengalaman dan membangun persahabatan.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <Trophy className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Acara Eksklusif</h3>
            <p className="text-muted-foreground">
              Ikuti turnamen, kompetisi, dan acara gaming khusus.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Pembaruan Cepat</h3>
            <p className="text-muted-foreground">
              Dapatkan berita terbaru, patch, dan pengumuman komunitas.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Platform Aman</h3>
            <p className="text-muted-foreground">
              Data Anda dilindungi dengan keamanan tingkat perusahaan.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <Clock className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Dukungan 24/7</h3>
            <p className="text-muted-foreground">
              Tim kami selalu siap membantu Anda dengan pertanyaan atau masalah.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
            <TrendingUp className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Pengembangan Skill</h3>
            <p className="text-muted-foreground">
              Tingkatkan kemampuan gaming Anda dengan mengikuti berbagai acara kami
            </p>
          </Card>
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
          <Card className="p-6 bg-card border-border">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              "Komunitas gaming terbaik yang pernah saya ikuti! Acara-acaranya luar biasa dan saya membuat banyak teman di sini."
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
              "Turnamen-turnamennya terorganisir dengan baik dan hadiah-hadiahnya luar biasa. MY Team membantu saya meningkatkan skill secara signifikan!"
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
              "Platform yang menakjubkan dengan komunitas yang mendukung. Tim dukungan 24/7 selalu membantu dan responsif!"
            </p>
            <div className="font-semibold">David Thompson</div>
            <div className="text-sm text-muted-foreground">Casual Gamer</div>
          </Card>
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
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-blue-400/10 border-primary/20 p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Siap Bergabung?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Mulailah perjalanan gaming Anda dengan MY Team hari ini. Terhubung dengan pemain, ikuti turnamen, dan menjadi bagian dari komunitas yang luar biasa.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-12">
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
