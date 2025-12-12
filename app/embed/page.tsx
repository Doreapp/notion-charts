"use client";

import { Suspense, useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, CircularProgress } from "@mui/material";
import ChartWidget from "@/components/ChartWidget";
import "./embed.css";

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
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: {
            main: "#2383E2",
            light: "#4A9EFF",
            dark: "#1A6BC7",
            contrastText: "#FFFFFF",
          },
          background: {
            default: "#FFFFFF",
            paper: "#FFFFFF",
          },
          text: {
            primary: "#37352F",
            secondary: "#787774",
          },
          divider: "rgba(55, 53, 47, 0.09)",
          action: {
            active: "rgba(55, 53, 47, 0.54)",
            hover: "rgba(55, 53, 47, 0.08)",
            selected: "rgba(55, 53, 47, 0.12)",
            disabled: "rgba(55, 53, 47, 0.26)",
            disabledBackground: "rgba(55, 53, 47, 0.12)",
          },
        },
        typography: {
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
          h6: {
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.5,
            color: "#37352F",
          },
          body2: {
            fontSize: "14px",
            lineHeight: 1.5,
            color: "#787774",
          },
        },
        shape: {
          borderRadius: 3,
        },
        shadows: [
          "none",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 3px 6px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 4px 8px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 5px 10px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 6px 12px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 7px 14px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 8px 16px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 9px 18px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 10px 20px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 11px 22px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 12px 24px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 13px 26px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 14px 28px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 15px 30px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 16px 32px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 17px 34px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 18px 36px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 19px 38px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 20px 40px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 21px 42px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 22px 44px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 23px 46px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 24px 48px",
          "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 25px 50px",
        ],
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "14px",
                padding: "4px 12px",
                borderRadius: "3px",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                padding: "4px",
                "&:hover": {
                  backgroundColor: "rgba(55, 53, 47, 0.08)",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(55, 53, 47, 0.09)",
                boxShadow:
                  "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px",
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: "3px",
                fontSize: "14px",
              },
            },
          },
        },
      }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<LoadingFallback />}>
        <ChartWidget />
      </Suspense>
    </ThemeProvider>
  );
}
