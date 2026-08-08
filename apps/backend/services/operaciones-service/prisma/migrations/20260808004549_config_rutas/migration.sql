/*
  Warnings:

  - Added the required column `config_rutas` to the `ViajeBase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ViajeBase" ADD COLUMN     "config_rutas" JSONB NOT NULL;
