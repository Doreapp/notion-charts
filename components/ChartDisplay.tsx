"use client";

import { CircularProgress, Alert, Stack, Box, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useEffect } from "react";
import LineChart from "./charts/LineChart";
import type { ChartConfig as ChartConfigType } from "@/types/notion";
import useSWR from "swr";
import { fetcher, UnauthorizedError } from "@/utils/fetcher";
import { configToUrlParams } from "@/utils/config-params";

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
  showConfigButton?: boolean;
}

export default function ChartWidget({
  config,
  onAuthError,
  showConfigButton = false,
}: ChartDisplayProps) {
  const handleOpenConfig = () => {
    const params = configToUrlParams(config);
    const configUrl = `/config?${params.toString()}`;
    window.open(configUrl, "_blank");
  };

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
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        flex: 1,
        minHeight: 0,
      }}
    >
      {showConfigButton && (
        <Box
          sx={{
            position: "absolute",
            top: 4,
            left: 4,
            zIndex: 10,
          }}
        >
          <IconButton
            onClick={handleOpenConfig}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Stack
        direction="column"
        flex={1}
        minHeight={0}
        width="100%"
        height="100%"
      >
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
          >
            <LineChart
              data={chartData.data}
              xAxisLabel={chartData.xAxisLabel}
              yAxisLabel={chartData.yAxisLabel}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}
