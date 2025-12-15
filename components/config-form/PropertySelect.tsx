"use client";

import { Controller, useFormContext } from "react-hook-form";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { DatabaseWithProperties } from "@/types/notion";

interface Props {
  properties: DatabaseWithProperties["properties"];
  isLoading?: boolean;
  disabled?: boolean;
  name: string;
  label: string;
  emptyWarningMessage?: string;
  required?: boolean;
}

export default function PropertySelect({
  properties,
  isLoading,
  disabled,
  name,
  label,
  emptyWarningMessage,
  required,
}: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? `${label} is required` : false }}
      render={({ field }) => (
        <FormControl fullWidth disabled={disabled || isLoading}>
          <InputLabel size="small">{label}</InputLabel>
          <Select
            {...field}
            label={label}
            disabled={disabled || isLoading}
            size="small"
          >
            {properties.length === 0 && emptyWarningMessage ? (
              <MenuItem disabled>{emptyWarningMessage}</MenuItem>
            ) : (
              properties.map((prop) => (
                <MenuItem key={prop.id} value={prop.id}>
                  {prop.name} ({prop.type})
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      )}
    />
  );
}
