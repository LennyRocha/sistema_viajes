INSERT INTO "auth"."Rol" (
  "nombre",
  "descripcion",
  "estatus",
  "createdAt",
  "updatedAt"
)
VALUES (
  'ROLE_ADMIN',
  'Configura autobuses, rutas, conductores y viajes.',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("nombre") DO UPDATE SET
  "descripcion" = EXCLUDED."descripcion",
  "estatus" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "auth"."Usuario" (
  "nombres",
  "apellido_paterno",
  "apellido_materno",
  "curp",
  "fecha_nacimiento",
  "telefono",
  "email",
  "foto_perfil",
  "foto_base64",
  "contra",
  "createdAt",
  "updatedAt",
  "estatus"
)
VALUES (
  'Admin',
  'Nexoroute',
  'Sistema',
  'NEXA900101HDFRDN01',
  DATE '1990-01-01',
  '5550000000',
  'admin@nexoroute.local',
  'https://ui-avatars.com/api/?name=Admin+Nexoroute&background=0E5A84&color=fff',
  NULL,
  '$argon2id$v=19$m=65536,t=3,p=4$TDSoel1QR3XIZz9jOLkF1w$gOuJ/zkwPzkwAmABdJkB0VnHzicTHKiAKhTUucLrpjU',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  true
)
ON CONFLICT ("email") DO UPDATE SET
  "estatus" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "auth"."UserRole" ("userId", "roleId")
SELECT usuario."id", rol."id"
FROM "auth"."Usuario" AS usuario
CROSS JOIN "auth"."Rol" AS rol
WHERE usuario."email" = 'admin@nexoroute.local'
  AND rol."nombre" = 'ROLE_ADMIN'
ON CONFLICT ("userId", "roleId") DO NOTHING;
