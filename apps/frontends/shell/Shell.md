# Instrucciones de uso del shell

<h6>Versión 3.0.0</h6>

## ¡IMPORTANTE! Antes de continuar

### Crea un archivo .env en la raíz del microfront que contenga las siguientes variables:

```bash
NEXT_PUBLIC_MF_CATALOGOS=http://localhost:3002/_next/static/chunks/remoteEntry.js
NEXT_PUBLIC_MF_OPERACIONES=http://localhost:3001/_next/static/chunks/remoteEntry.js
NEXT_PUBLIC_MF_AUTH=http://localhost:3003/_next/static/chunks/remoteEntry.js
NEXT_PUBLIC_MF_DASHBOARD=http://localhost:3004/_next/static/chunks/remoteEntry.js
```

## 1. Llamar componentes de los microfronts

Dentro de la carpeta <code>app</code> que será el router del proyecto, se debe crear un <code>page.tsx</code> que importé cada página de los microfrontends <b>(vease Microfronts.md) </b>

<h6>Ejemplo de llamado de componente</h6>

```bash
"use client";

import { federatedComponent } from "@/src/lib/loadRemote";
import MainLayout from '@/src/layout/MainLayout'

const PageEjemplo = federatedComponent(
  "nombre_microfront/NombreModule",
  "NombreDelComponenteExportadoRequerido",
);

export default function EjemploPage() {
  return (
        <MainLayout>
            <PageEjemplo />
        </MainLayout>
  );
}
```

Si llegase a requerir un parámetro de ruta:

```bash
"use client";

import { federatedComponent } from "@/src/lib/loadRemote";
import MainLayout from '@/src/layout/MainLayout'

const PageEjemplo = federatedComponent(
  "nombre_microfront/NombreModule",
  "NombreDelComponenteExportadoRequerido",
);

interface Props {
  params: {
    id: number;
  };
}

export default function EjemploPage({ params }:Props) {
  return (
        <MainLayout>
            <PageEjemplo id={params.id} />
        </MainLayout>
  );
}
```

En <code>app/services/page.tsx</code> se encuentra un ejemplo de uso

Cabe aclarar que para utilizar la navegación se debe utilizar el router del shell, pasando las funciones de su hook como props

```bash
import { useRouter } from "next/navigation";

const router = useRouter();
```

<i><b>NOTA:</b> Se debe iniciar el microfront antes </i>

## 2. Ejecutar el shell

```bash
pnpm dev
```
