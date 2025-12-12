"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Box, CircularProgress, Alert, Typography, Button } from "@mui/material";
import ChartConfig from "./ChartConfig";
import LineChart from "./charts/LineChart";
import type { ChartConfig as ChartConfigType } from "@/types/notion";

interface ChartDataPoint {
  name: string;
  value: number;
}

interface ChartDataResponse {
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  fieldType?: string;
  totalPages?: number;
}

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
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

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

  useEffect(() => {
    if (config && !showConfig) {
      fetchChartData();
    }
  }, [config, showConfig]);

  const fetchChartData = async () => {
    if (!config) return;

    try {
      setLoadingData(true);
      setDataError(null);

      const params = new URLSearchParams();
      params.set("database_id", config.databaseId);
      params.set("field_id", config.fieldId);

      const response = await fetch(`/api/chart-data?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch chart data");
      }

      const data = await response.json();
      setChartData(data);
    } catch (err: any) {
      setDataError(err.message || "Failed to load chart data");
    } finally {
      setLoadingData(false);
    }
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

      {loadingData && (
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {dataError && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="error">{dataError}</Alert>
        </Box>
      )}

      {chartData && !loadingData && !dataError && (
        <Box
          sx={{
            mt: 3,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total pages: {chartData.totalPages || 0} | Data points: {chartData.data.length}
          </Typography>
          <Box sx={{ flex: 1, minHeight: 300, mt: 2 }}>
            {chartData.data.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                No data available
              </Typography>
            ) : (
              <LineChart
                data={chartData.data}
                xAxisLabel={chartData.xAxisLabel}
                yAxisLabel={chartData.yAxisLabel}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
