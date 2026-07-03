export default interface  Licencias {
    id: number;
    numeroLicencia: string;
    fechaExpedicion: Date;
    fechaVencimiento: Date;
    telefono: string;
    estadoEmisor: string;
    imagenLicencia: string; // URL de la imagen (s3 no gente?)
}