/*
  Warnings:

  - You are about to drop the column `apellido_materno` on the `Conductor` table. All the data in the column will be lost.
  - You are about to drop the column `apellido_paterno` on the `Conductor` table. All the data in the column will be lost.
  - You are about to drop the column `curp` on the `Conductor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Conductor` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_nacimiento` on the `Conductor` table. All the data in the column will be lost.
  - You are about to drop the column `foto_perfil` on the `Conductor` table. All the data in the column will be lost.
  - You are about to drop the column `nombres` on the `Conductor` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `Conductor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuario_id]` on the table `Conductor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuario_id` to the `Conductor` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Conductor_curp_key";

-- DropIndex
DROP INDEX "Conductor_email_key";

-- AlterTable
ALTER TABLE "Conductor" DROP COLUMN "apellido_materno",
DROP COLUMN "apellido_paterno",
DROP COLUMN "curp",
DROP COLUMN "email",
DROP COLUMN "fecha_nacimiento",
DROP COLUMN "foto_perfil",
DROP COLUMN "nombres",
DROP COLUMN "telefono",
ADD COLUMN     "usuario_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conductor_usuario_id_key" ON "Conductor"("usuario_id");
