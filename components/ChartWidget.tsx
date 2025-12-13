"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
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

  const [hasStoredSecret, setHasStoredSecret] = useState(hasSecret());
  const [authFailed, setAuthFailed] = useState(false);

  const [config, setConfig] = useState<ChartConfigType | null>(() => {
    const databaseId = searchParams.get("database_id");
    const xAxisFieldId =
      searchParams.get("x_axis_field_id") || searchParams.get("field_id");
    const yAxisFieldId = searchParams.get("y_axis_field_id") || undefined;
    const aggregation = (searchParams.get("aggregation") || "count") as
      | "count"
      | "sum"
      | "avg";
    const sortOrder = (searchParams.get("sort_order") || "asc") as
      | "asc"
      | "desc";
    const accumulate = searchParams.get("accumulate") === "true";

    if (databaseId && xAxisFieldId) {
      return {
        databaseId,
        xAxisFieldId,
        yAxisFieldId,
        chartType: "line",
        aggregation,
        sortOrder,
        accumulate,
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
    params.set("x_axis_field_id", newConfig.xAxisFieldId);
    if (newConfig.yAxisFieldId) {
      params.set("y_axis_field_id", newConfig.yAxisFieldId);
    }
    params.set("aggregation", newConfig.aggregation);
    if (newConfig.sortOrder) {
      params.set("sort_order", newConfig.sortOrder);
    }
    if (newConfig.accumulate) {
      params.set("accumulate", "true");
    }
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
        p: 1,
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
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

      <ChartDisplay config={config} onAuthError={handleAuthError} />
    </Box>
  );
}
