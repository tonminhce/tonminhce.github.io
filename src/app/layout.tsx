import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "./world.css";
import "./world-ui.css";
import "./world-mobile.css";
const sans = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://tonminhce.github.io"),
  title: "Nguyen Ton Minh — Java & Backend Engineer",
  description:
    "Software engineer in Ho Chi Minh City. Java, Spring Boot, Go, and distributed systems. Explore my work, experience, and engineering projects.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Nguyen Ton Minh — Java & Backend Engineer",
    description:
      "Building the systems behind the experience. Java, Go, and distributed systems.",
    url: "https://tonminhce.github.io",
    type: "website",
  },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#111313" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
