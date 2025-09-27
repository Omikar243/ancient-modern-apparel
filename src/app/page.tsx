import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { User, Shirt, Eye } from "lucide-react";

// Hero section images from Unsplash (fusion of ancient Indian and modern)
const heroImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/woman-in-saree-with-modern-twist%2c-fusi-7bb4767e-20250925192050.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/traditional-indian-attire%2c-ancient-clo-b7ef4ecc-20250925192058.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/ethnic-wear-fusion%2c-blending-ancient-i-ec0d520f-20250925192112.jpg",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black/20">
        <div className="absolute inset-0">
          <img
            src={heroImages[0]}
            alt="Ancient Indian clothing fusion with modern design"
            className="object-cover w-full h-full opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto py-20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
            IndiFusion Wear
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed opacity-90">
            Ancient textiles meet modern style. Create unique designs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full shadow-2xl min-w-[200px] text-lg font-semibold transition-all duration-300 hover:scale-105">
              <Link href="/avatar">Create Avatar</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/80 text-white hover:bg-white/10 px-8 py-4 rounded-full min-w-[200px] text-lg font-semibold transition-all duration-300 hover:scale-105">
              <Link href="/catalog">Explore Catalog</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-32 px-4 bg-background">
        <div className="max-w-5xl mx-auto text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground leading-tight">
            Our Story
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            IndiFusion Wear was born from a passion to revive the artistry of ancient Indian clothing—sarees, dhoti, lehengas—crafted with materials like Khadi, Banarasi silk, and Chanderi weaves. We fuse these with modern cuts and sustainable practices, empowering you to design personalized garments that honor tradition while embracing the future. Our platform uses cutting-edge 3D technology to bring your visions to life.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {heroImages.slice(1).map((img, idx) => (
            <Card key={idx} className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl bg-transparent backdrop-blur-sm border-border/20">
              <img
                src={img}
                alt={`Fusion design ${idx + 1}`}
                className="object-cover w-full h-64 rounded-t-2xl"
              />
              <CardContent className="p-8">
                <CardTitle className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  Heritage Meets Modernity
                  <div className="w-6 h-6 bg-primary rounded-full" />
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed">
                  Explore how ancient techniques inspire today's fashion.
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Navigation */}
      <section className="py-32 px-4 bg-muted/10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-16 text-foreground leading-tight">
            Discover Our Features
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <Card className="group hover:shadow-2xl transition-all duration-500 rounded-2xl border-0 p-8 shadow-lg hover:border-primary/20 hover:scale-105 bg-card/90">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3 mb-4">
                  <User className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
                  3D Avatar Creation
                </CardTitle>
                <CardDescription className="text-lg leading-relaxed text-muted-foreground">
                  Upload photos and customize your digital self with precise measurements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-full px-8 py-3 font-semibold group-hover:scale-105">
                  <Link href="/avatar">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-2xl transition-all duration-500 rounded-2xl border-0 p-8 shadow-lg hover:border-primary/20 hover:scale-105 bg-card/90">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3 mb-4">
                  <Shirt className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
                  Garment Catalog
                </CardTitle>
                <CardDescription className="text-lg leading-relaxed text-muted-foreground">
                  Browse traditional templates and select authentic materials with rich histories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-full px-8 py-3 font-semibold group-hover:scale-105">
                  <Link href="/catalog">Browse Now</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-2xl transition-all duration-500 rounded-2xl border-0 p-8 shadow-lg hover:border-primary/20 hover:scale-105 bg-card/90">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3 mb-4">
                  <Eye className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
                  3D Preview & Export
                </CardTitle>
                <CardDescription className="text-lg leading-relaxed text-muted-foreground">
                  Visualize designs on your avatar and securely export after purchase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-full px-8 py-3 font-semibold group-hover:scale-105">
                  <Link href="/preview">Preview Designs</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}