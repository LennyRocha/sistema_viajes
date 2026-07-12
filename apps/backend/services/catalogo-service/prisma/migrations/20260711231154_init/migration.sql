/*
  Warnings:

  - You are about to drop the column `status` on the `Autobus` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Institucion` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Servicio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Autobus" DROP COLUMN "status",
ADD COLUMN     "estatus" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Institucion" DROP COLUMN "status",
ADD COLUMN     "estatus" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Servicio" DROP COLUMN "status",
ADD COLUMN     "estatus" BOOLEAN NOT NULL DEFAULT true;
