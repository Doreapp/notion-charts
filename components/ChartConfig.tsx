"use client";

import { useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Typography,
  Paper,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import type { ChartConfig, DatabaseWithProperties } from "@/types/notion";
import useSWR from "swr";
import { fetcher, UnauthorizedError } from "@/utils/fetcher";

interface ChartConfigProps {
  onConfigChange: (config: ChartConfig) => void;
  initialConfig?: ChartConfig;
  onAuthError?: () => void;
}

interface FormValues {
  databaseId: string;
  xAxisFieldId: string;
  yAxisFieldId: string;
  aggregation: "count" | "sum" | "avg";
  sortOrder: "asc" | "desc";
  accumulate: boolean;
}

export default function ChartConfig({
  onConfigChange,
  initialConfig,
  onAuthError,
}: ChartConfigProps) {
  const { data, isLoading, error } = useSWR<{
    databases: DatabaseWithProperties[];
  }>("/api/databases", fetcher);
  const databases = useMemo(() => data?.databases, [data]);

  useEffect(() => {
    if (error instanceof UnauthorizedError && onAuthError) {
      onAuthError();
    }
  }, [error, onAuthError]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<FormValues>({
    defaultValues: {
      databaseId: initialConfig?.databaseId || "",
      xAxisFieldId: initialConfig?.xAxisFieldId || "",
      yAxisFieldId: initialConfig?.yAxisFieldId || "",
      aggregation: initialConfig?.aggregation || "count",
      sortOrder: initialConfig?.sortOrder || "asc",
      accumulate: initialConfig?.accumulate || false,
    },
    mode: "onChange",
  });

  const selectedDatabaseId = watch("databaseId");
  const aggregation = watch("aggregation");

  const properties = useMemo(() => {
    return (
      databases?.find((db) => db.id === selectedDatabaseId)?.properties || []
    );
  }, [databases, selectedDatabaseId]);

  const numericProperties = useMemo(() => {
    return properties.filter((prop) => prop.type === "number");
  }, [properties]);

  useEffect(() => {
    if (selectedDatabaseId) {
      setValue("xAxisFieldId", "");
      setValue("yAxisFieldId", "");
    }
  }, [selectedDatabaseId, setValue]);

  useEffect(() => {
    if (aggregation === "count") {
      setValue("yAxisFieldId", "");
    }
  }, [aggregation, setValue]);

  const onSubmit = (data: FormValues) => {
    const config: ChartConfig = {
      databaseId: data.databaseId,
      xAxisFieldId: data.xAxisFieldId,
      yAxisFieldId:
        data.aggregation === "count" ? undefined : data.yAxisFieldId,
      chartType: "line",
      aggregation: data.aggregation,
      sortOrder: data.sortOrder,
      accumulate: data.accumulate,
    };
    onConfigChange(config);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Configure Chart
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : String(error)}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" gap={1} mt={2}>
          <Controller
            name="databaseId"
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

          <Controller
            name="xAxisFieldId"
            control={control}
            rules={{ required: "X axis field is required" }}
            render={({ field }) => (
              <FormControl
                fullWidth
                disabled={!selectedDatabaseId || isLoading}
              >
                <InputLabel size="small">X Axis Field</InputLabel>
                <Select
                  {...field}
                  label="X Axis Field"
                  disabled={!selectedDatabaseId || isLoading}
                  size="small"
                >
                  {properties.length === 0 ? (
                    <MenuItem disabled>
                      {selectedDatabaseId
                        ? "No properties available"
                        : "Select a database first"}
                    </MenuItem>
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

          <Controller
            name="aggregation"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                disabled={!selectedDatabaseId || isLoading}
              >
                <InputLabel size="small">Aggregation</InputLabel>
                <Select
                  {...field}
                  label="Aggregation"
                  disabled={!selectedDatabaseId || isLoading}
                  size="small"
                >
                  <MenuItem value="count">Count</MenuItem>
                  <MenuItem value="sum">Sum</MenuItem>
                  <MenuItem value="avg">Average</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          {(aggregation === "sum" || aggregation === "avg") && (
            <Controller
              name="yAxisFieldId"
              control={control}
              rules={{
                required:
                  aggregation === "sum" || aggregation === "avg"
                    ? "Y axis field is required for sum/avg aggregation"
                    : false,
              }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={!selectedDatabaseId || isLoading}
                >
                  <InputLabel size="small">Y Axis Field (Numeric)</InputLabel>
                  <Select
                    {...field}
                    label="Y Axis Field (Numeric)"
                    disabled={!selectedDatabaseId || isLoading}
                    size="small"
                  >
                    {numericProperties.length === 0 ? (
                      <MenuItem disabled>
                        {selectedDatabaseId
                          ? "No numeric properties available"
                          : "Select a database first"}
                      </MenuItem>
                    ) : (
                      numericProperties.map((prop) => (
                        <MenuItem key={prop.id} value={prop.id}>
                          {prop.name} ({prop.type})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
            />
          )}

          <Controller
            name="sortOrder"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                disabled={!selectedDatabaseId || isLoading}
              >
                <InputLabel size="small">Sort Order</InputLabel>
                <Select
                  {...field}
                  label="Sort Order"
                  disabled={!selectedDatabaseId || isLoading}
                  size="small"
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="accumulate"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value}
                    disabled={!selectedDatabaseId || isLoading}
                  />
                }
                label="Accumulate values (cumulative sum)"
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!isValid}
            size="small"
            sx={{ alignSelf: "flex-end" }}
          >
            Apply Configuration
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
