import type { Metadata } from "next";
import "./globals.css";
import ThemeHolder from "@/components/ThemeHolder";
import { SWRConfig } from "swr";

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
        <SWRConfig
          value={{
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateIfStale: false,
            refreshInterval: 0,
          }}
        >
          <ThemeHolder>{children}</ThemeHolder>
        </SWRConfig>
      </body>
    </html>
  );
}
