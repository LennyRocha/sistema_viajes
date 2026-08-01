-- CreateTable
CREATE TABLE "Reporte" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "fecha" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estatus" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);
