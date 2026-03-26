"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowUpRight, Clock, Heart, ShoppingBag, Plus, ShoppingCart } from "lucide-react";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/profile");
    }
  }, [isPending, session?.user, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;

  // Staggered Entrance Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "circOut",
      }
    },
    hover: {
      scale: 1.01,
      borderColor: "#80766B", // Slightly darker taupe
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 lg:px-12 font-sans selection:bg-primary/20">
      <motion.div
        className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[800px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* LEFT SIDEBAR: User Identity (Main Col 1) */}
        <motion.div
          className="lg:col-span-1 lg:row-span-3 relative p-8 border border-primary/40 flex flex-col justify-between h-full bg-card hover:shadow-sm transition-shadow duration-500"
          variants={cardVariants}
        >
          <div className="space-y-6">
            <div className="w-24 h-24 rounded-full bg-muted/50 border border-primary/20 flex items-center justify-center overflow-hidden">
              {/* Placeholder for Avatar if no image */}
              {user.image ? (
                <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-serif text-primary">{user.name?.charAt(0) || "U"}</span>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Creator Profile</p>
              <h1 className="text-5xl md:text-6xl font-serif font-medium leading-tight text-foreground tracking-tight">
                {user.name || "Aim Head"}
              </h1>
            </div>
            <div className="space-y-1 pt-4">
              <p className="text-sm font-medium tracking-wide text-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">Fashion Designer &amp; Curator</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm py-3 border-t border-border">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-mono">2024</span>
            </div>
            <button className="w-full py-4 border border-foreground/10 hover:bg-foreground hover:text-background transition-colors duration-300 uppercase tracking-widest text-xs font-medium">
              Edit Profile
            </button>
          </div>
        </motion.div>

        {/* --- GRID COLUMN 2, 3, 4 --- */}

        {/* ROW 1: Catalog (2) + Cart (1) */}

        {/* Catalog: Wide Card */}
        <motion.div
          className="lg:col-span-2 relative p-8 border border-primary/40 flex flex-col justify-between min-h-[280px] group cursor-pointer bg-card"
          variants={cardVariants}
          whileHover="hover"
        >
          <Link href="/catalog" className="absolute inset-0" />
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Collection</span>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          </div>

          <div className="flex flex-col gap-2 relative z-10">
            <h2 className="text-4xl font-serif">Catalog</h2>
            <p className="text-muted-foreground max-w-md font-light">
              Explore the archive of ancient-modern fusion pieces. Curated for the avant-garde.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 w-32 h-32 opacity-5 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-foreground">
              <circle cx="50" cy="50" r="40" />
            </svg>
          </div>
        </motion.div>

        {/* Your Cart (New) */}
        <motion.div
          className="lg:col-span-1 relative p-6 border border-primary/40 flex flex-col justify-between bg-card group cursor-pointer"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your Cart</span>
            <ShoppingCart className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          <div className="flex-grow flex flex-col items-center justify-center py-4 space-y-2">
            <span className="text-5xl font-serif font-light">0</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Items Selected</span>
          </div>

          <button className="w-full py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors uppercase tracking-widest text-[10px] font-medium">
            Checkout
          </button>
        </motion.div>


        {/* ROW 2: Orders (1) + Wallet (1) + Wishlist (1) */}

        {/* Recent Orders */}
        <motion.div
          className="lg:col-span-1 relative p-6 border border-primary/40 flex flex-col justify-between bg-card group cursor-pointer"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Orders</span>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex-grow flex items-center justify-center py-4">
            <div className="w-20 h-28 bg-muted relative overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary/40">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="font-serif text-lg">Last Order</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">#ORD-2938-X</p>
          </div>
        </motion.div>

        {/* Wallet */}
        <motion.div
          className="lg:col-span-1 relative p-8 flex flex-col justify-between min-h-[250px] bg-primary text-primary-foreground select-none"
          variants={cardVariants}
          whileHover={{ scale: 1.01, transition: { duration: 0.4 } }}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-[0.2em] opacity-80">Wallet</span>
            <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-4xl font-serif font-light">$0.00</h3>
            <p className="text-sm opacity-80 tracking-wide font-light">Available Balance</p>
          </div>

          <button className="w-full py-2 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10 text-[10px] uppercase tracking-widest mt-auto">
            Top Up
          </button>
        </motion.div>

        {/* Wishlist */}
        <motion.div
          className="lg:col-span-1 relative p-6 border border-primary/40 flex flex-col bg-card group cursor-pointer"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wishlist</span>
            <Heart className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-2 flex-grow h-full content-center opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <div className="aspect-square bg-muted/50 border border-primary/10"></div>
            <div className="aspect-square bg-muted/50 border border-primary/10"></div>
            <div className="aspect-square bg-muted/50 border border-primary/10"></div>
            <div className="aspect-square bg-muted/30 border border-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary/40" />
            </div>
          </div>

          <p className="text-center text-xs mt-4 text-muted-foreground font-serif italic">3 items saved</p>
        </motion.div>


        {/* ROW 3: Preview (3) */}

        {/* Preview: Wide Bottom */}
        <motion.div
          className="lg:col-span-3 relative p-8 border border-primary/40 flex flex-col justify-between bg-card group cursor-pointer overflow-hidden min-h-[250px]"
          variants={cardVariants}
          whileHover="hover"
        >
          <Link href="/preview" className="absolute inset-0 z-20" />
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preview</span>
            <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
            <h1 className="text-[10rem] font-serif">Ai</h1>
          </div>

          <div className="mt-auto relative z-10 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-serif mb-2">Live Preview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                Visualize your creations in real-time environments. Launch the interactive studio.
              </p>
            </div>
            <div className="w-1/3 h-1 bg-muted overflow-hidden">
              <div className="h-full bg-primary/50 w-2/3 group-hover:w-full transition-all duration-700 ease-in-out"></div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
