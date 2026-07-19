import { useTheme, Theme } from "@mui/material/styles";
import figlet from "figlet";
import chalk from "chalk";
import React from "react";

const PrintSaludo = () => {
  const theme = useTheme();
  React.useEffect(() => {
    //console.clear();
    banner(theme);
  }, []);
  return null;
};

export default PrintSaludo;

async function banner(theme: Theme) {
  let art;
  try {
    art = await figlet.text("NEXOROUTE", {
      font: "ANSI Shadow",
    });
  } catch {
    art = "NEXOROUTE";
  }
  console.log(chalk.hex(theme.palette.primary.main)(art));
  console.log(
    chalk.bold("  Sistema de viajes y autobuses\n"),
  );
}
