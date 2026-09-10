import Link from "next/link";
import { ArrowRight, Eye, Instagram, Play, Shirt, Sparkles, Users } from "lucide-react";
import { Hero3D } from "@/components/home/Hero3D";
import { GlobalBackground } from "@/components/layout/GlobalBackground";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSupabasePublicUrl } from "@/lib/supabase-assets";

const features = [
  { number: "01", icon: Users, title: "Your digital form", description: "Create a considered 3D avatar from your own measurements and see every silhouette in context." },
  { number: "02", icon: Shirt, title: "Heritage, re-cut", description: "Pair age-old Indian textile knowledge with contemporary proportions, color and movement." },
  { number: "03", icon: Eye, title: "See before you make", description: "Move through a live preview that makes the relationship between fabric, fit and form tangible." },
];

const featuredProducts = [
  { id: 1, name: "Saree Modern", price: "$89", image: getSupabasePublicUrl("project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/woman-in-saree-with-modern-twist%2c-fusi-7bb4767e-20250925192050.jpg"), category: "Women" },
  { id: 2, name: "Kurta Blend", price: "$65", image: getSupabasePublicUrl("project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/traditional-indian-attire%2c-ancient-clo-b7ef4ecc-20250925192058.jpg"), category: "Men" },
  { id: 3, name: "Anarkali Fusion", price: "$120", image: getSupabasePublicUrl("project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/ethnic-wear-fusion%2c-blending-ancient-i-ec0d520f-20250925192112.jpg"), category: "Women" },
  { id: 4, name: "Royal Sherwani", price: "$150", image: getSupabasePublicUrl("project-uploads/f519de12-627b-4639-a618-2eb11a7b20bc/generated_images/traditional-indian-attire%2c-ancient-clo-b7ef4ecc-20250925192058.jpg"), category: "Men" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <GlobalBackground />
      <div className="relative z-10">
        <Navbar />

        <section className="hero-shell mx-auto flex min-h-[760px] max-w-[1440px] items-center px-6 pb-20 pt-32 sm:px-10 lg:px-16 lg:pb-28 lg:pt-36">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
            <div className="max-w-xl animate-[fade-up_.7s_cubic-bezier(.23,1,.32,1)_both]">
              <div className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                <span className="h-px w-8 bg-primary" /> The Royal Heritage · New collection
              </div>
              <h1 className="max-w-[640px] font-serif text-[clamp(3.7rem,7vw,6.8rem)] font-medium leading-[0.94] tracking-[-0.055em] text-foreground">
                Ancient grace.<br /><em className="font-normal text-primary">Modern form.</em>
              </h1>
              <p className="mt-8 max-w-[470px] text-base leading-7 text-muted-foreground sm:text-lg">
                Discover Indian craftsmanship through a digital atelier—authentic materials, considered silhouettes and a preview made for your own form.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/avatar" className="button-primary inline-flex h-12 items-center justify-center gap-3 px-6 text-sm font-semibold uppercase tracking-[0.14em]">Start designing <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/catalog" className="button-secondary inline-flex h-12 items-center justify-center gap-3 px-6 text-sm font-semibold uppercase tracking-[0.14em]">Explore collection</Link>
              </div>
              <div className="mt-14 flex gap-10 border-t border-border pt-5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <div><strong className="block font-serif text-2xl font-normal tracking-normal text-foreground">10k+</strong> designers</div>
                <div><strong className="block font-serif text-2xl font-normal tracking-normal text-foreground">500+</strong> fabrics</div>
                <div><strong className="block font-serif text-2xl font-normal tracking-normal text-foreground">1:1</strong> your form</div>
              </div>
            </div>

            <div className="relative min-h-[580px] animate-[fade-in_1s_ease-out_.15s_both] lg:min-h-[680px]">
              <div className="preview-frame absolute inset-0 overflow-hidden">
                <div className="preview-grid" />
                <div className="absolute left-6 top-6 z-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/70"><span className="status-dot" /> Live avatar preview</div>
                <div className="absolute right-6 top-6 z-10 text-right text-[9px] uppercase tracking-[0.18em] text-muted-foreground">3D fit ready<br /><span className="text-primary">● calibrated</span></div>
                <Hero3D />
                <div className="absolute bottom-6 left-6 z-10 border-l border-primary/70 pl-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Rotate to explore<br /><span className="text-foreground">silhouette / drape / line</span></div>
                <div className="fabric-card absolute bottom-6 right-6 z-10 w-44 p-4"><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">Fabric match</p><p className="mt-2 font-serif text-3xl">98%</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Silk Georgette compatibility</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-background/80 px-6 py-5 sm:px-10 lg:px-16">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground"><span>Crafted in India</span><span>Digital atelier</span><span>Material intelligence</span><span>Made for movement</span><span>Est. 2025</span></div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div><p className="eyebrow">01 / The atelier</p><h2 className="mt-5 max-w-md font-serif text-5xl font-normal leading-[1.02] tracking-[-0.04em] sm:text-6xl">Tradition,<br /><em className="text-primary">reimagined.</em></h2></div>
            <div className="grid gap-0 border-t border-border sm:grid-cols-3">{features.map((feature) => <div key={feature.number} className="feature-item border-b border-border py-7 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0"><div className="mb-8 flex items-center justify-between"><span className="text-xs text-primary">{feature.number}</span><feature.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /></div><h3 className="font-serif text-2xl font-normal">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p></div>)}</div>
          </div>
        </section>

        <section className="border-y border-border bg-card/60 px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
          <div className="mx-auto max-w-[1440px]"><div className="mb-12 flex items-end justify-between gap-6"><div><p className="eyebrow">02 / The collection</p><h2 className="mt-4 font-serif text-5xl font-normal tracking-[-0.04em] sm:text-6xl">Current studies</h2></div><Link href="/catalog" className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:flex">View catalog <ArrowRight className="h-4 w-4" /></Link></div><div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-7">{featuredProducts.map((product, index) => <Link key={product.id} href={`/catalog/${product.id}`} className="product-card group"><div className={`relative aspect-[0.78] overflow-hidden bg-muted ${index % 2 === 1 ? "lg:mt-12" : ""}`}><img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /><span className="absolute left-3 top-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/80">{product.category}</span><span className="product-action absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground opacity-0 transition group-hover:opacity-100"><Play className="h-3 w-3 fill-current" /></span></div><div className="mt-4 flex items-start justify-between gap-2"><div><h3 className="font-serif text-xl font-normal">{product.name}</h3><p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Limited edition</p></div><span className="text-sm text-primary">{product.price}</span></div></Link>)}</div><Link href="/catalog" className="mt-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:hidden">View full catalog <ArrowRight className="h-4 w-4" /></Link></div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-28 sm:px-10 lg:px-16 lg:py-36"><div className="cta-panel relative overflow-hidden px-6 py-20 text-center sm:px-12"><div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" /><p className="eyebrow relative">03 / Your form, next</p><h2 className="relative mx-auto mt-5 max-w-2xl font-serif text-5xl font-normal leading-[1] tracking-[-0.04em] sm:text-7xl">Wear your <em className="text-primary">legacy.</em></h2><p className="relative mx-auto mt-6 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">Start with a digital form. Finish with a point of view.</p><Link href="/register" className="button-primary relative mt-9 inline-flex h-12 items-center gap-3 px-7 text-xs font-semibold uppercase tracking-[0.16em]">Enter the atelier <Sparkles className="h-4 w-4" /></Link></div></section>
        <Footer />
      </div>
    </main>
  );
}
