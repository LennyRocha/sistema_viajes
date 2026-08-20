//TODO:  Modificar según la nueva estructura de carpetas y archivos del proyecto
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const DrawerMenuHandlers = {
  onMiPerfilClick: () => {
    console.log("Mi Perfil clicked");
  },
  onAjustesClick: () => {
    console.log("Ajustes clicked");
  },
  onCerrarSesionClick: () => {
    const accessToken = localStorage.getItem("nexoroute.accessToken");
    const refreshToken = localStorage.getItem("nexoroute.refreshToken");

    void fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);

    localStorage.removeItem("nexoroute.accessToken");
    localStorage.removeItem("nexoroute.refreshToken");
    localStorage.removeItem("nexoroute.user");
    window.location.assign("/login");
  },
};

export default DrawerMenuHandlers;
