import type { Metadata, Viewport } from "next";
import { Bai_Jamjuree, Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

const baiJamjuree = Bai_Jamjuree({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "day-flow",
  description: "day-flow",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "day-flow",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#e8f0ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${baiJamjuree.variable} min-h-dvh bg-paper text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
