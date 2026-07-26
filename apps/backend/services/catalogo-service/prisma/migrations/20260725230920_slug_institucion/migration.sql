/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Institucion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Institucion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Institucion" ADD COLUMN     "slug" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Institucion_slug_key" ON "Institucion"("slug");
