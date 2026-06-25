"use client";

import React from "react";
import MotionPaper from "./MotionPaper";
import { Box, Divider, Typography } from "@mui/material";

interface PaperBlockProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  paperProps?: React.ComponentProps<typeof MotionPaper>;
}

export default function PaperBlock({
  children,
  title,
  subtitle,
}: Readonly<PaperBlockProps>) {
  return (
    <MotionPaper
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "12px",
        gap: "16px",
        flexDirection: "column",
        width: "100%",
        "@media (max-width: 640px)": {
          gap: "8px",
        },
      }}
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Box
        sx={{
          width: "100%",
        }}
      >
        {title && (
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
            {title}
          </Typography>
        )}
        {title && <Divider sx={{ width: "100%" }} />}
        {subtitle && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {children}
    </MotionPaper>
  );
}
