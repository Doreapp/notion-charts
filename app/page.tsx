"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./globals.css";
import { useNotionTheme } from "@/hooks/use-notion-theme";
import dynamic from "next/dynamic";

const ChartWidget = dynamic(() => import("@/components/ChartWidget"), {
  ssr: false,
});

export default function EmbedPage() {
  const theme = useNotionTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChartWidget />
    </ThemeProvider>
  );
}
