INSERT INTO "auth"."Rol" (
  "nombre",
  "descripcion",
  "estatus",
  "createdAt",
  "updatedAt"
)
VALUES
  ('ROLE_ADMIN', 'Configura autobuses, rutas, conductores y viajes.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ROLE_OPERADOR', 'Abre viajes y gestiona salidas. Operaciones diarias.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ROLE_SUPERVISOR', 'Revisa disponibilidad y reportes.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ROLE_CONDUCTOR', 'Consulta viajes asignados.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ROLE_CLIENTE', 'Consulta viajes disponibles y gestiona sus compras.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
VALUES
  (
    'Operador',
    'Nexoroute',
    'Demo',
    'NEXO910202HDFPRR02',
    DATE '1991-02-02',
    '5550000001',
    'operador@nexoroute.local',
    'https://ui-avatars.com/api/?name=Operador+Nexoroute&background=0E5A84&color=fff',
    NULL,
    '$argon2id$v=19$m=65536,t=3,p=4$TDSoel1QR3XIZz9jOLkF1w$gOuJ/zkwPzkwAmABdJkB0VnHzicTHKiAKhTUucLrpjU',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    true
  ),
  (
    'Supervisor',
    'Nexoroute',
    'Demo',
    'NEXS920303HDFPRR03',
    DATE '1992-03-03',
    '5550000002',
    'supervisor@nexoroute.local',
    'https://ui-avatars.com/api/?name=Supervisor+Nexoroute&background=0E5A84&color=fff',
    NULL,
    '$argon2id$v=19$m=65536,t=3,p=4$TDSoel1QR3XIZz9jOLkF1w$gOuJ/zkwPzkwAmABdJkB0VnHzicTHKiAKhTUucLrpjU',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    true
  ),
  (
    'Conductor',
    'Nexoroute',
    'Demo',
    'NEXC930404HDFPRR04',
    DATE '1993-04-04',
    '5550000003',
    'conductor@nexoroute.local',
    'https://ui-avatars.com/api/?name=Conductor+Nexoroute&background=0E5A84&color=fff',
    NULL,
    '$argon2id$v=19$m=65536,t=3,p=4$TDSoel1QR3XIZz9jOLkF1w$gOuJ/zkwPzkwAmABdJkB0VnHzicTHKiAKhTUucLrpjU',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    true
  ),
  (
    'Cliente',
    'Nexoroute',
    'Demo',
    'NEXL940505HDFPRR05',
    DATE '1994-05-05',
    '5550000004',
    'cliente@nexoroute.local',
    'https://ui-avatars.com/api/?name=Cliente+Nexoroute&background=0E5A84&color=fff',
    NULL,
    '$argon2id$v=19$m=65536,t=3,p=4$TDSoel1QR3XIZz9jOLkF1w$gOuJ/zkwPzkwAmABdJkB0VnHzicTHKiAKhTUucLrpjU',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    true
  )
ON CONFLICT ("email") DO UPDATE SET
  "nombres" = EXCLUDED."nombres",
  "apellido_paterno" = EXCLUDED."apellido_paterno",
  "apellido_materno" = EXCLUDED."apellido_materno",
  "curp" = EXCLUDED."curp",
  "telefono" = EXCLUDED."telefono",
  "foto_perfil" = EXCLUDED."foto_perfil",
  "estatus" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "auth"."UserRole" ("userId", "roleId")
SELECT usuario."id", rol."id"
FROM (
  VALUES
    ('operador@nexoroute.local', 'ROLE_OPERADOR'),
    ('supervisor@nexoroute.local', 'ROLE_SUPERVISOR'),
    ('conductor@nexoroute.local', 'ROLE_CONDUCTOR'),
    ('cliente@nexoroute.local', 'ROLE_CLIENTE')
) AS demo("email", "rol")
JOIN "auth"."Usuario" AS usuario ON usuario."email" = demo."email"
JOIN "auth"."Rol" AS rol ON rol."nombre" = demo."rol"
ON CONFLICT ("userId", "roleId") DO NOTHING;
