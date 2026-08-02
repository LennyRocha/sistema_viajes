# Sistema de Viajes

Guia rapida para instalar dependencias y levantar el proyecto en local.

Este repositorio usa PNPM workspaces, microfrontends con Module Federation,
servicios NestJS y Docker para la base de datos/Redis del backend.

## 1. Requisitos

Instala o verifica:

- Node.js 20 o superior.
- PNPM.
- Docker Desktop, necesario para levantar Postgres y Redis del backend.

En Windows/PowerShell usa `pnpm.cmd` para evitar problemas de politicas de
ejecucion.

```powershell
node --version
pnpm.cmd --version
docker --version
docker compose version
```

Si no tienes PNPM:

```powershell
npm install -g pnpm
```

## 2. Instalar dependencias

Desde la raiz del workspace:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd install
```

Si PNPM pregunta por reconstruir o purgar `node_modules`, en Windows puedes
evitar el prompt con:

```powershell
pnpm.cmd install --config.confirmModulesPurge=false
```

Esto no es un paso especial del proyecto; solo evita una confirmacion
interactiva de PNPM cuando cambia el workspace.

## 3. Variables de entorno

No vi archivos `.env.example` en el proyecto. Por ahora crea estos archivos a
mano. No subas `.env`, `.env.local` ni API keys reales.

### Frontend

Todos los microfrontends que usan Module Federation necesitan
`NEXT_PRIVATE_LOCAL_WEBPACK=true`. Si falta, Next muestra este error:

```text
process.env.NEXT_PRIVATE_LOCAL_WEBPACK is not set to true
```

El shell tambien necesita saber en que puerto esta cada remote.

#### apps/frontends/shell/.env.local

```env
NEXT_PUBLIC_MF_AUTH=http://localhost:3001/_next/static/chunks/remoteEntry.js
NEXT_PUBLIC_MF_CATALOGOS=http://localhost:3002/_next/static/chunks/remoteEntry.js
NEXT_PUBLIC_MF_DASHBOARD=http://localhost:3003/_next/static/chunks/remoteEntry.js
NEXT_PUBLIC_MF_OPERACIONES=http://localhost:3004/_next/static/chunks/remoteEntry.js
```

Importante: si `AUTH` o `DASHBOARD` apuntan al puerto incorrecto, el shell puede
mostrar 404 o errores de Module Federation.

#### apps/frontends/auth-front/.env.local

```env
NEXT_PRIVATE_LOCAL_WEBPACK=true
```

#### apps/frontends/catalogos-front/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PRIVATE_LOCAL_WEBPACK=true
```

#### apps/frontends/dashboard-reportes-front/.env.local

```env
NEXT_PRIVATE_LOCAL_WEBPACK=true
```

#### apps/frontends/operaciones-front/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PRIVATE_LOCAL_WEBPACK=true
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
NEXT_PUBLIC_IMAGE_STORAGE_MODE=base64
```

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` se usa para el mapa de viajes. Debe ser una
key restringida en Google Cloud y no debe subirse al repo.

`NEXT_PUBLIC_IMAGE_STORAGE_MODE` es opcional. En local usa `base64` para que las
imagenes subidas de viajes se guarden directo en la base. En produccion puede
usarse `aws`/`aws-url`: el frontend mandara URL y no base64, dejando listo el
flujo para S3 u otro storage.

Para el modulo de rutas/viajes, la API key debe tener habilitadas estas APIs en
Google Cloud:

- Maps JavaScript API.
- Places API.
- Directions API.
- Geocoding API.

La imagen del viaje se sube manualmente desde la interfaz.

Resumen de puertos de frontend:

| App                      | Puerto | Variable/remote              |
| ------------------------ | -----: | ---------------------------- |
| shell                    |   3000 | App principal                |
| auth-front               |   3001 | `NEXT_PUBLIC_MF_AUTH`        |
| catalogos-front          |   3002 | `NEXT_PUBLIC_MF_CATALOGOS`   |
| dashboard-reportes-front |   3003 | `NEXT_PUBLIC_MF_DASHBOARD`   |
| operaciones-front        |   3004 | `NEXT_PUBLIC_MF_OPERACIONES` |

`NEXT_PUBLIC_API_URL` debe apuntar al gateway backend, no directo al
microservicio. En local es `http://localhost:5000`.

### Backend

### apps/backend/gateway/.env

```env
PORT=5000
AUTH_SERVICE_URL=http://localhost:5001
CATALOGO_SERVICE_URL=http://localhost:5002
OPERACIONES_SERVICE_URL=http://localhost:5003
DASHBOARD_SERVICE_URL=http://localhost:5004
```

### apps/backend/services/auth-service/.env

```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/catalogos_db?schema=auth&options=--search_path%3Dauth"
REDIS_URL="redis://localhost:6379"
PORT=5001
GATEWAY_URL="http://localhost:5000"
CATALOGO_SERVICE_URL="http://localhost:5002"
```

