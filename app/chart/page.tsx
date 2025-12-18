"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import ChartDisplay from "@/components/ChartDisplay";
import SecretInput from "@/components/SecretInput";
import { hasSecret, clearSecret } from "@/utils/secret-storage";
import { urlParamsToConfig } from "@/utils/config-params";
import {
  buildLoginRedirectUrl,
  getCurrentUrlWithParams,
} from "@/utils/login-redirect";

export default function ChartPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [hasStoredSecret, setHasStoredSecret] = useState(hasSecret());
  const [authFailed, setAuthFailed] = useState(false);

  const config = urlParamsToConfig(searchParams);

  useEffect(() => {
    if (!hasStoredSecret) {
      const currentUrl = getCurrentUrlWithParams();
      const loginUrl = buildLoginRedirectUrl(currentUrl);
      router.replace(loginUrl);
    }
  }, [hasStoredSecret, router]);

  const handleSecretStored = () => {
    setHasStoredSecret(true);
  };

  const handleAuthError = () => {
    clearSecret();
    setHasStoredSecret(false);
    setAuthFailed(true);
  };

  if (!hasStoredSecret) {
    return (
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
        <SecretInput
          onSecretStored={handleSecretStored}
          authFailed={authFailed}
          nextUrl={getCurrentUrlWithParams()}
        />
      </Box>
    );
  }

  if (!config) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          p: 2,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Invalid chart configuration. Please configure the chart first.
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        p: 1,
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <ChartDisplay
        config={config}
        onAuthError={handleAuthError}
        showConfigButton={true}
      />
    </Box>
  );
}
