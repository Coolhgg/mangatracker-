"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface LayoutChromeProps {
  children: React.ReactNode;
}

export const LayoutChrome = ({ children }: LayoutChromeProps) => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      {!isHome && <Header />}
      <main className="flex-1">{children}</main>
      {!isHome && <Footer />}
    </div>
  );
};

export default LayoutChrome;