"use client";

import React from "react";
import MotionPaper from "../components/MotionPaper";
import DynamicIcon from "../icons/DynamicIcon";
import { Box, Button, Typography } from "@mui/material";

interface PaperHeaderProps {
  title: string;
  subtitle?: string;
  iconname: string;
  showButton?: boolean;
  onButtonClick?: () => void;
  leftIcon?: React.ReactNode;
  buttonTitle?: string;
  paperProps?: React.ComponentProps<typeof MotionPaper>;
  isLoading?: boolean;
}

export default function PaperHeader({
  title,
  subtitle,
  iconname = "home",
  showButton = false,
  onButtonClick,
  leftIcon,
  buttonTitle,
  paperProps = {},
  isLoading = false,
}: Readonly<PaperHeaderProps>) {
  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <MotionPaper
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: showButton
            ? "space-between"
            : "flex-start",
          width: "100%",
          padding: "12px",
          gap: "16px",
          flexDirection: "row",
          "@media (max-width: 640px)": {
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "8px",
          },
          ...paperProps?.sx,
        }}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        {...paperProps}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            width: "auto",
          }}
        >
          <Box
            component={"span"}
            sx={{
              backgroundColor: "primary.main",
              padding: "4px",
              borderRadius: "4px",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DynamicIcon
              name={iconname}
              size="xl"
              color="inherit"
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
              }}
              className="font-headings"
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "semibold",
                  color: "text.secondary",
                  mt: 0,
                  lineHeight: 1.2,
                  "@media (max-width: 640px)": {
                    fontSize: "0.875rem",
                  },
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {showButton && (
          <Button
            variant="contained"
            color="primary"
            onClick={onButtonClick}
            startIcon={leftIcon}
            loading={isLoading}
            size="medium"
            sx={{
              "@media (max-width: 640px)": {
                width: "100%",
              },
            }}
          >
            {buttonTitle || "Action"}
          </Button>
        )}
      </MotionPaper>
    </Box>
  );
}
