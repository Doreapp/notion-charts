"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "@/lib/notion/chart-processor";

const SERIES_COLORS = [
  "#2383E2",
  "#D44C47",
  "#6940A5",
  "#D9730D",
  "#0F7B6C",
  "#337EA9",
  "#CB912F",
  "#448361",
];

interface LineChartProps {
  data: ChartDataPoint[] | Record<string, string | number>[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  seriesLabels?: string[];
}

export default function LineChart({
  data,
  xAxisLabel,
  yAxisLabel,
  seriesLabels,
}: LineChartProps) {
  if (data.length === 0) {
    return null;
  }

  const isMultiSeries = seriesLabels && seriesLabels.length > 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: isMultiSeries ? 30 : 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255, 255, 255, 0.09)"
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "rgba(255, 255, 255, 0.65)" }}
          stroke="rgba(255, 255, 255, 0.09)"
          label={{
            value: xAxisLabel,
            position: "insideBottom",
            offset: -5,
            style: { fontSize: 12, fill: "rgba(255, 255, 255, 0.65)" },
          }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "rgba(255, 255, 255, 0.65)" }}
          stroke="rgba(255, 255, 255, 0.09)"
          label={
            !isMultiSeries
              ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "rgba(255, 255, 255, 0.65)" },
                }
              : undefined
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F1F1F",
            border: "1px solid rgba(255, 255, 255, 0.09)",
            borderRadius: "3px",
            color: "#FFFFFF",
            fontSize: "12px",
          }}
          labelStyle={{
            color: "rgba(255, 255, 255, 0.65)",
            marginBottom: "4px",
          }}
          itemStyle={{
            color: "#FFFFFF",
          }}
        />
        {isMultiSeries ? (
          <>
            <Legend
              wrapperStyle={{
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.65)",
              }}
            />
            {seriesLabels.map((label, index) => (
              <Line
                key={`series_${index}`}
                type="monotone"
                dataKey={`series_${index}`}
                name={label}
                stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </>
        ) : (
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2383E2"
            strokeWidth={2}
            dot={false}
          />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
