"use client";

import { Box, CircularProgress, Alert } from "@mui/material";
import LineChart from "./charts/LineChart";
import type { ChartConfig as ChartConfigType } from "@/types/notion";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

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

export default function ChartWidget({ config }: { config: ChartConfigType }) {
  const {
    data: chartData,
    isLoading,
    error,
  } = useSWR<ChartDataResponse>(
    `/api/chart-data?database_id=${config.databaseId}&field_id=${config.fieldId}`,
    fetcher
  );

  if (isLoading) {
    return (
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
    );
  }

  if (error) {
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Alert severity="error">{error}</Alert>
    </Box>;
  }

  return (
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
      {!chartData || chartData.data.length === 0 ? (
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
          fieldType={chartData.fieldType}
        />
      )}
    </Box>
  );
}
