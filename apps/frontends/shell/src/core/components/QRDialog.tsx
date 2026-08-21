"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  IconButton,
  Link,
} from "@mui/material";
import { Close, Download } from "@mui/icons-material";
import { downloadQrCode } from "@/src/utils/QRCode";
export default function QrConfirmationDialog({
  open,
  onClose,
  codigo,
  qrDataUrl,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  codigo: string;
  qrDataUrl: string;
}>) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        ¡Compra confirmada!
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          pb: 4,
        }}
      >
        <Typography
          variant="body2"
          align="center"
          color="textSecondary"
        >
          Guarda este código QR, lo necesitarás para
          abordar. Si no se descargó automáticamente, usa el
          botón de abajo.
        </Typography>

        <Box
          component="img"
          src={qrDataUrl}
          alt={`QR de la compra ${codigo}`}
          sx={{
            width: 220,
            height: 220,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        />

        <Typography
          variant="subtitle1"
          sx={{ letterSpacing: 1, fontWeight: "bold" }}
        >
          {codigo}
        </Typography>

        <Link href={`/detalles-de-compra/${codigo}`} underline="hover">
          Ver compra
        </Link>

        <Button
          variant="contained"
          startIcon={<Download />}
          fullWidth
          onClick={() =>
            downloadQrCode(codigo, `boleto-${codigo}.png`)
          }
        >
          Descargar QR
        </Button>
      </DialogContent>
    </Dialog>
  );
}
