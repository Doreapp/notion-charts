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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(55, 53, 47, 0.09)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#787774" }}
          stroke="rgba(55, 53, 47, 0.09)"
          label={{
            value: xAxisLabel,
            position: "insideBottom",
            offset: -5,
            style: { fontSize: 12, fill: "#787774" },
          }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#787774" }}
          stroke="rgba(55, 53, 47, 0.09)"
          label={{
            value: yAxisLabel,
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 12, fill: "#787774" },
          }}
        />
        <Line type="monotone" dataKey="value" stroke="#2383E2" strokeWidth={2} dot={false} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
