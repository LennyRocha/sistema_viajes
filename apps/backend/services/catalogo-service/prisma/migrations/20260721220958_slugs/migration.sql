/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Autobus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Servicio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Autobus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Servicio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Autobus" ADD COLUMN     "slug" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "slug" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Autobus_slug_key" ON "Autobus"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_slug_key" ON "Servicio"("slug");
