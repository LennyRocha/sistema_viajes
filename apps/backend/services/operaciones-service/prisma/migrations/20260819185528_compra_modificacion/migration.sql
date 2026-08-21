/*
  Warnings:

  - You are about to drop the column `rutaId` on the `Compra` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Compra" DROP CONSTRAINT "Compra_rutaId_fkey";

-- AlterTable
ALTER TABLE "Compra" DROP COLUMN "rutaId";
