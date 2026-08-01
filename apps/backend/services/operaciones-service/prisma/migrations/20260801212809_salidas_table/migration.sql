-- CreateEnum
CREATE TYPE "TipoSalida" AS ENUM ('UNICA', 'RECURRENTE', 'ESPECIAL');

-- CreateEnum
CREATE TYPE "EstadoSalida" AS ENUM ('PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Salida" (
    "id" SERIAL NOT NULL,
    "autobusId" INTEGER NOT NULL,
    "conductorId" INTEGER NOT NULL,
    "viajeBaseId" INTEGER NOT NULL,
    "horario_configuracion" JSONB NOT NULL,
    "tipoSalida" "TipoSalida" NOT NULL DEFAULT 'UNICA',
    "estadoSalida" "EstadoSalida" NOT NULL DEFAULT 'PROGRAMADO',
    "precios" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(50),
    "updatedBy" VARCHAR(50),
    "estatus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Salida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" SERIAL NOT NULL,
    "publicId" VARCHAR(100) NOT NULL,
    "salidaId" INTEGER NOT NULL,
    "compradorId" INTEGER NOT NULL,
    "pasajeros" INTEGER NOT NULL,
    "asientos" JSONB NOT NULL,
    "fechaCompra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(10,2) NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "metodoPagoId" INTEGER NOT NULL,
    "abordado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetodoPago" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "estatus" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetodoPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comprador" (
    "id" SERIAL NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellido_paterno" VARCHAR(100) NOT NULL,
    "apellido_materno" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(15) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comprador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Compra_publicId_key" ON "Compra"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Compra_codigo_key" ON "Compra"("codigo");

-- CreateIndex
CREATE INDEX "Compra_compradorId_salidaId_fechaCompra_idx" ON "Compra"("compradorId", "salidaId", "fechaCompra");

-- CreateIndex
CREATE UNIQUE INDEX "Compra_salidaId_compradorId_fechaCompra_key" ON "Compra"("salidaId", "compradorId", "fechaCompra");

-- CreateIndex
CREATE UNIQUE INDEX "MetodoPago_nombre_key" ON "MetodoPago"("nombre");

-- CreateIndex
CREATE INDEX "MetodoPago_nombre_idx" ON "MetodoPago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Comprador_telefono_key" ON "Comprador"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Comprador_email_key" ON "Comprador"("email");

-- CreateIndex
CREATE INDEX "Comprador_email_telefono_idx" ON "Comprador"("email", "telefono");

-- AddForeignKey
ALTER TABLE "Salida" ADD CONSTRAINT "Salida_viajeBaseId_fkey" FOREIGN KEY ("viajeBaseId") REFERENCES "ViajeBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "Comprador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_salidaId_fkey" FOREIGN KEY ("salidaId") REFERENCES "Salida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "MetodoPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
