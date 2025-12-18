"use client";
import { useNotionTheme } from "@/hooks/use-notion-theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

export default function ThemeHolder({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = useNotionTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
