import type { Metadata } from "next";
import "./globals.css";
import MainNav from "./components/navigation/MainNav";

export const metadata: Metadata = {
  title: "YouTube AI Studio",
  description: "AI-powered YouTube automation and viral content discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <MainNav />
        {children}
      </body>
    </html>
  );
}
