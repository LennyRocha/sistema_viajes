/*
  Warnings:

  - Added the required column `contra` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "contra" VARCHAR(255) NOT NULL;
