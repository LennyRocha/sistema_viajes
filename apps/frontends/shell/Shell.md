# Instrucciones de uso del shell

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

import dynamic from "next/dynamic";
import MainLayout from '@/src/layout/MainLayout'

const PageEjemplo = dynamic(
  () => import("nombre_microfront/NombreModule")
    .then((mod) => mod.PageEjemplo),
  {
    ssr: false,
  }
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

import dynamic from "next/dynamic";
import MainLayout from '@/src/layout/MainLayout'

const PageEjemplo = dynamic(
  () => import("nombre_microfront/NombreModule")
    .then((mod) => mod.PageEjemplo),
  {
    ssr: false,
  }
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

<i><b>NOTA:</b> Se debe iniciar el microfront antes </i>

## 2. Ejecutar el shell

```bash
pnpm dev
```
