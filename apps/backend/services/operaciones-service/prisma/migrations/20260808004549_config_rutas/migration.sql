/*
  Warnings:

  - Existing `ViajeBase` rows are initialized with an empty route config.

*/
-- AlterTable
ALTER TABLE "ViajeBase" ADD COLUMN "config_rutas" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "ViajeBase" ALTER COLUMN "config_rutas" DROP DEFAULT;
