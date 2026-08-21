import React from "react";

export const useCountdown = (expiraEn: string | null) => {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!expiraEn) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiraEn]);

  // Se calcula en CADA render, usando el expiraEn más reciente.
  // No depende de un estado que solo se actualiza vía efecto,
  // así que no hay "render fantasma" con valores viejos.
  const tiempoRestante = expiraEn
    ? Math.max(0, new Date(expiraEn).getTime() - now)
    : 0;

  const totalSegundos = Math.floor(tiempoRestante / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  return {
    formatted: `${String(minutos).padStart(2, "0")}:${String(
      segundos,
    ).padStart(2, "0")}`,
    expirado: !!expiraEn && tiempoRestante <= 0,
  };
};