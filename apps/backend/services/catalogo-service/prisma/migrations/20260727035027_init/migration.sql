-- CreateTable
CREATE TABLE "Conductor" (
    "id" SERIAL NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellido_paterno" VARCHAR(100) NOT NULL,
    "apellido_materno" VARCHAR(100) NOT NULL,
    "curp" VARCHAR(18) NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "telefono" VARCHAR(15) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "foto_perfil" VARCHAR(255) NOT NULL,
    "institucion_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(50),
    "updatedBy" VARCHAR(50),
    "estatus" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Conductor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licencia" (
    "id" SERIAL NOT NULL,
    "conductor_id" INTEGER NOT NULL,
    "numero_licencia" VARCHAR(30) NOT NULL,
    "categoria" VARCHAR(20) NOT NULL,
    "fecha_expedicion" DATE NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "estado_emisor" VARCHAR(100) NOT NULL,
    "imagen_licencia" VARCHAR(255) NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conductor_curp_key" ON "Conductor"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "Conductor_email_key" ON "Conductor"("email");

-- CreateIndex
CREATE INDEX "Conductor_institucion_id_idx" ON "Conductor"("institucion_id");

-- CreateIndex
CREATE UNIQUE INDEX "Licencia_numero_licencia_key" ON "Licencia"("numero_licencia");

-- CreateIndex
CREATE INDEX "Licencia_conductor_id_idx" ON "Licencia"("conductor_id");

-- AddForeignKey
ALTER TABLE "Conductor" ADD CONSTRAINT "Conductor_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "Institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licencia" ADD CONSTRAINT "Licencia_conductor_id_fkey" FOREIGN KEY ("conductor_id") REFERENCES "Conductor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
