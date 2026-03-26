import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/theme-provider";
import { getSupabasePublicUrl } from "@/lib/supabase-assets";

import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";

const ClientLayout = dynamic(() => import("@/components/ClientLayout").then(mod => mod.ClientLayout));
const routeMessengerScriptUrl = getSupabasePublicUrl("scripts/route-messenger.js");

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-serif">
        <ErrorReporter />
        {routeMessengerScriptUrl ? (
          <Script
            src={routeMessengerScriptUrl}
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
          />
        ) : null}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
