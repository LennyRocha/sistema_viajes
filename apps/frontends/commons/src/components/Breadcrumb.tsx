import React from "react";
import { Breadcrumbs } from "@mui/material";
import Link from "@mui/material/Link";

type Breads = {
  nombre: string;
  href: string;
};

interface BreadcrumbProps {
  rolActual: string;
  breads: Breads[];
}

export default function Breadcrumb({
  rolActual = "Rol actual",
  breads = [],
}: Readonly<BreadcrumbProps>) {
  return (
    <Breadcrumbs>
      <Link underline="hover" color="inherit" href="/">
        {rolActual}
      </Link>
      {breads.map((bread, index) => (
        <Link
          key={bread.nombre + index}
          href={bread.href}
          color="inherit"
          underline="hover"
        >
          {bread.nombre}
        </Link>
      ))}
    </Breadcrumbs>
  );
}
