import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "Book Hive",
  description: "Nơi tri thức hội tụ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F0F9FF]">
          <main>{children}</main>
      </body>
    </html>
  );
}
