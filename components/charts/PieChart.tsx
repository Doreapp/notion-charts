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

const RADIAN = Math.PI / 180;

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
}

function renderCustomLabel(props: LabelProps) {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    percent = 0,
    name = "",
  } = props;

  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = (percent * 100).toFixed(1);

  return (
    <text
      x={x}
      y={y}
      fill="rgba(255, 255, 255, 0.65)"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name} ${percentage}%`}
    </text>
  );
}

interface LabelLineProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
}

function renderLabelLine(props: LabelLineProps) {
  const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0 } = props;

  const radius = outerRadius + 10;
  const x1 = cx + outerRadius * Math.cos(-midAngle * RADIAN);
  const y1 = cy + outerRadius * Math.sin(-midAngle * RADIAN);
  const x2 = cx + radius * Math.cos(-midAngle * RADIAN);
  const y2 = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="rgba(255, 255, 255, 0.3)"
      strokeWidth={1}
    />
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ChartDataPoint;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  const value = data.value;
  const name = data.payload.name;

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
      <div style={{ color: "#FFFFFF" }}>{value}</div>
    </div>
  );
}

export default function PieChart({ data }: PieChartProps) {
  if (data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data as unknown as Array<Record<string, unknown>>}
            cx="50%"
            cy="50%"
            labelLine={renderLabelLine}
            label={renderCustomLabel}
            outerRadius={80}
            innerRadius={50}
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
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          {total}
        </div>
      </div>
    </div>
  );
}
