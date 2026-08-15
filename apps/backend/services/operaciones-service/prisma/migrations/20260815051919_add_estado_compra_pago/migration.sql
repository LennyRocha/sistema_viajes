/*
  Warnings:

  - You are about to drop the column `metodoPagoId` on the `Compra` table. All the data in the column will be lost.
  - Added the required column `asientosLayout` to the `Salida` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacidadTotal` to the `Salida` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoCompra" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO');

-- DropForeignKey
ALTER TABLE "Compra" DROP CONSTRAINT "Compra_metodoPagoId_fkey";

-- AlterTable
ALTER TABLE "Compra" DROP COLUMN "metodoPagoId",
ADD COLUMN     "estado" "EstadoCompra" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "expiraEn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Salida" ADD COLUMN     "asientosLayout" JSONB NOT NULL,
ADD COLUMN     "capacidadTotal" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "compraId" INTEGER NOT NULL,
    "metodoPagoId" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "referencia" VARCHAR(150),
    "respuesta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pago_compraId_estado_idx" ON "Pago"("compraId", "estado");

-- CreateIndex
CREATE INDEX "Compra_salidaId_estado_idx" ON "Compra"("salidaId", "estado");

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "MetodoPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
