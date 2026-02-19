"use client";

import { useMemo, useEffect, useState } from "react";
import {
  useForm,
  Controller,
  FormProvider,
  useWatch,
  useFieldArray,
} from "react-hook-form";
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
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type {
  ChartConfig,
  DatabaseWithProperties,
  FilterCondition,
  SeriesConfig,
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

interface SeriesFormValues {
  aggregation: "count" | "sum" | "avg";
  yAxisFieldId: string;
}

interface FormValues {
  databaseId: string;
  xAxisFieldId: string;
  yAxisFieldId: string;
  chartType: "line" | "pie";
  aggregation: "count" | "sum" | "avg";
  sortOrder: "asc" | "desc";
  accumulate: boolean;
  filters: FilterCondition[];
  series: SeriesFormValues[];
}

function getInitialSeries(
  initialConfig?: ChartConfig
): SeriesFormValues[] {
  if (initialConfig?.series && initialConfig.series.length > 0) {
    return initialConfig.series.map((s) => ({
      aggregation: s.aggregation,
      yAxisFieldId: s.yAxisFieldId || "",
    }));
  }
  return [
    {
      aggregation: initialConfig?.aggregation || "count",
      yAxisFieldId: initialConfig?.yAxisFieldId || "",
    },
  ];
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
      chartType: initialConfig?.chartType || "line",
      aggregation: initialConfig?.aggregation || "count",
      sortOrder: initialConfig?.sortOrder || "asc",
      accumulate: initialConfig?.accumulate || false,
      filters: initialConfig?.filters || [],
      series: getInitialSeries(initialConfig),
    },
    mode: "onBlur",
  });
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
    reset,
    watch,
    getValues,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "series",
  });

  useEffect(() => {
    if (initialConfig) {
      reset({
        databaseId: initialConfig.databaseId,
        xAxisFieldId: initialConfig.xAxisFieldId,
        yAxisFieldId: initialConfig.yAxisFieldId || "",
        chartType: initialConfig.chartType || "line",
        aggregation: initialConfig.aggregation,
        sortOrder: initialConfig.sortOrder || "asc",
        accumulate: initialConfig.accumulate || false,
        filters: initialConfig.filters || [],
        series: getInitialSeries(initialConfig),
      });
      if (initialConfig.filters !== filters) {
        setFilters(initialConfig.filters || []);
      }
    }
    // Only need to run when initialConfig changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const selectedDatabaseId = useWatch({ control, name: "databaseId" });
  const aggregation = useWatch({ control, name: "aggregation" });
  const chartType = useWatch({ control, name: "chartType" });
  const seriesValues = useWatch({ control, name: "series" });

  const properties = useMemo(() => {
    return (
      databases?.find((db) => db.id === selectedDatabaseId)?.properties || []
    );
  }, [databases, selectedDatabaseId]);

  const numericProperties = useMemo(() => {
    return properties.filter((prop) => prop.type === "number");
  }, [properties]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "databaseId" && databases) {
        const xAxisFieldId = getValues("xAxisFieldId");
        const currentDatabase = databases.find(
          (db) => db.id === value.databaseId
        );
        if (
          !currentDatabase?.properties?.find((prop) => prop.id === xAxisFieldId)
        ) {
          setValue("xAxisFieldId", "");
        }
        setValue("yAxisFieldId", "");
        // Reset series y-axis fields when database changes
        const currentSeries = getValues("series");
        currentSeries.forEach((_, index) => {
          setValue(`series.${index}.yAxisFieldId`, "");
        });
      } else if (name === "aggregation" && value.aggregation === "count") {
        setValue("yAxisFieldId", "");
      } else if (name === "chartType") {
        setValue("yAxisFieldId", "");
        setValue("aggregation", "count");
        setValue("sortOrder", "asc");
        setValue("accumulate", false);
        setFilters([]);
        // Reset series when chart type changes
        setValue("series", [{ aggregation: "count", yAxisFieldId: "" }]);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, databases]);

  const handleAddFilter = (condition: FilterCondition) => {
    setFilters([...filters, condition]);
    setShowFilterForm(false);
  };

  const handleDeleteFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    if (data.chartType === "line") {
      const seriesConfigs: SeriesConfig[] = data.series.map((s) => ({
        aggregation: s.aggregation,
        yAxisFieldId:
          s.aggregation === "count" ? undefined : s.yAxisFieldId || undefined,
      }));
      const firstSeries = seriesConfigs[0];
      const config: ChartConfig = {
        databaseId: data.databaseId,
        xAxisFieldId: data.xAxisFieldId,
        yAxisFieldId: firstSeries.yAxisFieldId,
        chartType: data.chartType,
        aggregation: firstSeries.aggregation,
        sortOrder: data.sortOrder,
        accumulate: data.accumulate,
        filters: filters.length > 0 ? filters : undefined,
        series: seriesConfigs,
      };
      onConfigChange(config);
    } else {
      const config: ChartConfig = {
        databaseId: data.databaseId,
        xAxisFieldId: data.xAxisFieldId,
        yAxisFieldId:
          data.aggregation === "count" ? undefined : data.yAxisFieldId,
        chartType: data.chartType,
        aggregation: data.aggregation,
        sortOrder: data.sortOrder,
        accumulate: data.accumulate,
        filters: filters.length > 0 ? filters : undefined,
      };
      onConfigChange(config);
    }
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

            <Controller
              name="chartType"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={!selectedDatabaseId || isLoading}
                >
                  <InputLabel size="small">Chart Type</InputLabel>
                  <Select
                    {...field}
                    label="Chart Type"
                    disabled={!selectedDatabaseId || isLoading}
                    size="small"
                  >
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="pie">Pie Chart</MenuItem>
                  </Select>
                </FormControl>
              )}
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

            {chartType === "line" ? (
              <>
                <Divider />
                <Typography variant="subtitle2">Data Series</Typography>
                {fields.map((field, index) => (
                  <Stack
                    key={field.id}
                    direction="row"
                    gap={1}
                    alignItems="flex-start"
                  >
                    <Controller
                      name={`series.${index}.aggregation`}
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          sx={{ minWidth: 140 }}
                          disabled={!selectedDatabaseId || isLoading}
                        >
                          <InputLabel size="small">Aggregation</InputLabel>
                          <Select
                            {...field}
                            label="Aggregation"
                            size="small"
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value === "count") {
                                setValue(
                                  `series.${index}.yAxisFieldId`,
                                  ""
                                );
                              }
                            }}
                          >
                            <MenuItem value="count">Count</MenuItem>
                            <MenuItem value="sum">Sum</MenuItem>
                            <MenuItem value="avg">Average</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                    {(seriesValues?.[index]?.aggregation === "sum" ||
                      seriesValues?.[index]?.aggregation === "avg") && (
                      <PropertySelect
                        name={`series.${index}.yAxisFieldId`}
                        isLoading={isLoading}
                        disabled={!selectedDatabaseId}
                        required
                        properties={numericProperties}
                        label="Y Axis Field"
                        emptyWarningMessage="No numeric properties"
                      />
                    )}
                    {fields.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => remove(index)}
                        sx={{ mt: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    append({ aggregation: "count", yAxisFieldId: "" })
                  }
                  disabled={!selectedDatabaseId || isLoading}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Add Series
                </Button>
                <Divider />
              </>
            ) : (
              <>
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
              </>
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
                      disabled={
                        !selectedDatabaseId || isLoading || chartType === "pie"
                      }
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
