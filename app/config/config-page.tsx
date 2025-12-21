"use client";

import { useRouter } from "next/navigation";
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

export default function ConfigPage({
  params,
}: {
  params: Record<string, string>;
}) {
  const searchParams = new URLSearchParams(params);
  const router = useRouter();

  const [hasStoredSecret, setHasStoredSecret] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const [config, setConfig] = useState<ChartConfigType | null>(() => {
    return urlParamsToConfig(searchParams);
  });

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await hasSecret();
      setHasStoredSecret(authenticated);
      if (!authenticated) {
        const currentUrl = getCurrentUrlWithParams();
        const loginUrl = buildLoginRedirectUrl(currentUrl);
        router.replace(loginUrl);
      }
    };
    checkAuth();
  }, [router]);

  const handleAuthError = async () => {
    await clearSecret();
    const currentUrl = getCurrentUrlWithParams();
    const loginUrl = buildLoginRedirectUrl(currentUrl);
    router.replace(loginUrl);
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

  if (hasStoredSecret === null || !hasStoredSecret) {
    return null; // Will be redirected
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
