/*
  Warnings:

  - You are about to drop the `DisponibiilidadServicio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DisponibiilidadServicio" DROP CONSTRAINT "DisponibiilidadServicio_institucion_id_fkey";

-- DropForeignKey
ALTER TABLE "DisponibiilidadServicio" DROP CONSTRAINT "DisponibiilidadServicio_servicio_id_fkey";

-- DropForeignKey
ALTER TABLE "DisponibiilidadServicio" DROP CONSTRAINT "DisponibiilidadServicio_tipo_autobus_id_fkey";

-- DropTable
DROP TABLE "DisponibiilidadServicio";

-- CreateTable
CREATE TABLE "DisponibilidadServicio" (
    "id" SERIAL NOT NULL,
    "tipo_autobus_id" INTEGER NOT NULL,
    "servicio_id" INTEGER NOT NULL,
    "institucion_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisponibilidadServicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DisponibilidadServicio_tipo_autobus_id_servicio_id_instituc_key" ON "DisponibilidadServicio"("tipo_autobus_id", "servicio_id", "institucion_id");

-- AddForeignKey
ALTER TABLE "DisponibilidadServicio" ADD CONSTRAINT "DisponibilidadServicio_tipo_autobus_id_fkey" FOREIGN KEY ("tipo_autobus_id") REFERENCES "TipoAutobus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisponibilidadServicio" ADD CONSTRAINT "DisponibilidadServicio_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisponibilidadServicio" ADD CONSTRAINT "DisponibilidadServicio_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "Institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
