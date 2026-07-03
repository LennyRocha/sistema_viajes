import { CommonPageProps } from "@nexoroute/commons";
import React from "react";

interface HistorialIndexProps extends CommonPageProps {}

export default function HistorialIndex({
  openSidebar,
  navigationFunction,
  userPrivileges = [],
}: Readonly<HistorialIndexProps>) {
  return <div>HistorialIndex</div>;
}
