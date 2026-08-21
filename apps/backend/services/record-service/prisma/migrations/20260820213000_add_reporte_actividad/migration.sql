CREATE TABLE "dashboard"."ActividadReporte" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evento" VARCHAR(60) NOT NULL,
    "categoria" VARCHAR(40) NOT NULL,
    "accion" VARCHAR(80) NOT NULL,
    "modulo" VARCHAR(60) NOT NULL,
    "resultado" VARCHAR(20) NOT NULL,
    "severidad" VARCHAR(20) NOT NULL,
    "usuarioId" INTEGER,
    "email" VARCHAR(150),
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ip" VARCHAR(64),
    "userAgent" VARCHAR(500),
    "metodo" VARCHAR(10),
    "ruta" VARCHAR(255),
    "recurso" VARCHAR(80),
    "recursoId" VARCHAR(100),
    "mensaje" VARCHAR(500),
    "detalles" JSONB,
    "requestId" VARCHAR(100),

    CONSTRAINT "ActividadReporte_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ActividadReporte_fecha_idx" ON "dashboard"."ActividadReporte"("fecha");
CREATE INDEX "ActividadReporte_usuarioId_idx" ON "dashboard"."ActividadReporte"("usuarioId");
CREATE INDEX "ActividadReporte_categoria_idx" ON "dashboard"."ActividadReporte"("categoria");
CREATE INDEX "ActividadReporte_resultado_idx" ON "dashboard"."ActividadReporte"("resultado");
CREATE INDEX "ActividadReporte_modulo_idx" ON "dashboard"."ActividadReporte"("modulo");
