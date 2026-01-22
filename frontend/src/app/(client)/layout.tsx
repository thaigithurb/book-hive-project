import type { Metadata } from "next";
import React from "react";
import Footer from "../components/Layout/Footer/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { UserProvider } from "@/contexts/UserContext";
import ClientAuthGuard from "../components/Auth/ClientAuthGuard/ClientAuthGuard";
import { Header } from "../components/Layout/Header/Header";

export const metadata: Metadata = {
  title: "BookHive",
  description: "Nơi tri thức hội tụ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <CartProvider>
        <ClientAuthGuard>
          <Header />
          <main className="pt-[144px]">{children}</main>
          <Footer />
        </ClientAuthGuard>
      </CartProvider>
    </UserProvider>
  );
}
