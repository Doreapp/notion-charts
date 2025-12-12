"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/lib/chart-processor";

interface LineChartProps {
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export default function LineChart({ data, xAxisLabel, yAxisLabel }: LineChartProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          label={{
            value: xAxisLabel,
            position: "insideBottom",
            offset: -5,
            style: { fontSize: 12 },
          }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{
            value: yAxisLabel,
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 12 },
          }}
        />
        <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={2} dot={false} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