### apps/backend/services/catalogo-service/.env

```env
PORT=5002
DATABASE_URL="postgresql://postgres:root@localhost:5437/catalogos_db?schema=public"
REDIS_URL="redis://localhost:6379"
GATEWAY_URL="http://localhost:5000"
AUTH_SERVICE_URL="http://localhost:5001"
OPERACIONES_SERVICE_URL="http://localhost:5003"
```

### apps/backend/services/operaciones-service/.env

```env
PORT=5003
DATABASE_URL="postgresql://postgres:root@localhost:5437/catalogos_db?schema=operaciones&options=--search_path%3Doperaciones"
CATALOGO_SERVICE_URL="http://localhost:5002"
```

### apps/backend/services/record-service/.env

```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/catalogos_db?schema=dashboard&options=--search_path%3Ddashboard"
REDIS_URL="redis://localhost:6379"
PORT=5002
GATEWAY_URL="http://localhost:5000"
```

El modulo de Viajes usa `operaciones-service`. Si `gateway` esta prendido pero
`operaciones-service` no esta en `5003`, el frontend puede mostrar errores 504.

## 4. Levantar con CLI

Esta es la forma recomendada cuando quieres levantar varias cosas sin abrir una
terminal por cada app.

### 4.1 Backend con CLI

Abre Docker Desktop antes de ejecutar el CLI.

Antes de arrancar el CLI, prepara las librerias compartidas del backend y
Prisma:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd --dir apps\backend\commons build:all
```

Primera vez, o cuando cambie `schema.prisma`, genera Prisma Client:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\services\catalogo-service
.\node_modules\.bin\prisma.CMD generate
```

Despues ejecuta el CLI:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\dev-cli
pnpm.cmd dev
```

El CLI siempre levanta `gateway` y te deja elegir otros servicios. Si eliges
`catalogo-service`, tambien ejecuta `docker compose up -d` para Postgres y Redis.

Primera vez, o cuando cambien migraciones de Prisma, ejecuta en otra terminal:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\services\catalogo-service
.\node_modules\.bin\prisma.CMD migrate dev
.\node_modules\.bin\prisma.CMD db seed
```

URLs principales:

```text
Gateway:             http://localhost:5000
Catalogo service:    http://localhost:5002
Operaciones service: http://localhost:5003
Docs catalogos:      http://localhost:5002/docs
Docs operaciones:    http://localhost:5003/docs
```

Para apagar los procesos Node del CLI, presiona `Ctrl+C` en la terminal del CLI.

Docker queda levantado porque el CLI usa `docker compose up -d`. Para apagar
Postgres y Redis:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\services\catalogo-service
docker compose down
```

Si ya habias levantado Docker cuando Postgres usaba el puerto `5432` del host,
apaga y vuelve a crear los contenedores para aplicar el cambio a `5437`:

```powershell
docker compose down
docker compose up -d
```

### 4.2 Frontend con CLI

Primero compila `commons`, porque los frontends importan componentes desde su
carpeta `dist`.

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd --filter @nexoroute/commons build
```

alternativamente:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\frontends
pnpm.cmd build:commons
```

Despues abre el CLI:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\frontends\dev-cli
pnpm.cmd dev
```

El CLI siempre levanta `shell` y te deja elegir los microfrontends.

URLs:

```text
Shell:       http://localhost:3000
Auth:        http://localhost:3001
Catalogos:   http://localhost:3002
Dashboard:   http://localhost:3003
Operaciones: http://localhost:3004
```

Para apagar los frontends del CLI, presiona `Ctrl+C` en esa terminal.

## 5. Levantar individualmente

Usa esta forma cuando quieras ver logs separados o levantar solo una parte.

### 5.1 Backend individual

Primero prepara las librerias compartidas del backend:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd --dir apps\backend\commons build:all
```

Terminal 1, Docker para Postgres y Redis:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\services\catalogo-service
docker compose up -d
```

Primera vez o despues de cambios en Prisma:

```powershell
.\node_modules\.bin\prisma.CMD generate
.\node_modules\.bin\prisma.CMD migrate dev
.\node_modules\.bin\prisma.CMD db seed
```

Terminal 2, catalogo-service:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\services\catalogo-service
pnpm.cmd start:dev
```

Terminal 3, gateway:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\gateway
pnpm.cmd start:dev
```

Terminal 4, operaciones-service:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\services\operaciones-service
.\node_modules\.bin\prisma.CMD generate
.\node_modules\.bin\prisma.CMD migrate dev
pnpm.cmd start:dev
```

Para apagar Node usa `Ctrl+C` en cada terminal. Para apagar Docker:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\services\catalogo-service
docker compose down
```

### 5.2 Frontend individual

