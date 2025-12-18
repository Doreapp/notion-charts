"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./globals.css";
import { useNotionTheme } from "@/hooks/use-notion-theme";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import SecretInput from "@/components/SecretInput";
import { hasSecret } from "@/utils/secret-storage";
import { getNextUrlFromParams } from "@/utils/login-redirect";

export default function LoginPage() {
  const theme = useNotionTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasStoredSecret, setHasStoredSecret] = useState(hasSecret());

  useEffect(() => {
    if (hasStoredSecret) {
      const nextUrl = getNextUrlFromParams(searchParams);
      const redirectUrl = nextUrl || "/config";
      router.replace(redirectUrl);
    }
  }, [hasStoredSecret, searchParams, router]);

  const handleSecretStored = () => {
    setHasStoredSecret(true);
  };

  const nextUrl = getNextUrlFromParams(searchParams) || "/config";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          p: 2,
          boxSizing: "border-box",
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SecretInput onSecretStored={handleSecretStored} nextUrl={nextUrl} />
      </Box>
    </ThemeProvider>
  );
}
