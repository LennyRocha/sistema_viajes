import PropiedadesServicio from "./PropiedadesServicio";

export default interface ServicioExterno {
  id?: number;
  nombre: string;
  icono_nombre: string;
  estatus: boolean;
  propiedades: PropiedadesServicio;
}
