import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

// Hero section images from Unsplash (fusion of ancient Indian and modern)
const heroImages = [
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop", // Woman in saree with modern twist
  "https://images.unsplash.com/photo-1578631619929-30aa475ed3e5?w=800&h=600&fit=crop", // Traditional Indian attire
  "https://images.unsplash.com/photo-1558618047-3c8d3a1b66b9?w=800&h=600&fit=crop", // Ethnic wear fusion
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImages[0]}
            alt="Ancient Indian clothing fusion with modern design"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 opacity-0 animate-[fade-in_1s_ease-out_forwards]">
            IndiFusion Wear
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-0 animate-[fade-in_1s_ease-out_0.2s_forwards]">
            Blending timeless ancient Indian textiles with contemporary silhouettes.
            Craft your unique style from heritage-inspired designs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-[fade-in_1s_ease-out_0.4s_forwards]">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/avatar">Create Your Avatar</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
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
            <Card key={idx} className="overflow-hidden">
              <Image
                src={img}
                alt={`Fusion design ${idx + 1}`}
                width={400}
                height={300}
                className="object-cover"
              />
              <CardContent className="p-6">
                <CardTitle>Heritage Meets Modernity</CardTitle>
                <CardDescription>
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
            <Card>
              <CardHeader>
                <CardTitle>3D Avatar Creation</CardTitle>
                <CardDescription>Upload photos and customize your digital self with precise measurements.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/avatar">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Garment Catalog</CardTitle>
                <CardDescription>Browse traditional templates and select authentic materials with rich histories.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/catalog">Browse Now</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>3D Preview & Export</CardTitle>
                <CardDescription>Visualize designs on your avatar and securely export after purchase.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
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