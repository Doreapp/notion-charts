'use client';

import { Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import ChartWidget from '@/components/ChartWidget';
import './embed.css';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function LoadingFallback() {
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

export default function EmbedPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<LoadingFallback />}>
        <ChartWidget />
      </Suspense>
    </ThemeProvider>
  );
}

