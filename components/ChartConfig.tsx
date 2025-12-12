"use client";

import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Paper,
} from "@mui/material";
import type { Database, Property, ChartConfig } from "@/types/notion";

interface ChartConfigProps {
  onConfigChange: (config: ChartConfig) => void;
  initialConfig?: ChartConfig;
}

export default function ChartConfig({ onConfigChange, initialConfig }: ChartConfigProps) {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>(
    initialConfig?.databaseId || ""
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string>(initialConfig?.fieldId || "");
  const [loadingDatabases, setLoadingDatabases] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatabases();
  }, []);

  useEffect(() => {
    if (selectedDatabaseId) {
      fetchProperties(selectedDatabaseId);
    } else {
      setProperties([]);
      setSelectedFieldId("");
    }
  }, [selectedDatabaseId]);

  const fetchDatabases = async () => {
    try {
      setLoadingDatabases(true);
      setError(null);
      const response = await fetch("/api/databases");
      if (!response.ok) {
        throw new Error("Failed to fetch databases");
      }
      const data = await response.json();
      setDatabases(data.databases);
    } catch (err: any) {
      setError(err.message || "Failed to load databases");
    } finally {
      setLoadingDatabases(false);
    }
  };

  const fetchProperties = async (databaseId: string) => {
    try {
      setLoadingProperties(true);
      setError(null);
      const response = await fetch(`/api/databases/${databaseId}/properties`);
      if (!response.ok) {
        throw new Error("Failed to fetch database properties");
      }
      const data = await response.json();
      setProperties(data.properties);
    } catch (err: any) {
      setError(err.message || "Failed to load database properties");
    } finally {
      setLoadingProperties(false);
    }
  };

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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <FormControl fullWidth disabled={loadingDatabases}>
          <InputLabel>Database</InputLabel>
          <Select
            value={selectedDatabaseId}
            label="Database"
            onChange={(e) => handleDatabaseChange(e.target.value)}
            size="small"
          >
            {loadingDatabases ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading databases...
              </MenuItem>
            ) : (
              databases.map((db) => (
                <MenuItem key={db.id} value={db.id}>
                  {db.title}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!selectedDatabaseId || loadingProperties}>
          <InputLabel>Field</InputLabel>
          <Select
            value={selectedFieldId}
            label="Field"
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled={!selectedDatabaseId || loadingProperties}
            size="small"
          >
            {loadingProperties ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading properties...
              </MenuItem>
            ) : properties.length === 0 ? (
              <MenuItem disabled>
                {selectedDatabaseId ? "No properties available" : "Select a database first"}
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
