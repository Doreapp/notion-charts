"use client";

import { Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, CircularProgress } from "@mui/material";
import ChartWidget from "@/components/ChartWidget";
import "./embed.css";
import { useNotionTheme } from "../hooks/use-notion-theme";

function LoadingFallback() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        width: "100%",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function EmbedPage() {
  const theme = useNotionTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<LoadingFallback />}>
        <ChartWidget />
      </Suspense>
    </ThemeProvider>
  );
}
