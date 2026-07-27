import { Box, Button, Typography } from "@mui/material";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Error 404",
  description: "Página no encontrada",
};

const NotFound = () => {
  return (
    <Box
      sx={{
        width: "100dvw",
        height: "100dvh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        gap: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: { xs: "center", md: "flex-start" },
          justifyContent: "center",
          width: "100%",
          maxWidth: 500,
        }}
      >
        <Typography
          variant="h1"
          className="font-brand"
          sx={{
            fontSize: "150px",
          }}
        >
          404
        </Typography>
        <Typography variant="h5">
          Página no encontrada
        </Typography>
        <Typography
          variant="body2"
          sx={{ textAlign: { xs: "center", md: "left" } }}
        >
          Lo sentimos, la página que estás buscando no
          existe.
        </Typography>
        <Button variant="contained" size="small">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </Box>
      <Image
        src="/assets/errors/404.png"
        alt="404 Error"
        width={250}
        height={250}
        sizes="(max-width: 768px) 100vw, 25vw"
        style={{
          width: "100%",
          maxWidth: 275,
          height: "auto",
        }}
      />
    </Box>
  );
};

export default NotFound;
