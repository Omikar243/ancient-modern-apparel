import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { User, Shirt, Eye, Search, ShoppingCart, User as UserIcon } from "lucide-react";
import NextImage from "next/image";

// Hero section images from Unsplash (fusion of ancient Indian and modern)
const heroImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/woman-in-saree-with-modern-twist%2c-fusi-7bb4767e-20250925192050.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/traditional-indian-attire%2c-ancient-clo-b7ef4ecc-20250925192058.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/ethnic-wear-fusion%2c-blending-ancient-i-ec0d520f-20250925192112.jpg",
];

// Featured products mock (adapt from catalog later)
const featuredProducts = [
  { id: 1, name: "Saree Modern", price: "$89", image: heroImages[0], category: "Women" },
  { id: 2, name: "Kurta Blend", price: "$65", image: heroImages[1], category: "Men" },
  { id: 3, name: "Anarkali Fusion", price: "$120", image: heroImages[2], category: "Women" },
  // Add more as needed
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Promo Banner - SHEIN-style top alert */}
      <div className="bg-accent/20 border-b border-border text-center py-3">
        <p className="text-sm text-accent-foreground font-medium">
          Hey there, newbie! Get free shipping on your first fusion order ✨
        </p>
      </div>

      {/* Header Nav - Logo, Search, Categories like SHEIN */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-primary">
            IndiFusion
          </Link>
          <div className="hidden md:flex items-center space-x-1 text-sm font-medium text-muted-foreground">
            {["Women Fusion", "Men Heritage", "Kids Ethnic", "Tops", "Dresses", "Bottoms", "Materials"].map((cat) => (
              <Link key={cat} href={`/catalog?cat=${cat.toLowerCase().replace(' ', '-')}`} className="hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-accent/20">
                {cat}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search fusion styles..."
                className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background w-64 focus:ring-primary focus:border-primary"
              />
            </div>
            <Link href="/cart" className="p-2 hover:bg-accent/20 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <Link href="/profile" className="p-2 hover:bg-accent/20 rounded-lg flex items-center space-x-1">
              <UserIcon className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner - Large model showcase like SHEIN autumn banner */}
      <section className="relative bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-serif font-light text-foreground leading-tight">
                Blend Ancient Grace<br />with Modern Edge
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-lg">
                Discover timeless Indian textiles reimagined. Craft your silhouette with heritage and innovation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/avatar">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg">
                    Create Your Avatar
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-8 py-3 text-lg">
                    Shop Fusion
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <NextImage
                src={heroImages[0]}
                alt="IndiFusion model in saree-modern fusion"
                width={600}
                height={600}
                className="w-full h-96 md:h-[500px] object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute top-4 left-4 bg-accent/90 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                New: Heritage Drop
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Styles Section - Like SHEIN's autumn style grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
            Fresh Fusion Styles
          </h2>
          <p className="text-lg text-muted-foreground">Explore our latest ancient-modern blends</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.slice(0, 4).map((product) => (
            <Link key={product.id} href={`/catalog/${product.id}`} className="group block">
              <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group-hover:scale-105">
                <NextImage
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={250}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-medium text-foreground text-sm mb-1">{product.name}</h3>
                  <p className="text-primary font-semibold">{product.price}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Banner - SHEIN free shipping style */}
      <section className="bg-primary/10 py-8 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-serif font-medium text-foreground mb-2">Get Free Shipping</h3>
          <p className="text-muted-foreground mb-4">On orders over $50 – Your first fusion awaits!</p>
          <Link href="/catalog">
            <Button className="bg-primary text-primary-foreground px-8 py-3">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Side Categories - Vertical nav like SHEIN sidebar */}
      <section className="container mx-auto px-4 py-16 hidden lg:block">
        <div className="flex gap-8">
          <div className="w-1/4 space-y-2">
            <h3 className="text-lg font-medium text-foreground mb-4">Categories</h3>
            {["Women Fusion", "Men Heritage", "Kids Ethnic", "Fabrics", "Accessories"].map((cat) => (
              <Link key={cat} href={`/catalog?cat=${cat.toLowerCase().replace(' ', '-')}`} className="block py-2 text-muted-foreground hover:text-primary transition-colors">
                {cat}
              </Link>
            ))}
          </div>
          <div className="w-3/4">
            {/* Reuse featured grid or add more content */}
            <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="border-primary/10 hover:border-primary/20 transition-colors">
                  <CardHeader className="p-4">
                    <NextImage
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-sm font-medium">{product.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mb-2">{product.category}</CardDescription>
                    <p className="text-primary font-semibold">{product.price}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full">Add to Cart</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features - Simplified from original, integrated as cards */}
      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Discover IndiFusion</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20">
              <CardHeader className="pb-4 text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Personal Avatars</CardTitle>
                <CardDescription>Upload photos for precise 3D measurements and interactive customization.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20">
              <CardHeader className="pb-4 text-center">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shirt className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>Garment Fusion</CardTitle>
                <CardDescription>Mix ancient templates with modern fits and authentic local materials.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20">
              <CardHeader className="pb-4 text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Realistic Previews</CardTitle>
                <CardDescription>Visualize designs on your avatar with lifelike rendering and secure exports.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter - Bottom CTA like SHEIN footer */}
      <section className="bg-card py-16 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-medium text-foreground mb-4">Join the Fusion</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Get exclusive drops, heritage stories, and 10% off your first order.</p>
          <div className="max-w-md mx-auto space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary"
            />
            <Button className="w-full bg-primary text-primary-foreground py-3">Subscribe Now</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </section>
    </main>
  );
}