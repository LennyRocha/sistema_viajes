import CampoConfig from "../../servicios/types/CampoServicio";

export default interface AutobusServicio {
  id?: number;
  autobusId: number;
  servicioId: number;
  configuracion_servicio: CampoConfig;
  activo: boolean;
}
