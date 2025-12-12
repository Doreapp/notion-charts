"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Alert, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInIframe, setIsInIframe] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
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
    setIsInIframe(window.self !== window.top);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
            right: 4,
            zIndex: 10,
            backgroundColor: "background.paper",
            boxShadow: 1,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          size="small"
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      )}

      {loadingData && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {dataError && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Alert severity="error">{dataError}</Alert>
        </Box>
      )}

      {chartData && !loadingData && !dataError && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {chartData.data.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Alert severity="info">No data available</Alert>
            </Box>
          ) : (
            <LineChart
              data={chartData.data}
              xAxisLabel={chartData.xAxisLabel}
              yAxisLabel={chartData.yAxisLabel}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
