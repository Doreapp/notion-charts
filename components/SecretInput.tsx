"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface SecretInputProps {
  onSecretStored?: () => void;
  authFailed?: boolean;
  nextUrl?: string;
}

export default function SecretInput({
  onSecretStored,
  authFailed,
  nextUrl,
}: SecretInputProps) {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!secret.trim()) {
      setError("Secret cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ secret: secret.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid or missing API secret");
      }

      if (onSecretStored) {
        onSecretStored();
      }

      const redirectUrl = nextUrl || "/config";
      router.push(redirectUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to authenticate. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        API Secret Required
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Please enter the API secret to access the chart data.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!error && authFailed && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Invalid or missing API secret
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
      >
        <TextField
          type={showSecret ? "text" : "password"}
          label="API Secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          fullWidth
          size="small"
          disabled={isSubmitting}
          autoFocus
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowSecret(!showSecret)}
                    edge="end"
                    disabled={isSubmitting}
                    size="small"
                  >
                    {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!secret.trim() || isSubmitting}
          size="small"
          sx={{ alignSelf: "flex-end" }}
        >
          Submit
        </Button>
      </Box>
    </Paper>
  );
}
