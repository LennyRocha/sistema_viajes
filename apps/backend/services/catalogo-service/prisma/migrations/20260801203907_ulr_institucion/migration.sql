/*
  Warnings:

  - Added the required column `imagen_url` to the `Institucion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Institucion" ADD COLUMN     "imagen_url" VARCHAR(255) NOT NULL;
