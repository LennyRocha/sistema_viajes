-- CreateTable
CREATE TABLE "ConfiguracionOperacion" (
    "id" SERIAL NOT NULL,
    "clave" VARCHAR(80) NOT NULL,
    "valor" JSONB NOT NULL,
    "descripcion" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionOperacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" VARCHAR(500),
    "origen" JSONB NOT NULL,
    "destino" JSONB NOT NULL,
    "paradas" JSONB NOT NULL,
    "waypoints" JSONB,
    "encodedPolyline" TEXT,
    "distanciaMetros" INTEGER,
    "duracionSegundos" INTEGER,
    "estatus" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(50),
    "updatedBy" VARCHAR(50),

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViajeBase" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" VARCHAR(500),
    "frecuencia" VARCHAR(80),
    "estatus" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(50),
    "updatedBy" VARCHAR(50),

    CONSTRAINT "ViajeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViajeBaseRuta" (
    "id" SERIAL NOT NULL,
    "viajeBaseId" INTEGER NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "conexion" JSONB,
    "conexionEncodedPolyline" TEXT,
    "distanciaConexionMetros" INTEGER,
    "requiereConexion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViajeBaseRuta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionOperacion_clave_key" ON "ConfiguracionOperacion"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "Ruta_nombre_key" ON "Ruta"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ViajeBase_nombre_key" ON "ViajeBase"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ViajeBaseRuta_viajeBaseId_orden_key" ON "ViajeBaseRuta"("viajeBaseId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "ViajeBaseRuta_viajeBaseId_rutaId_orden_key" ON "ViajeBaseRuta"("viajeBaseId", "rutaId", "orden");

-- AddForeignKey
ALTER TABLE "ViajeBaseRuta" ADD CONSTRAINT "ViajeBaseRuta_viajeBaseId_fkey" FOREIGN KEY ("viajeBaseId") REFERENCES "ViajeBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViajeBaseRuta" ADD CONSTRAINT "ViajeBaseRuta_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
