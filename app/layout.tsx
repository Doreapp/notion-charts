import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
