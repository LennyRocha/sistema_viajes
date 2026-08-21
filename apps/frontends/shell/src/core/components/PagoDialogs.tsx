"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  IconButton,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { Close, ThumbUpAlt } from "@mui/icons-material";
import OXXO from "../../assets/oxxo.svg";
import BVVA from "../../assets/bbva.svg";
import Barcode from "react-barcode";
import Image from "next/image";

export const PagoDialog = ({
  open,
  onClose,
  codigo,
  metodoPagoId,
  onYaPague,
  pagoLoading,
  tiempoRestante,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  codigo: string;
  metodoPagoId: number;
  onYaPague: () => void;
  pagoLoading: boolean;
  tiempoRestante: any; // Date or string
}>) => {
  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      onClose={(_, reason) => {
        if (
          reason === "backdropClick" ||
          reason === "escapeKeyDown"
        )
          return;
        else {
          onClose();
        }
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        ¡Compra realizada!
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
        {metodoPagoId === 3 ? (
          <OXXOSummary codigo={codigo} monto={100} />
        ) : (
          <TransferenciaSummary
            codigo={codigo}
            monto={100}
          />
        )}

        <Typography
          variant="subtitle1"
          sx={{ letterSpacing: 1, fontWeight: "bold" }}
        >
          Tiempo restante para realizar el pago:{" "}
          {tiempoRestante}
        </Typography>

        <Button
          variant="contained"
          startIcon={<ThumbUpAlt />}
          fullWidth
          loading={pagoLoading}
          onClick={onYaPague}
        >
          Ya pagué
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export const PagoExpiradoDialog = ({
  open,
  onClose,
}: Readonly<{ open: boolean; onClose: () => void }>) => {
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
        ¡Compra cancelada!
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
        <DialogContentText>
          Se agotó el tiempo para realizar el pago. La
          compra ha sido cancelada y los asientos han sido
          liberados.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const OXXOSummary = ({
  codigo,
  monto,
}: Readonly<{ codigo: string; monto: number }>) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 1,
        width: "100%",
      }}
    >
      <Typography
        variant="body2"
        align="center"
        color="textSecondary"
      >
        Acude a cualquier tienda OXXO y proporciona el
        siguiente código de pago para completar tu
        transacción. El monto a pagar es de $
        {monto.toFixed(2)} MXN. Tienes 15 minutos para
        realizar el pago antes de que la compra sea
        cancelada automáticamente.
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="overline" align="center">
          Detalles del pago
        </Typography>
        <Image priority src={OXXO} alt="oxxo" width={50} />
      </Box>
      <Typography variant="caption">
        <b>Nombre de la organización:</b> Nexoroute <br />
        <b>Concepto:</b> Pago de servicios <br />
        <b>Referencia:</b> {codigo} <br />
      </Typography>
      <Barcode
        value={codigo}
        format="CODE128"
        displayValue
      />
    </Box>
  );
};

const TransferenciaSummary = ({
  codigo,
  monto,
}: Readonly<{ codigo: string; monto: number }>) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 1,
        width: "100%",
      }}
    >
      <Typography
        variant="body2"
        align="center"
        color="textSecondary"
      >
        Realiza una transferencia bancaria a la cuenta
        proporcionada y utiliza el siguiente código de
        referencia para completar tu transacción. El monto a
        pagar es de ${monto.toFixed(2)} MXN. Tienes 15
        minutos para realizar el pago antes de que la compra
        sea cancelada automáticamente.
      </Typography>
      <Typography variant="subtitle2">
        Pago por transferencia
      </Typography>
      <Image priority src={BVVA} alt="bbva" width={125} />
      <Typography variant="caption">
        <b>Títular:</b> Nexoroute S.A. de C.V. <br />
        <b>Banco:</b> BBVA <br />
        <b>Cuenta:</b> 1234567890 <br />
        <b>CLABE:</b> 012345678901234567 <br />
        <b>Referencia:</b>
        {codigo} <br />
      </Typography>
    </Box>
  );
};
