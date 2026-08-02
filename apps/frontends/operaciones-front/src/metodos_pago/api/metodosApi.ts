export const getMetodosPago = async () => {
  const res = await fetch("/api/metodos-pago");
  return res.json();
};

export const getMetodoPagoById = async (id: number) => {
  const res = await fetch(`/api/metodos-pago/${id}`);
  return res.json();
};
