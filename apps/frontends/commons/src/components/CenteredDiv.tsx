import React from "react";
import { Box } from "@mui/material";

type Props = {
  children?: React.ReactNode;
};

export default function CenteredDiv({
  children,
}: Readonly<Props>) {
  return (
    <Box
      sx={{
        display: "flex",
        margin: "auto",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </Box>
  );
}
