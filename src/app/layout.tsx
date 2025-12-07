import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import dynamic from "next/dynamic";

import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";

const ClientLayout = dynamic(() => import("@/components/ClientLayout").then(mod => mod.ClientLayout));

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
});

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
      <body className={`antialiased ${merriweather.variable} font-serif`}>
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
        <ClientLayout>{children}</ClientLayout>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}