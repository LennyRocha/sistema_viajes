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
}

export default function PaperHeader({
  title,
  subtitle,
  iconname = "home",
  showButton = false,
  onButtonClick,
  leftIcon,
  buttonTitle,
  paperProps,
}: Readonly<PaperHeaderProps>) {
  return (
    <MotionPaper
      {...paperProps}
      className={`flex items-center ${showButton ? "justify-between" : "justify-start"} w-full p-[12px] max-sm:flex-col max-sm:items-start gap-4`}
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="flex items-center gap-4 justify-center w-auto">
        <Box
          component={"span"}
          sx={{
            backgroundColor: "primary.main",
            padding: "4px",
            borderRadius: "4px",
            color: "white",
          }}
        >
          <DynamicIcon
            name={iconname}
            size="xl"
            color="inherit"
          />
        </Box>
        <div className="flex flex-col items-start justify-center">
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: -1,
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
              }}
            >
              {subtitle}
            </Typography>
          )}
        </div>
      </div>
      {showButton && (
        <Button
          variant="contained"
          color="primary"
          onClick={onButtonClick}
          startIcon={leftIcon}
          size="medium"
          className="max-sm:w-full"
        >
          {buttonTitle || "Action"}
        </Button>
      )}
    </MotionPaper>
  );
}
