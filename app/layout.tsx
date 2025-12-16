import type { Metadata } from "next";
import { Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Background } from "@/components/layout/Background";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const rajdhani = Rajdhani({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
});

const shareTechMono = Share_Tech_Mono({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-share-tech',
});

export const metadata: Metadata = {
  title: "Xandeum Overwatch",
  description: "Real-time monitoring and analytics for the Xandeum Storage Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${shareTechMono.variable}`}>
      <body className="bg-[#030712] text-white antialiased selection:bg-cyan-500/30">
        <ErrorBoundary>
          <Background />
          <div className="relative z-10">{children}</div>
        </ErrorBoundary>
      </body>
    </html>
  );
}


