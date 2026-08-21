INSERT INTO "auth"."Rol" (
  "nombre",
  "descripcion",
  "estatus",
  "createdAt",
  "updatedAt"
)
VALUES (
  'ROLE_CLIENTE',
  'Consulta viajes disponibles y gestiona sus compras.',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("nombre") DO UPDATE SET
  "descripcion" = EXCLUDED."descripcion",
  "estatus" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

DO $$
DECLARE
  conductor_role_id INTEGER;
  client_role_id INTEGER;
  candidate_ids INTEGER[];
BEGIN
  IF to_regclass('public."Conductor"') IS NULL THEN
    RETURN;
  END IF;

  SELECT "id" INTO conductor_role_id
  FROM "auth"."Rol"
  WHERE "nombre" = 'ROLE_CONDUCTOR';

  SELECT "id" INTO client_role_id
  FROM "auth"."Rol"
  WHERE "nombre" = 'ROLE_CLIENTE';

  SELECT array_agg(user_role."userId") INTO candidate_ids
  FROM "auth"."UserRole" AS user_role
  WHERE user_role."roleId" = conductor_role_id
    AND NOT EXISTS (
      SELECT 1
      FROM "auth"."UserRole" AS other_role
      WHERE other_role."userId" = user_role."userId"
        AND other_role."roleId" <> conductor_role_id
    )
    AND NOT EXISTS (
      SELECT 1
      FROM "public"."Conductor" AS conductor
      WHERE conductor."usuario_id" = user_role."userId"
    );

  IF COALESCE(array_length(candidate_ids, 1), 0) = 0 THEN
    RETURN;
  END IF;

  DELETE FROM "auth"."UserRole"
  WHERE "roleId" = conductor_role_id
    AND "userId" = ANY(candidate_ids);

  INSERT INTO "auth"."UserRole" ("userId", "roleId")
  SELECT candidate_id, client_role_id
  FROM unnest(candidate_ids) AS candidate_id
  ON CONFLICT ("userId", "roleId") DO NOTHING;
END $$;
