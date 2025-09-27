import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
export const metadata: Metadata = {
  title: "IndiFusion Wear",
  description: "Blending ancient Indian heritage with modern elegance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
      
        <VisualEditsMessenger />
      </body>
    </html>
  );
}