import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/5 py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
              IndiFusion Wear
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Blending ancient Indian textiles with modern silhouettes. Craft your timeless style with heritage craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/avatar">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  Create Avatar
                </Button>
              </Link>
              <Link href="/catalog">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-8">
                  Explore Catalog
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heroImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`IndiFusion fusion ${idx + 1}`}
                  className="w-full h-64 md:h-80 object-cover rounded-xl shadow-2xl border border-primary/20"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground">Our Heritage</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            IndiFusion Wear draws from millennia of Indian textile artistry—sarees woven with Khadi threads from ancient looms, block-printed motifs from Rajasthan, and silk from Bengal's timeless traditions. We fuse these with contemporary cuts for the modern explorer. Each piece tells a story of sustainability, skill, and style.
          </p>
          <Link href="/story" className="inline-block text-primary hover:underline font-semibold">
            Read Our Story
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/50 dark:bg-secondary py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">Why IndiFusion?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Personal Avatars</CardTitle>
                <CardDescription>Upload photos for precise 3D measurements and interactive customization.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Shirt className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>Garment Fusion</CardTitle>
                <CardDescription>Mix ancient templates with modern fits and authentic local materials.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Realistic Previews</CardTitle>
                <CardDescription>Visualize designs on your avatar with lifelike rendering and secure exports.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Stay Inspired</CardTitle>
            <CardDescription>Join our newsletter for exclusive designs and heritage stories.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground">
                Subscribe
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground text-center pt-0">
            No spam, ever. Unsubscribe anytime.
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}