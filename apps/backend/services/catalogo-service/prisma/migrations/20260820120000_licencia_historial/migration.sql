DROP INDEX IF EXISTS "Licencia_numero_licencia_key";

CREATE INDEX IF NOT EXISTS "Licencia_numero_licencia_idx" ON "Licencia"("numero_licencia");
CREATE INDEX IF NOT EXISTS "Licencia_conductor_id_vigente_idx" ON "Licencia"("conductor_id", "vigente");
