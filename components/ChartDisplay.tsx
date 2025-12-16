"use client";

import { CircularProgress, Alert, Stack, Box } from "@mui/material";
import { useEffect, useState } from "react";
import LineChart from "./charts/LineChart";
import UrlOverlay from "./UrlOverlay";
import type { ChartConfig as ChartConfigType } from "@/types/notion";
import useSWR from "swr";
import { fetcher, UnauthorizedError } from "@/utils/fetcher";

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

interface ChartDisplayProps {
  config: ChartConfigType;
  onAuthError?: () => void;
}

export default function ChartWidget({
  config,
  onAuthError,
}: ChartDisplayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const queryParams = new URLSearchParams({
    database_id: config.databaseId,
    x_axis_field_id: config.xAxisFieldId,
    aggregation: config.aggregation,
    sort_order: config.sortOrder || "asc",
    accumulate: config.accumulate ? "true" : "false",
    filters: encodeURIComponent(JSON.stringify(config.filters || [])),
  });

  if (config.yAxisFieldId) {
    queryParams.set("y_axis_field_id", config.yAxisFieldId);
  }

  const {
    data: chartData,
    isLoading,
    error,
  } = useSWR<ChartDataResponse>(
    `/api/chart-data?${queryParams.toString()}`,
    fetcher
  );

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  useEffect(() => {
    if (error instanceof UnauthorizedError && onAuthError) {
      onAuthError();
    }
  }, [error, onAuthError]);

  if (isLoading) {
    return (
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        flex={1}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    if (error instanceof UnauthorizedError) {
      return null;
    }
    return (
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        flex={1}
        p={2}
      >
        <Alert severity="error">
          {error instanceof Error ? error.message : String(error)}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack direction="column" flex={1} minHeight={0} width="100%" height="100%">
      {!chartData || chartData.data.length === 0 ? (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          flex={1}
        >
          <Alert severity="info">No data available</Alert>
        </Stack>
      ) : (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            flex: 1,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <UrlOverlay
            isVisible={isHovered}
            currentUrl={window.location.href}
            copied={copied}
            onCopy={handleCopyUrl}
          />
          <LineChart
            data={chartData.data}
            xAxisLabel={chartData.xAxisLabel}
            yAxisLabel={chartData.yAxisLabel}
            fieldType={chartData.fieldType}
            accumulate={config.accumulate}
            onChartClick={handleCopyUrl}
          />
        </Box>
      )}
    </Stack>
  );
}
