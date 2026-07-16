/*
  Warnings:

  - Added the required column `descripcion` to the `Servicio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "descripcion" VARCHAR(500) NOT NULL;
