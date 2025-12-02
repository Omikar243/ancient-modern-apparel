import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Shirt, Eye, Users, Sparkles, ArrowRight, Play } from "lucide-react";
import { Hero3D } from "@/components/home/Hero3D";
import { HeroBackground } from "@/components/home/HeroBackground";
import { FashionFusionBackground } from "@/components/layout/FashionFusionBackground";
import { GlobalBackground } from "@/components/layout/GlobalBackground";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

// Remove old heroImages and featuredProducts definition as we'll redefine them or use dynamic components

const features = [
  {
    icon: Users,
    title: "Personal Avatars",
    description: "Upload photos for precise 3D measurements and interactive customization.",
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    icon: Shirt,
    title: "Garment Fusion",
    description: "Mix ancient templates with modern fits and authentic local materials.",
    color: "bg-amber-500/10 text-amber-500"
  },
  {
    icon: Eye,
    title: "Realistic Previews",
    description: "Visualize designs on your avatar with lifelike rendering and secure exports.",
    color: "bg-emerald-500/10 text-emerald-500"
  },
  {
    icon: Sparkles,
    title: "Heritage Materials",
    description: "Access a vast library of traditional Indian fabrics and patterns.",
    color: "bg-purple-500/10 text-purple-500"
  }
];

const featuredProducts = [
  { id: 1, name: "Saree Modern", price: "$89", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/woman-in-saree-with-modern-twist%2c-fusi-7bb4767e-20250925192050.jpg", category: "Women" },
  { id: 2, name: "Kurta Blend", price: "$65", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/traditional-indian-attire%2c-ancient-clo-b7ef4ecc-20250925192058.jpg", category: "Men" },
  { id: 3, name: "Anarkali Fusion", price: "$120", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/ethnic-wear-fusion%2c-blending-ancient-i-ec0d520f-20250925192112.jpg", category: "Women" },
  { id: 4, name: "Royal Sherwani", price: "$150", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/traditional-indian-attire%2c-ancient-clo-b7ef4ecc-20250925192058.jpg", category: "Men" },
];

export default function Home() {
  return (
    <main className="min-h-screen text-foreground overflow-x-hidden selection:bg-primary/20">
      <GlobalBackground />
      {/* <FashionFusionBackground /> */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen pt-24 pb-40 flex items-center justify-center overflow-hidden">
        {/* Background Decoration - 3D Interactive */}
        {/* <HeroBackground /> */}

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-secondary/50 border border-border px-3 py-1 rounded-full text-xs font-medium text-muted-foreground backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>New Collection: The Royal Heritage</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight leading-[1.1] text-foreground">
                Blend Ancient <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Grace</span> with <br />
                Modern Edge
              </h1>

              <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Experience the future of fashion. Craft your perfect silhouette with our 3D fusion studio, combining timeless Indian textiles with contemporary innovation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/avatar">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                    Start Designing <Sparkles className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur hover:bg-background/80">
                    View Collection <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>10k+ Designers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <span>500+ Fabrics</span>
                </div>
              </div>
            </div>

            {/* 3D Hero Element */}
            <div className="relative h-[500px] lg:h-[700px] w-full bg-gradient-to-b from-transparent via-secondary/20 to-transparent rounded-[2.5rem] border border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50" />
              <Hero3D />

              {/* Floating Elements */}
              <div className="absolute top-8 left-8 bg-background/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-border/50 max-w-[180px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Fabric Match</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Analysis complete. 98% compatibility with Silk Georgette.</p>
              </div>

              <div className="absolute bottom-8 right-8 bg-background/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-border/50 max-w-[180px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent-foreground">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Live Preview</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Real-time physics enabled. Drape simulation active.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee / Brand Strip */}
      <div className="border-y border-border bg-secondary/30 py-8 overflow-hidden backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-muted-foreground tracking-[0.2em] uppercase mb-6">Trusted by heritage artisans across India</p>
          <div className="flex justify-between items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos placeholders - using text for now */}
            <span className="text-2xl font-serif font-bold">VOGUE</span>
            <span className="text-2xl font-serif font-bold">BAZAAR</span>
            <span className="text-2xl font-serif font-bold">ELLE</span>
            <span className="text-2xl font-serif font-bold">GQ</span>
            <span className="text-2xl font-serif font-bold">GRAZIA</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 lg:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6">Designed for the Modern Creator</h2>
            <p className="text-lg text-muted-foreground">
              IndiFusion brings professional fashion design tools to your fingertips, powered by AI and 3D technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative p-8 rounded-3xl bg-card/80 backdrop-blur-md hover:bg-secondary/60 border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 lg:py-32 bg-secondary/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-medium mb-4">Trending Fusions</h2>
              <p className="text-lg text-muted-foreground">Curated pieces blending past and present.</p>
            </div>
            <Link href="/catalog">
              <Button variant="ghost" className="group">
                View Full Catalog <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/catalog/${product.id}`} className="group">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border/50 mb-4 shadow-sm group-hover:shadow-md transition-all">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
                    {product.category}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between text-white">
                    <span className="font-medium">Quick View</span>
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                      <Play className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">Limited Edition</p>
                  </div>
                  <span className="font-semibold text-lg">{product.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="bg-foreground rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] rounded-full bg-primary blur-[100px]" />
            </div>

            <h2 className="text-4xl md:text-6xl font-serif font-bold text-background mb-8 relative z-10">
              Ready to Wear Your Legacy?
            </h2>
            <p className="text-xl text-background/80 max-w-2xl mx-auto mb-12 relative z-10">
              Join thousands of creators redefining Indian fashion. Start designing your custom fusion wear today.
            </p>
            <div className="relative z-10">
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-background text-foreground hover:bg-background/90 shadow-2xl shadow-white/10">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}