/*
  Warnings:

  - You are about to drop the column `metodoPagoId` on the `Compra` table. All the data in the column will be lost.
  - Existing `Salida` rows are initialized with an empty seat layout and zero capacity.

*/
-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "EstadoCompra" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- DropForeignKey
ALTER TABLE "Compra" DROP CONSTRAINT IF EXISTS "Compra_metodoPagoId_fkey";

-- AlterTable
ALTER TABLE "Compra" DROP COLUMN IF EXISTS "metodoPagoId",
ADD COLUMN IF NOT EXISTS "estado" "EstadoCompra" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN IF NOT EXISTS "expiraEn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Salida" ADD COLUMN IF NOT EXISTS "asientosLayout" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS "capacidadTotal" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Salida" ALTER COLUMN "asientosLayout" DROP DEFAULT;
ALTER TABLE "Salida" ALTER COLUMN "capacidadTotal" DROP DEFAULT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Pago" (
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
CREATE INDEX IF NOT EXISTS "Pago_compraId_estado_idx" ON "Pago"("compraId", "estado");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Compra_salidaId_estado_idx" ON "Compra"("salidaId", "estado");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Pago_compraId_fkey'
  ) THEN
    ALTER TABLE "Pago" ADD CONSTRAINT "Pago_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Pago_metodoPagoId_fkey'
  ) THEN
    ALTER TABLE "Pago" ADD CONSTRAINT "Pago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "MetodoPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
