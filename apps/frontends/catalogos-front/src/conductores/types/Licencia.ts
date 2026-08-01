// types/Licencia.ts
export default interface Licencia {
  id: number;
  conductor_id: number;
  numero_licencia: string;
  categoria: string;
  fecha_expedicion: string; // ISO string
  fecha_vencimiento: string; // ISO string
  estado_emisor: string;
  imagen_licencia: string;
  vigente: boolean;
  createdAt: string;
  updatedAt: string;
}