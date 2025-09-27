import Link from "next/link";
import { Instagram, Facebook, Pinterest, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-background/95 border-t border-border/20 backdrop-blur-md py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-serif font-bold text-primary mb-4">
              IndiFusion Wear
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Blending ancient Indian heritage with modern elegance. Timeless designs for the discerning.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Connect With Us</h4>
            <div className="flex justify-center md:justify-start space-x-6 mb-4">
              <Link href="https://www.instagram.com/indifusionwear" aria-label="Instagram" className="text-primary hover:text-accent transition-colors p-2 rounded-full border border-primary/20 hover:border-accent/50">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="https://www.facebook.com/indifusionwear" aria-label="Facebook" className="text-primary hover:text-accent transition-colors p-2 rounded-full border border-primary/20 hover:border-accent/50">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="https://www.pinterest.com/indifusionwear" aria-label="Pinterest" className="text-primary hover:text-accent transition-colors p-2 rounded-full border border-primary/20 hover:border-accent/50">
                <Pinterest className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Contact</h4>
            <p className="text-sm text-muted-foreground mb-2">
              inquiries@indifusionwear.com
            </p>
            <p className="text-sm text-muted-foreground">
              +91 123 456 7890
            </p>
          </div>
        </div>
        <div className="border-t border-border/20 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 IndiFusion Wear. All rights reserved. Crafted with heritage and innovation.
          </p>
        </div>
      </div>
    </footer>
  );
};