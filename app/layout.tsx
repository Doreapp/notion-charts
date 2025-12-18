import type { Metadata } from "next";
import "./globals.css";
import ThemeHolder from "@/components/ThemeHolder";

export const metadata: Metadata = {
  title: "Notion Chart Widget",
  description: "Embeddable chart widget for Notion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeHolder>{children}</ThemeHolder>
      </body>
    </html>
  );
}
