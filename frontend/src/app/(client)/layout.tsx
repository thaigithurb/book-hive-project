import type { Metadata } from "next";
import React from "react";
import { Header } from "../components/Layout/Header/Header";
import Footer from "../components/Layout/Footer/Footer";
import { CartProvider } from "@/contexts/CartContext";

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
    <>
      <CartProvider>
        <Header />
        <main className="pt-[144px]">{children}</main>
        <Footer />
      </CartProvider>
    </>
  );
}
