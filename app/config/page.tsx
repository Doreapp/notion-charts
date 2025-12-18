"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Box, Stack, TextField, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ChartConfig from "@/components/ChartConfig";
import ChartDisplay from "@/components/ChartDisplay";
import SecretInput from "@/components/SecretInput";
import { hasSecret, clearSecret } from "@/utils/secret-storage";
import { urlParamsToConfig, configToUrlParams } from "@/utils/config-params";
import {
  buildLoginRedirectUrl,
  getCurrentUrlWithParams,
} from "@/utils/login-redirect";
import type { ChartConfig as ChartConfigType } from "@/types/notion";

export default function ConfigPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [hasStoredSecret, setHasStoredSecret] = useState(hasSecret());
  const [authFailed, setAuthFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const [config, setConfig] = useState<ChartConfigType | null>(() => {
    return urlParamsToConfig(searchParams);
  });

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

  const handleConfigChange = (newConfig: ChartConfigType) => {
    setConfig(newConfig);
    const params = configToUrlParams(newConfig);
    router.push(`/config?${params.toString()}`);
  };

  const chartUrl = useMemo(() => {
    if (!config || typeof window === "undefined") return "";
    const params = configToUrlParams(config);
    return `${window.location.origin}/chart?${params.toString()}`;
  }, [config]);

  const handleCopyChartUrl = async () => {
    if (!chartUrl) return;
    try {
      await navigator.clipboard.writeText(chartUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
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

  return (
    <Stack
      spacing={3}
      direction={{ xs: "column", md: "row" }}
      width="100%"
      height="100vh"
      overflow="auto"
      alignItems={{ xs: "stretch", md: "center" }}
      p={3}
    >
      <Box sx={{ flex: { xs: 0, md: 1 } }}>
        <ChartConfig
          onConfigChange={handleConfigChange}
          initialConfig={config || undefined}
          onAuthError={handleAuthError}
        />
      </Box>

      {config && (
        <>
          <Box sx={{ flex: { xs: 0, md: 1 } }}>
            <Stack spacing={2}>
              <Box
                sx={{
                  width: "100%",
                  height: "400px",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                  p: 2,
                }}
              >
                <ChartDisplay config={config} onAuthError={handleAuthError} />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "background.paper",
                }}
              >
                <TextField
                  value={chartUrl}
                  fullWidth
                  size="small"
                  InputProps={{
                    readOnly: true,
                    sx: {
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                    },
                  }}
                />
                <IconButton
                  onClick={handleCopyChartUrl}
                  size="small"
                  color={copied ? "success" : "default"}
                >
                  {copied ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Box>
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}
