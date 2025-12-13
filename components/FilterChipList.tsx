"use client";

import { Chip, Box, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { FilterCondition, DatabaseWithProperties } from "@/types/notion";

interface FilterChipListProps {
  filters: FilterCondition[];
  properties: DatabaseWithProperties["properties"];
  onDelete: (index: number) => void;
}

function getOperatorLabel(operator: string): string {
  const labels: Record<string, string> = {
    equals: "=",
    contains: "contains",
    greater_than: ">",
    less_than: "<",
    before: "before",
    after: "after",
    is_empty: "is empty",
    is_not_empty: "is not empty",
  };
  return labels[operator] || operator;
}

function formatFilterValue(
  condition: FilterCondition,
  properties: DatabaseWithProperties["properties"]
): string {
  const property = properties.find((p) => p.id === condition.propertyId);
  const propertyName = property?.name || condition.propertyId;

  if (
    condition.operator === "is_empty" ||
    condition.operator === "is_not_empty"
  ) {
    return `${propertyName} ${getOperatorLabel(condition.operator)}`;
  }

  let valueStr = "";
  if ("value" in condition) {
    if (typeof condition.value === "boolean") {
      valueStr = condition.value ? "true" : "false";
    } else if (typeof condition.value === "number") {
      valueStr = condition.value.toString();
    } else if (condition.value) {
      valueStr = condition.value;
    }
  }

  return `${propertyName} ${getOperatorLabel(condition.operator)} ${valueStr}`;
}

export default function FilterChipList({
  filters,
  properties,
  onDelete,
}: FilterChipListProps) {
  if (filters.length === 0) {
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          No filters applied
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, py: 1 }}>
      {filters.map((filter, index) => (
        <Chip
          key={index}
          label={formatFilterValue(filter, properties)}
          onDelete={() => onDelete(index)}
          deleteIcon={<DeleteIcon />}
          size="small"
          variant="outlined"
        />
      ))}
    </Box>
  );
}
