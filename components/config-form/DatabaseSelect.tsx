"use client";

import { Controller, useFormContext } from "react-hook-form";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { DatabaseWithProperties } from "@/types/notion";

interface Props {
  isLoading: boolean;
  databases: DatabaseWithProperties[];
  name: string;
}

export default function DatabaseSelect({ name, isLoading, databases }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: "Database is required" }}
      render={({ field }) => (
        <FormControl fullWidth disabled={isLoading}>
          <InputLabel size="small">Database</InputLabel>
          <Select
            {...field}
            value={isLoading ? "loading" : field.value}
            label="Database"
            size="small"
          >
            {isLoading && (
              <MenuItem disabled value="loading">
                Loading databases...
              </MenuItem>
            )}
            {databases?.map((db) => (
              <MenuItem key={db.id} value={db.id}>
                {db.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  );
}
