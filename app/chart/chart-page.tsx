"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Box } from "@mui/material";
import ChartDisplay from "@/components/ChartDisplay";
import { hasSecret, clearSecret } from "@/utils/secret-storage";
import { urlParamsToConfig } from "@/utils/config-params";
import {
  buildLoginRedirectUrl,
  getCurrentUrlWithParams,
} from "@/utils/login-redirect";

export default function ChartPage({
  params,
}: {
  params: Record<string, string>;
}) {
  const router = useRouter();

  const isAuthenticated = useMemo(() => hasSecret(), []);

  const config = urlParamsToConfig(new URLSearchParams(params));

  useEffect(() => {
    if (!isAuthenticated) {
      const currentUrl = getCurrentUrlWithParams();
      const loginUrl = buildLoginRedirectUrl(currentUrl);
      router.replace(loginUrl);
    }
  }, [isAuthenticated, router]);

  const handleAuthError = async () => {
    await clearSecret();
    const currentUrl = getCurrentUrlWithParams();
    const loginUrl = buildLoginRedirectUrl(currentUrl);
    router.replace(loginUrl);
  };

  if (!isAuthenticated) {
    return null; // Will be redirected
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
