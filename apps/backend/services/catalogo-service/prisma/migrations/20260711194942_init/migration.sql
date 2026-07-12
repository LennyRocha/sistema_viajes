-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO');

-- CreateTable
CREATE TABLE "Autobus" (
    "id" SERIAL NOT NULL,
    "codigo_interno" VARCHAR(10) NOT NULL,
    "marca" VARCHAR(255) NOT NULL,
    "alias" VARCHAR(25) NOT NULL,
    "modelo" VARCHAR(255) NOT NULL,
    "ano" INTEGER NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "estado" "Estado" NOT NULL DEFAULT 'DISPONIBLE',
    "color" VARCHAR(25) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "asientos" JSONB NOT NULL,
    "institucion_id" INTEGER NOT NULL,
    "tipo_autobus_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(50),
    "updatedBy" VARCHAR(50),
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Autobus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoAutobus" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(100) NOT NULL,
    "linea" VARCHAR(10) NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoAutobus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "icono_nombre" VARCHAR(50) NOT NULL,
    "propiedades" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(50),
    "updatedBy" VARCHAR(50),
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institucion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(50),
    "updatedBy" VARCHAR(50),
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Institucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisponibiilidadServicio" (
    "id" SERIAL NOT NULL,
    "tipo_autobus_id" INTEGER NOT NULL,
    "servicio_id" INTEGER NOT NULL,
    "institucion_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisponibiilidadServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutobusServicio" (
    "id" SERIAL NOT NULL,
    "config_servicio" JSONB NOT NULL,
    "autobus_id" INTEGER NOT NULL,
    "servicio_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutobusServicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Autobus_codigo_interno_key" ON "Autobus"("codigo_interno");

-- CreateIndex
CREATE UNIQUE INDEX "Autobus_alias_key" ON "Autobus"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "TipoAutobus_nombre_key" ON "TipoAutobus"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_nombre_key" ON "Servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Institucion_nombre_key" ON "Institucion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "DisponibiilidadServicio_tipo_autobus_id_servicio_id_institu_key" ON "DisponibiilidadServicio"("tipo_autobus_id", "servicio_id", "institucion_id");

-- CreateIndex
CREATE UNIQUE INDEX "AutobusServicio_autobus_id_servicio_id_key" ON "AutobusServicio"("autobus_id", "servicio_id");

-- AddForeignKey
ALTER TABLE "Autobus" ADD CONSTRAINT "Autobus_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "Institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Autobus" ADD CONSTRAINT "Autobus_tipo_autobus_id_fkey" FOREIGN KEY ("tipo_autobus_id") REFERENCES "TipoAutobus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisponibiilidadServicio" ADD CONSTRAINT "DisponibiilidadServicio_tipo_autobus_id_fkey" FOREIGN KEY ("tipo_autobus_id") REFERENCES "TipoAutobus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisponibiilidadServicio" ADD CONSTRAINT "DisponibiilidadServicio_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisponibiilidadServicio" ADD CONSTRAINT "DisponibiilidadServicio_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "Institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutobusServicio" ADD CONSTRAINT "AutobusServicio_autobus_id_fkey" FOREIGN KEY ("autobus_id") REFERENCES "Autobus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutobusServicio" ADD CONSTRAINT "AutobusServicio_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
