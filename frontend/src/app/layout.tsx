import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import ToastProvider from "@/components/ui/Toast/ToastProvider";
import { SkipToContent } from "@/components/ui/SkipToContent";

export const metadata: Metadata = {
  title: {
    default: "RestoOrderHub - Бронювання столиків та замовлення онлайн",
    template: "%s | RestoOrderHub",
  },
  description: "Платформа для бронювання столиків та управління замовленнями в ресторанах. Зручне онлайн-бронювання, перегляд меню та замовлення страв.",
  keywords: ["ресторан", "бронювання", "столик", "меню", "замовлення", "онлайн"],
  authors: [{ name: "RestoOrderHub" }],
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: "RestoOrderHub",
    title: "RestoOrderHub - Бронювання столиків та замовлення онлайн",
    description: "Платформа для бронювання столиків та управління замовленнями в ресторанах",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body>
        <SkipToContent />
        <ReduxProvider>
          <AuthProvider>
            <ToastProvider>
              <main id="main-content">{children}</main>
            </ToastProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
