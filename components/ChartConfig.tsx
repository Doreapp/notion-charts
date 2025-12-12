"use client";

import { useState, useMemo } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Typography,
  Paper,
} from "@mui/material";
import type { ChartConfig, DatabaseWithProperties } from "@/types/notion";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

interface ChartConfigProps {
  onConfigChange: (config: ChartConfig) => void;
  initialConfig?: ChartConfig;
}

export default function ChartConfig({
  onConfigChange,
  initialConfig,
}: ChartConfigProps) {
  const { data, isLoading, error } = useSWR<{
    databases: DatabaseWithProperties[];
  }>("/api/databases", fetcher);
  const databases = useMemo(() => data?.databases, [data]);

  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>(
    initialConfig?.databaseId || ""
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    initialConfig?.fieldId || ""
  );

  const properties = useMemo(() => {
    return (
      databases?.find((db) => db.id === selectedDatabaseId)?.properties || []
    );
  }, [databases, selectedDatabaseId]);

  const handleDatabaseChange = (databaseId: string) => {
    setSelectedDatabaseId(databaseId);
    setSelectedFieldId("");
  };

  const handleFieldChange = (fieldId: string) => {
    setSelectedFieldId(fieldId);
  };

  const handleApply = () => {
    if (selectedDatabaseId && selectedFieldId) {
      const config: ChartConfig = {
        databaseId: selectedDatabaseId,
        fieldId: selectedFieldId,
        chartType: "line",
        aggregation: "count",
      };
      onConfigChange(config);
    }
  };

  const isConfigValid = selectedDatabaseId && selectedFieldId;

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Configure Chart
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <FormControl fullWidth disabled={isLoading}>
          <InputLabel size="small">Database</InputLabel>
          <Select
            value={isLoading ? "loading" : selectedDatabaseId}
            label="Database"
            onChange={(e) => handleDatabaseChange(e.target.value)}
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

        <FormControl fullWidth disabled={!selectedDatabaseId || isLoading}>
          <InputLabel size="small">Field</InputLabel>
          <Select
            value={selectedFieldId}
            label="Field"
            onChange={(e) => handleFieldChange(e.target.value)}
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

        <Button
          variant="contained"
          onClick={handleApply}
          disabled={!isConfigValid}
          size="small"
          sx={{ alignSelf: "flex-end" }}
        >
          Apply Configuration
        </Button>
      </Box>
    </Paper>
  );
}
