"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartDataPoint } from "@/lib/notion/chart-processor";

interface PieChartProps {
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const COLORS = [
  "#2383E2",
  "#4CAF50",
  "#FF9800",
  "#E91E63",
  "#9C27B0",
  "#00BCD4",
  "#FFC107",
  "#795548",
  "#607D8B",
  "#F44336",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ChartDataPoint;
  }>;
  total: number;
}

function CustomTooltip({ active, payload, total }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  const value = data.value;
  const name = data.payload.name;
  const percentage = ((value / total) * 100).toFixed(1);

  return (
    <div
      style={{
        backgroundColor: "#1F1F1F",
        border: "1px solid rgba(255, 255, 255, 0.09)",
        borderRadius: "3px",
        padding: "8px 12px",
        color: "#FFFFFF",
        fontSize: "12px",
      }}
    >
      <div style={{ color: "rgba(255, 255, 255, 0.65)", marginBottom: "4px" }}>
        {name}
      </div>
      <div style={{ color: "#FFFFFF" }}>
        {value} ({percentage}%)
      </div>
    </div>
  );
}

export default function PieChart({
  data,
  xAxisLabel,
  yAxisLabel,
}: PieChartProps) {
  if (data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip total={total} />} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

