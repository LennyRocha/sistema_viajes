export default function useInstitucion() {
  const gatewayUrl =
    process.env.NEXT_PUBLIC_API_GATEWAY ??
    "http://localhost:5000";

  const getAll = async () => {
    const res = await fetch(
      `${gatewayUrl}/instituciones/public`,
    );
    const data = await res.json();
    if (!res.ok) {
      console.log("Error fetching instituciones:", data);
      throw new Error(
        data.message || "Error al obtener instituciones",
      );
    }
    return data;
  };

  return {
    getAll,
  };
}
