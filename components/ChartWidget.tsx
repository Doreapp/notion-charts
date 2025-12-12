'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';

interface ChartConfig {
  databaseId?: string;
  chartType?: 'line' | 'bar' | 'pie';
  fieldMappings?: string;
}

export default function ChartWidget() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ChartConfig>({});

  useEffect(() => {
    const databaseId = searchParams.get('database_id');
    const chartType = searchParams.get('chart_type') as 'line' | 'bar' | 'pie' | null;
    const fieldMappings = searchParams.get('field_mappings');

    if (!databaseId) {
      setError('Missing required parameter: database_id');
      setLoading(false);
      return;
    }

    setConfig({
      databaseId,
      chartType: chartType || 'bar',
      fieldMappings: fieldMappings || undefined,
    });

    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          width: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 2,
          width: '100%',
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        p: 2,
        boxSizing: 'border-box',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Chart Widget
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Database ID: {config.databaseId}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Chart Type: {config.chartType}
      </Typography>
      {config.fieldMappings && (
        <Typography variant="body2" color="text.secondary">
          Field Mappings: {config.fieldMappings}
        </Typography>
      )}
      <Box
        sx={{
          mt: 3,
          p: 2,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        Chart will be rendered here
      </Box>
    </Box>
  );
}

