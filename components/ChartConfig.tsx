"use client";

import { useMemo, useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
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
  Divider,
  CircularProgress,
} from "@mui/material";
import type {
  ChartConfig,
  DatabaseWithProperties,
  FilterCondition,
} from "@/types/notion";
import useSWR from "swr";
import { fetcher, UnauthorizedError } from "@/utils/fetcher";
import FilterChipList from "./FilterChipList";
import FilterConditionForm from "./config-form/FilterConditionForm";
import DatabaseSelect from "./config-form/DatabaseSelect";
import PropertySelect from "./config-form/PropertySelect";

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
  filters: FilterCondition[];
}

export default function ChartConfig({
  onConfigChange,
  initialConfig,
  onAuthError,
}: ChartConfigProps) {
  const [filters, setFilters] = useState<FilterCondition[]>(
    initialConfig?.filters || []
  );
  const [showFilterForm, setShowFilterForm] = useState(false);

  const { data, isLoading, error } = useSWR<{
    databases: DatabaseWithProperties[];
  }>("/api/databases", fetcher);
  const databases = useMemo(() => data?.databases, [data]);

  useEffect(() => {
    if (error instanceof UnauthorizedError && onAuthError) {
      onAuthError();
    }
  }, [error, onAuthError]);

  const methods = useForm<FormValues>({
    defaultValues: {
      databaseId: initialConfig?.databaseId || "",
      xAxisFieldId: initialConfig?.xAxisFieldId || "",
      yAxisFieldId: initialConfig?.yAxisFieldId || "",
      aggregation: initialConfig?.aggregation || "count",
      sortOrder: initialConfig?.sortOrder || "asc",
      accumulate: initialConfig?.accumulate || false,
      filters: initialConfig?.filters || [],
    },
    mode: "onChange",
  });
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
    reset,
  } = methods;

  useEffect(() => {
    if (initialConfig) {
      reset({
        databaseId: initialConfig.databaseId,
        xAxisFieldId: initialConfig.xAxisFieldId,
        yAxisFieldId: initialConfig.yAxisFieldId || "",
        aggregation: initialConfig.aggregation,
        sortOrder: initialConfig.sortOrder || "asc",
        accumulate: initialConfig.accumulate || false,
        filters: initialConfig.filters || [],
      });
      setFilters(initialConfig.filters || []);
    }
  }, [initialConfig]);

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
    if (selectedDatabaseId && databases) {
      if (
        !initialConfig?.xAxisFieldId ||
        !databases
          ?.find((db) => db.id === selectedDatabaseId)
          ?.properties?.find((prop) => prop.id === initialConfig.xAxisFieldId)
      ) {
        setValue("xAxisFieldId", "");
      }
      setValue("yAxisFieldId", "");
    }
  }, [selectedDatabaseId]);

  useEffect(() => {
    if (aggregation === "count") {
      setValue("yAxisFieldId", "");
    }
  }, [aggregation]);

  const handleAddFilter = (condition: FilterCondition) => {
    setFilters([...filters, condition]);
    setShowFilterForm(false);
  };

  const handleDeleteFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

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
      filters: filters.length > 0 ? filters : undefined,
    };
    onConfigChange(config);
  };

  if (!databases) {
    return (
      <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h6" gutterBottom>
          Loading databases...
        </Typography>
        <CircularProgress />
      </Paper>
    );
  }

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
        <FormProvider {...methods}>
          <Stack direction="column" gap={1} mt={2}>
            <DatabaseSelect
              name="databaseId"
              isLoading={isLoading}
              databases={databases ?? []}
            />

            <PropertySelect
              name="xAxisFieldId"
              isLoading={isLoading}
              disabled={!selectedDatabaseId}
              properties={properties}
              required
              label="X Axis Field"
              emptyWarningMessage={
                selectedDatabaseId
                  ? "No properties available"
                  : "Select a database first"
              }
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
              <PropertySelect
                name="yAxisFieldId"
                isLoading={isLoading}
                disabled={!selectedDatabaseId}
                required={aggregation === "sum" || aggregation === "avg"}
                properties={numericProperties}
                label="Y Axis Field (Numeric)"
                emptyWarningMessage={
                  selectedDatabaseId
                    ? "No numeric properties available"
                    : "Select a database first"
                }
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

            <Divider />

            <Stack direction="column">
              <Typography variant="subtitle2">Filters</Typography>
              <FilterChipList
                filters={filters}
                properties={properties}
                onDelete={handleDeleteFilter}
              />
              {!showFilterForm && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowFilterForm(true)}
                  disabled={!selectedDatabaseId || isLoading}
                >
                  Add Filter
                </Button>
              )}
              {showFilterForm && (
                <FilterConditionForm
                  properties={properties}
                  onAdd={handleAddFilter}
                  onCancel={() => setShowFilterForm(false)}
                />
              )}
            </Stack>

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
        </FormProvider>
      </form>
    </Paper>
  );
}
