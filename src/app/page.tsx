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
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-4rem)] sm:min-h-screen flex flex-col items-center justify-start sm:justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-muted/50 pt-4 sm:pt-0 pb-4 sm:pb-4">
        <div className="absolute inset-0">
          <img
            src={heroImages[0]}
            alt="Ancient Indian clothing fusion with modern design"
            className="object-cover w-full h-full opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>
        <div className="relative z-10 text-center text-white px-2 max-w-[95vw] mx-auto w-full mt-16 sm:mt-0">
          <h1 className="text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight sm:leading-tight mb-1 sm:mb-0">
            IndiFusion Wear
          </h1>
          <p className="text-sm sm:text-sm md:text-base lg:text-lg mb-1 sm:mb-1 lg:mb-3 max-w-[90vw] sm:max-w-2xl mx-auto leading-tight sm:leading-relaxed tracking-tight">
            Ancient textiles meet modern style. Create unique designs.
          </p>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 lg:gap-3 justify-center items-center mt-1 w-full">
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-lg shadow-lg min-w-[80px] sm:min-w-[140px] lg:min-w-[180px] text-base sm:text-sm leading-tight">
              <Link href="/avatar">Create Avatar</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-white/80 text-white hover:bg-white/10 px-2 sm:px-3 lg:px-5 py-1 sm:py-2 rounded-lg min-w-[80px] sm:min-w-[140px] lg:min-w-[180px] text-base sm:text-sm leading-tight">
              <Link href="/catalog">Explore Catalog</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Our Story</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            IndiFusion Wear was born from a passion to revive the artistry of ancient Indian clothing—sarees, dhoti, lehengas—crafted with materials like Khadi, Banarasi silk, and Chanderi weaves. We fuse these with modern cuts and sustainable practices, empowering you to design personalized garments that honor tradition while embracing the future. Our platform uses cutting-edge 3D technology to bring your visions to life.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {heroImages.slice(1).map((img, idx) => (
            <Card key={idx} className="overflow-hidden border-border/50 shadow-md hover:shadow-lg transition-shadow rounded-lg">
              <img
                src={img}
                alt={`Fusion design ${idx + 1}`}
                className="object-cover w-full h-48"
              />
              <CardContent className="p-6 bg-card/50">
                <CardTitle className="flex items-center gap-2 mb-2">
                  Heritage Meets Modernity
                  <div className="w-5 h-5 bg-accent rounded-full" /> {/* Simple icon placeholder */}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Explore how ancient techniques inspire today's fashion.
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Navigation */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Discover Our Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all rounded-lg border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  3D Avatar Creation
                </CardTitle>
                <CardDescription>Upload photos and customize your digital self with precise measurements.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                  <Link href="/avatar">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all rounded-lg border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-primary" />
                  Garment Catalog
                </CardTitle>
                <CardDescription>Browse traditional templates and select authentic materials with rich histories.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                  <Link href="/catalog">Browse Now</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all rounded-lg border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  3D Preview & Export
                </CardTitle>
                <CardDescription>Visualize designs on your avatar and securely export after purchase.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
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