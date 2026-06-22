import React from "react";
import MotionPaper from "./MotionPaper";
import { Divider, Typography } from "@mui/material";

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
      className={`flex flex-col items-start justify-center p-[12px] max-sm:flex-col max-sm:items-start gap-4 w-full`}
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="w-full">
        {title && (
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
            {title}
          </Typography>
        )}
        {title && <Divider className="w-full" />}
        {subtitle && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        )}
      </div>
      {children}
    </MotionPaper>
  );
}
