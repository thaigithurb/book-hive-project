import type { Metadata } from "next";
import React from "react";
import { SideBar } from "../components/SideBar/SideBar";

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
      <div className="pl-[280px] min-h-screen bg-[#F0F9FF]">
        <SideBar />
        <main className="p-[32px]">{children}</main>
      </div>
    </>
  );
}
