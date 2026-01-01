import type { Metadata } from "next";
import { Geist, Geist_Mono, Berkshire_Swash } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const berkshire = Berkshire_Swash({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-berkshire",
});

export const metadata: Metadata = {
  title: "Christmas Tree QR Game",
  description: "A festive Christmas QR Code game!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${berkshire.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
