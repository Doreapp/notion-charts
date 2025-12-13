"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useMemo } from "react";
import { Box, Alert, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ChartConfig from "./ChartConfig";
import SecretInput from "./SecretInput";
import type { ChartConfig as ChartConfigType } from "@/types/notion";
import ChartDisplay from "./ChartDisplay";
import { hasSecret, clearSecret } from "@/utils/secret-storage";

export default function ChartWidget() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const isInIframe = useMemo(
    () => typeof window !== "undefined" && window.self !== window.top,
    []
  );

  const [hasStoredSecret, setHasStoredSecret] = useState(hasSecret());
  const [authFailed, setAuthFailed] = useState(false);

  const [config, setConfig] = useState<ChartConfigType | null>(() => {
    const databaseId = searchParams.get("database_id");
    const fieldId = searchParams.get("field_id");
    if (databaseId && fieldId) {
      return {
        databaseId,
        fieldId,
        chartType: "line",
        aggregation: "count",
      };
    }
    return null;
  });
  const [showConfig, setShowConfig] = useState(false);

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
    setShowConfig(false);

    const params = new URLSearchParams();
    params.set("database_id", newConfig.databaseId);
    params.set("field_id", newConfig.fieldId);
    router.push(`/?${params.toString()}`);
  };

  const handleEditConfig = () => {
    setShowConfig(true);
  };

  if (!hasStoredSecret) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
          p: 2,
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        <SecretInput
          onSecretStored={handleSecretStored}
          authFailed={authFailed}
        />
      </Box>
    );
  }

  if (!config || showConfig) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
          p: 2,
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        <ChartConfig
          onConfigChange={handleConfigChange}
          initialConfig={config || undefined}
          onAuthError={handleAuthError}
        />
      </Box>
    );
  }

  if (!config) {
    return (
      <Box sx={{ p: 2, width: "100%" }}>
        <Alert severity="info">Please configure the chart</Alert>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: isInIframe ? "100%" : "400px",
        p: isInIframe ? 1 : 2,
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {isInIframe && (
        <IconButton
          onClick={handleEditConfig}
          sx={{
            position: "absolute",
            top: 4,
            left: 4,
            zIndex: 10,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          size="small"
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      )}

      <ChartDisplay config={config} onAuthError={handleAuthError} />
    </Box>
  );
}
