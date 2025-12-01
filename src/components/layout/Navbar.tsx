"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, Search, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Updated links based on user request image: Avatar, Catalog, Preview, Cart, Login
  const navLinks = [
    { name: "Avatar", href: "/avatar" },
    { name: "Catalog", href: "/catalog" },
    { name: "Preview", href: "/preview" }, // Assuming a preview page exists or redirect to avatar
    { name: "Cart", href: "/cart" },
  ];

  // Check if link is active
  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border/40 shadow-sm py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Serif Font as requested */}
          <Link href="/" className="relative z-50 group">
            <h1 className={`text-3xl md:text-4xl font-serif font-bold tracking-tight transition-colors ${isScrolled ? "text-foreground" : "text-foreground"}`}>
              Indi<span className="text-primary group-hover:text-accent transition-colors duration-300">Fusion</span>
            </h1>
          </Link>

          {/* Desktop Nav - Centered/Right aligned */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-base font-medium transition-colors relative group ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </Link>
            ))}
            
            {/* Login Link */}
            <Link 
              href="/login"
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>

            {/* Register Button - Outlined/Ghost as per image */}
            <Link href="/register">
              <Button 
                variant="outline" 
                className="rounded-full px-8 border-primary/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Register
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden z-50 flex items-center gap-4">
             <Link href="/cart">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingCart className="w-5 h-5" />
              </button>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 bg-background pt-24 px-6 z-40 md:hidden overflow-hidden"
          >
            <div className="flex flex-col space-y-6 text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-serif font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif font-medium text-foreground hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                 <Button className="w-full rounded-full mt-4" size="lg">Register</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}