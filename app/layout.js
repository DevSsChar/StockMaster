import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import ScriptLoader from "@/components/ScriptLoader";
import UniversalNavbar from "@/components/ui/universal-navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "StockMaster - Inventory Management System",
  description: "Professional inventory and warehouse management solution",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
      >
        <ScriptLoader />
        <SessionWrapper>
          <UniversalNavbar />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}