import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://najottalimjamoasi.uz"),
  title: {
    default: "Najot Ta'lim HR",
    template: "%s | Najot Ta'lim HR"
  },
  description: "Najot Ta'lim o'quv markazining HR tizimi va vakansiyalar portali",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Najot Ta'lim HR",
    description: "Najot Ta'lim o'quv markazining HR tizimi va vakansiyalar portali",
    url: "https://najottalimjamoasi.uz",
    siteName: "Najot Ta'lim HR",
    locale: "uz_UZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
