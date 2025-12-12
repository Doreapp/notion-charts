"use client";

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
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
      <RechartsLineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={{ value: xAxisLabel, position: "insideBottom", offset: -5 }} />
        <YAxis label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />
        <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={2} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