Primero:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd --filter @nexoroute/commons build
```

Luego abre una terminal por app:

```powershell
pnpm.cmd --filter @nexoroute/auth-front dev
pnpm.cmd --filter @nexoroute/catalogos-front dev
pnpm.cmd --filter @nexoroute/dashboard-reportes-front dev
pnpm.cmd --filter @nexoroute/operaciones-front dev
pnpm.cmd --filter @nexoroute/shell dev
```

Alternativamente puedes usar los siguientes comandos estando en <code>cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\frontends</code> en cada terminal:

```powershell
pnpm.cmd dev:shell
pnpm.cmd dev:catalogos
pnpm.cmd dev:dashboard
pnpm.cmd dev:operaciones
pnpm.cmd dev:auth
```

Orden recomendado:

1. Backend: Docker, `catalogo-service`, `gateway`.
2. Frontend: `commons build`.
3. Microfrontends que uses: auth/catalogos/dashboard/operaciones.
4. Shell al final.
5. Abrir `http://localhost:3000`.

## 6. Puertos

| Parte                    |       Puerto | Notas                               |
| ------------------------ | -----------: | ----------------------------------- |
| Shell                    |         3000 | Host de Module Federation           |
| Auth front               |         3001 | Remote `auth`                       |
| Catalogos front          |         3002 | Remote `catalogos`                  |
| Dashboard/reportes front |         3003 | Remote `dashboard-reportes`         |
| Operaciones front        |         3004 | Remote `operaciones`                |
| Gateway backend          |         5000 | URL que deberian usar los frontends |
| Catalogo service         |         5002 | API de catalogos                    |
| Operaciones service      |         5003 | API de rutas y viajes               |
| Postgres                 | 5437 -> 5432 | Docker: host 5437, contenedor 5432  |
| Redis                    |         6379 | Docker                              |

## 7. Builds

```powershell
pnpm.cmd --filter @nexoroute/commons build
pnpm.cmd --filter @nexoroute/auth-front build
pnpm.cmd --filter @nexoroute/catalogos-front build
pnpm.cmd --filter @nexoroute/dashboard-reportes-front build
pnpm.cmd --filter @nexoroute/operaciones-front build
pnpm.cmd --filter @nexoroute/shell build
```

Backend:

```powershell
pnpm.cmd --filter gateway build
pnpm.cmd --filter catalogo-service build
pnpm.cmd --filter operaciones-service build
```

## 8. Problemas comunes

### El shell da 404 al entrar a Viajes

Revisa que `operaciones-front` este levantado y que exista:

```text
http://localhost:3004/_next/static/chunks/remoteEntry.js
```

Tambien revisa `apps/frontends/shell/.env.local`:

```env
NEXT_PUBLIC_MF_OPERACIONES=http://localhost:3004/_next/static/chunks/remoteEntry.js
```

### Error RUNTIME-008 de Module Federation

Significa que el shell no pudo descargar el `remoteEntry.js`.

Checklist:

- El microfrontend esta corriendo.
- El puerto del `.env.local` del shell coincide con el puerto real.
- Abriste el remote directo en el navegador.
- Reiniciaste el shell despues de cambiar `.env.local`.

### Cambie commons y no se ve

Vuelve a compilar:

```powershell
pnpm.cmd --filter @nexoroute/commons build
```

Despues reinicia el frontend que lo usa.

### El backend no conecta a la base

Revisa que Docker este prendido:

```powershell
docker ps
```

Si no aparece Postgres/Redis:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\services\catalogo-service
docker compose up -d
```

### El gateway responde pero catalogos no

Revisa que `catalogo-service` tenga `PORT=5002` en su `.env`. Si no existe ese
archivo, el servicio puede caer al puerto default del codigo y el gateway no lo
va a encontrar.

### catalogo-service muestra errores de @commons o @prisma/client

Si salen errores como `Cannot find module '@commons/utils'`, `Module
'@prisma/client' has no exported member 'PrismaClient'` o `Property 'autobus'
does not exist on type 'PrismaService'`, faltan pasos de preparacion:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd --dir apps\backend\commons build:all

cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes\apps\backend\services\catalogo-service
.\node_modules\.bin\prisma.CMD generate
```

Despues reinicia el CLI o el `catalogo-service`.

### Google Maps no aparece

Revisa en `apps/frontends/operaciones-front/.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
```

Despues reinicia `operaciones-front`.

### La imagen del viaje

La imagen del viaje se sube manualmente desde el formulario. En local se guarda
como base64 si tienes:

```env
NEXT_PUBLIC_IMAGE_STORAGE_MODE=base64
```

### Viajes muestra HTTP 504

Significa que el gateway esta prendido, pero no puede llegar a
`operaciones-service`.

Revisa que este vivo:

```powershell
netstat -ano | findstr ":5003"
```

Si no aparece, levanta `operaciones-service` desde el CLI del backend o de forma
individual.
