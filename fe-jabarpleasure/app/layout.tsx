import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JabarPleasure — Jawa Barat Public Leisure & Entertainment Spatial Guide",
  description: "Platform WebGIS yang menyajikan rekomendasi tempat hiburan dan destinasi wisata di Jawa Barat secara interaktif dan presisi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
