import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JabarPleasure — Jawa Barat Public Leisure & Entertainment Spatial Guide",
  description: "Platform WebGIS yang menyajikan rekomendasi tempat hiburan dan destinasi wisata di Jawa Barat secara interaktif dan presisi.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
