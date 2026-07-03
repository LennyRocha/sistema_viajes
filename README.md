# Sistema de Viajes

Guia rapida para instalar dependencias y levantar el proyecto en local.

## 1. Requisitos

Necesitas:

- Node.js 20 o superior.
- PNPM.

En Windows/PowerShell se recomienda usar `pnpm.cmd` para evitar errores de politicas de ejecucion.

Verifica si ya tienes PNPM:

```powershell
pnpm.cmd --version
```

Si no existe, instala PNPM:

```powershell
npm install -g pnpm
```

Vuelve a verificar:

```powershell
pnpm.cmd --version
```

## 2. Instalar dependencias

Desde la raiz del proyecto:

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd install
```

## 3. Variables de entorno

### Shell

Crea o edita:

```text
apps/frontends/shell/.env.local
```

Contenido:

```env
NEXT_PUBLIC_MF_CATALOGOS=http://localhost:3002/_next/static/chunks/remoteEntry.js
NEXT_PUBLIC_MF_OPERACIONES=http://localhost:3004/_next/static/chunks/remoteEntry.js
NEXT_PUBLIC_MF_AUTH=http://localhost:3003/_next/static/chunks/remoteEntry.js
NEXT_PUBLIC_MF_DASHBOARD=http://localhost:3004/_next/static/chunks/remoteEntry.js
```

### Catalogos

Crea o edita:

```text
apps/frontends/catalogos-front/.env.local
```

Contenido:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PRIVATE_LOCAL_WEBPACK=true
```

### Operaciones

Crea o edita:

```text
apps/frontends/operaciones-front/.env.local
```

Contenido:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PRIVATE_LOCAL_WEBPACK=true
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
```

No subas tu API key real a Git.

## 4. Build de commons

Antes de levantar shell o microfrontends, compila `commons`:

```powershell
pnpm.cmd --filter @nexoroute/commons build
```

Repite este comando cada vez que cambies algo en:

```text
apps/frontends/commons/src
```

## 5. Levantar servicios

Abre una terminal por cada comando.

### Mock API

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd --filter @nexoroute/mock-api dev
```

URL:

```text
http://localhost:4000
```

### Catalogos

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd --filter @nexoroute/catalogos-front dev
```

URL:

```text
http://localhost:3002
```

Remote:

```text
http://localhost:3002/_next/static/chunks/remoteEntry.js
```

### Operaciones

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd --filter @nexoroute/operaciones-front dev
```

URL:

```text
http://localhost:3004
```

Remote:

```text
http://localhost:3004/_next/static/chunks/remoteEntry.js
```

### Shell

```powershell
cd C:\Users\Sistemas.DESKTOP-LNVDK55\Documents\9NO\Integradora\sistema_viajes
pnpm.cmd --filter @nexoroute/shell dev
```

URL principal:

```text
http://localhost:3000
```

## 6. Orden recomendado

1. Instalar dependencias:

```powershell
pnpm.cmd install
```

2. Compilar commons:

```powershell
pnpm.cmd --filter @nexoroute/commons build
```

3. Levantar API:

```powershell
pnpm.cmd --filter @nexoroute/mock-api dev
```

4. Levantar catalogos:

```powershell
pnpm.cmd --filter @nexoroute/catalogos-front dev
```

5. Levantar operaciones:

```powershell
pnpm.cmd --filter @nexoroute/operaciones-front dev
```

6. Levantar shell:

```powershell
pnpm.cmd --filter @nexoroute/shell dev
```

7. Abrir:

```text
http://localhost:3000
```

## 7. Builds

Build de shell:

```powershell
pnpm.cmd --filter @nexoroute/shell build
```

Build de catalogos:

```powershell
pnpm.cmd --filter @nexoroute/catalogos-front build
```

Build de operaciones:

```powershell
pnpm.cmd --filter @nexoroute/operaciones-front build
```

## 8. Problemas comunes

### PowerShell no deja correr pnpm

Usa:

```powershell
pnpm.cmd
```

en vez de:

```powershell
pnpm
```

### El shell no carga un modulo

Revisa que el microfrontend este levantado y que su remote abra:

```text
http://localhost:3002/_next/static/chunks/remoteEntry.js
http://localhost:3004/_next/static/chunks/remoteEntry.js
```

Si cambiaste `.env.local`, reinicia el servidor correspondiente.

### Cambie commons y no se refleja

Vuelve a compilar:

```powershell
pnpm.cmd --filter @nexoroute/commons build
```

Luego reinicia shell y los microfrontends que usen `commons`.
