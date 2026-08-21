import QRCode from "qrcode";

/**
 * Genera un QR (como data URL PNG) a partir de un valor de texto.
 */
export async function generateQrDataUrl(
  value: string,
): Promise<string> {
  return QRCode.toDataURL(value, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

/**
 * Genera el QR y dispara la descarga como archivo PNG.
 * Debe llamarse dentro de un gesto de usuario (click) para evitar
 * que el navegador bloquee la descarga.
 */
export async function downloadQrCode(
  value: string,
  filename: string = "boleto-qr.png",
): Promise<string> {
  const dataUrl = await generateQrDataUrl(value);

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  return dataUrl;
}
