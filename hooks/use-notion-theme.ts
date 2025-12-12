"use client";

import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";

export function useNotionTheme() {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: {
            main: "#2383E2",
            light: "#4A9EFF",
            dark: "#1A6BC7",
            contrastText: "#FFFFFF",
          },
          background: {
            default: "#191919",
            paper: "#1F1F1F",
          },
          text: {
            primary: "#FFFFFF",
            secondary: "rgba(255, 255, 255, 0.65)",
          },
          divider: "rgba(255, 255, 255, 0.09)",
          action: {
            active: "rgba(255, 255, 255, 0.54)",
            hover: "rgba(255, 255, 255, 0.08)",
            selected: "rgba(255, 255, 255, 0.12)",
            disabled: "rgba(255, 255, 255, 0.26)",
            disabledBackground: "rgba(255, 255, 255, 0.12)",
          },
        },
        typography: {
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
          h6: {
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.5,
            color: "#FFFFFF",
          },
          body2: {
            fontSize: "14px",
            lineHeight: 1.5,
            color: "rgba(255, 255, 255, 0.65)",
          },
          body1: {
            fontSize: "14px",
            lineHeight: 1.5,
            color: "rgba(255, 255, 255, 0.65)",
          },
        },
        shape: {
          borderRadius: 3,
        },
        shadows: [
          "none",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.3) 0px 2px 4px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 4px 8px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 5px 10px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 6px 12px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 7px 14px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 8px 16px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 9px 18px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 10px 20px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 11px 22px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 12px 24px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 13px 26px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 14px 28px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 15px 30px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 16px 32px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 17px 34px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 18px 36px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 19px 38px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 20px 40px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 21px 42px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 22px 44px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 23px 46px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 24px 48px",
          "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 25px 50px",
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
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: "#1F1F1F",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                boxShadow: "rgba(0, 0, 0, 0.3) 0px 0px 0px 1px, rgba(0, 0, 0, 0.3) 0px 2px 4px",
                padding: "16px",
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
  return theme;
}
