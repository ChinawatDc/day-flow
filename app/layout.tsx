import type { Metadata, Viewport } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-anuphan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "day-flow",
  description: "สมุดบ้านประจำวัน",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "day-flow",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4efe6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${anuphan.variable} min-h-dvh bg-paper text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
