import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Swipeit — Decisiones en grupo con swipe",
    template: "%s | Swipeit",
  },
  description:
    "Resolvé decisiones en grupo deslizando opciones. Creá una encuesta, compartí el link y votá.",
  openGraph: {
    title: "Swipeit — Decisiones en grupo con swipe",
    description:
      "Resolvé decisiones en grupo deslizando opciones. Creá una encuesta, compartí el link y votá.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
