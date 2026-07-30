ALTER TABLE "operaciones"."ViajeBase"
ADD COLUMN "duracionCalculadaMin" INTEGER,
ADD COLUMN "margenMin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "duracionTotalMin" INTEGER,
ADD COLUMN "imagenUrl" TEXT,
ADD COLUMN "imagenBase64" TEXT,
ADD COLUMN "imagenStorage" VARCHAR(20);
