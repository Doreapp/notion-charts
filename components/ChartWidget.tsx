"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Box, CircularProgress, Alert, Typography, Button } from "@mui/material";
import ChartConfig from "./ChartConfig";
import type { ChartConfig as ChartConfigType } from "@/types/notion";

export default function ChartWidget() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const handleConfigChange = (newConfig: ChartConfigType) => {
    setConfig(newConfig);
    setShowConfig(false);

    const params = new URLSearchParams();
    params.set("database_id", newConfig.databaseId);
    params.set("field_id", newConfig.fieldId);
    router.push(`/embed?${params.toString()}`);
  };

  const handleEditConfig = () => {
    setShowConfig(true);
  };

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
        <ChartConfig onConfigChange={handleConfigChange} initialConfig={config || undefined} />
      </Box>
    );
  }

  if (!config) {
    return (
      <Box
        sx={{
          p: 2,
          width: "100%",
        }}
      >
        <Alert severity="info">Please configure the chart</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        p: 2,
        boxSizing: "border-box",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Chart</Typography>
        <Button variant="outlined" size="small" onClick={handleEditConfig}>
          Edit Configuration
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Database ID: {config.databaseId}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Field ID: {config.fieldId}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Chart Type: {config.chartType} | Aggregation: {config.aggregation}
      </Typography>

      <Box
        sx={{
          mt: 3,
          p: 2,
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 1,
          textAlign: "center",
          color: "text.secondary",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Chart will be rendered here
      </Box>
    </Box>
  );
}
