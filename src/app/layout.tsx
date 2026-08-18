import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { ScrollOverlay } from "@/components/layout/scroll-overlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resumint— Build a résumé that gets past the robots",
  description:
    "Free, private résumé builder for freshers and career-switchers, with an ATS score checker and plain-language tips.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <ThemeProvider>
          <div className="ambient-backdrop" aria-hidden />
          <ScrollProgress />
          <ScrollOverlay />
          <Nav />
          <main className="relative z-10">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
