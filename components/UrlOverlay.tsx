"use client";

import { Box, IconButton, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

interface UrlOverlayProps {
  isVisible: boolean;
  currentUrl: string;
  copied: boolean;
  onCopy: () => void;
}

export default function UrlOverlay({
  isVisible,
  currentUrl,
  copied,
  onCopy,
}: UrlOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: 8,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 1,
        backgroundColor: "rgba(31, 31, 31, 0.9)",
        padding: "6px 12px",
        borderRadius: "4px",
        border: "1px solid rgba(255, 255, 255, 0.09)",
        backdropFilter: "blur(8px)",
        cursor: "pointer",
        transition: "opacity 0.2s ease-in-out",
      }}
      onClick={onCopy}
    >
      <Typography
        variant="body2"
        sx={{
          color: "rgba(255, 255, 255, 0.85)",
          fontSize: "12px",
          fontFamily: "monospace",
          maxWidth: "400px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {currentUrl}
      </Typography>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        sx={{
          color: "rgba(255, 255, 255, 0.85)",
          padding: "4px",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        {copied ? (
          <CheckIcon sx={{ fontSize: "16px" }} />
        ) : (
          <ContentCopyIcon sx={{ fontSize: "16px" }} />
        )}
      </IconButton>
    </Box>
  );
}
