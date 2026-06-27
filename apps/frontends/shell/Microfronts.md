# Instrucciones de despliegue de microfront

## 1.Contenido de los microfronts

<table border="1" style="border-collapse: collapse; width:100%">
 <thead>
   <tr>
     <th>Microfront</th>
     <th>Contenido</th>
   </tr>
 </thead>
 <tbody>
   <tr>
     <td>auth-front</td>
     <td>Comparte sesión , JWT y gestión de cuentas - operan sobre el mismo contexto de identidad
</td>
   </tr>
   <tr>
     <td>catalogos-front</td>
     <td>Ambos son vistas de solo lectura / visualización de datos, sin lógica transaccional propia
</td>
   </tr>
      <tr>
     <td>dashboard-reportes-front</td>
     <td>Son módulos de administración de catálogos estáticos o semielaborados, sin lógica operativa compleja
     </td>
   </tr>
   <tr>
     <td>operaciones-front</td>
     <td>Son inseparables en la práctica: no puedes gestionar un viaje sin rutas ni paradas
 </td>
   </tr>
 </tbody>
</table>

## 2. Estructura de carpetas (opcional)

```shell
micrfront
└─ src
   └─ modulo_1
      ├─ pages
      ├─ components
      ├─ hooks
      ├─ repositories
      ├─ services
      ├─ types
      ├─ validations
      └─ constants
    └─ modulo_2
```

<i><b>NOTA:</b> No es obligatorio usar todas o usar esta estructura </i>

## 3. Module federation config

Este archivo se encarga
de exponer el microfront al shell, no se debe modificar su estructura salvo en el interior de <code>new NextFederationPlugin</code>:

<ul>
    <li>Exposes: Qué módulos exporta el microfront. Se recomienda exponer módulos mediante archivos index.ts en lugar de rutas directas a componentes.</li>
    <li>Remotes: Qué módulos importa el microfront <b>(El ejemplo está en el <code>module-federation-config.js</code> del shell)</b> </li>
</ul>

## 4. ¿Cómo expórto mis páginas?

Sigue estos pasos

<h3>I. Ten una carpeta <code>pages</code> en cada módulo (usuarios, autobuses etc.) del microfront</h3>

<h3>II. Ten archivo <code>index.ts</code> en cada carpeta <code>pages</code> donde exportaras tus páginas de la siguiente manera</h3>

```bash
export { default as EjmploPaginaUno } from "./EjemploUno";
export { default as EjmploPaginaDos } from "./EjemploDos";
export { default as EjmploPaginaTres } from "./EjemploTres";
...
```

<i><b>NOTA:</b> Esto funciona con cualquier carpeta en realidad</i>

<h3>III. Agrega el expose</h3>

```bash
    exposes: {
        "./ModUno": "./src/modulo_1/pages",
        "./ModDos": "./src/modulo_2/pages",
        "./ModTres": "./src/modulo_3/pages",
        ...
    },
...
```

<h3>IV. Si un microfront tiene cosas que otro microfront puede ocupar</h3>

Dentro de la carpeta <code>federation</code> del microfront, crea un <code>index.ts</code> donde exportes dichos componentes (parecido al index de pages)

```bash
export { default as Componentico } from "./components/Componentico";
...
```

Y agregalo al exposes como <i>exports</i>:

```bash
    exposes: {
        ...
        "./exports": "./src/federation/index",
    },
...
```

## 5. Ejecutar el microfront

Dentro de la carpeta del microfront, primero instalar todo

```bash
pnpm install
```

Y después ejecutarlo

```bash
pnpm dev
```

Dependiendo del <code>package.json</code> del microfront es el puerto donde se corre, debes ejecutar el microfront antes de trabajar en el shell

```bash
localhost:3002/
```

<i><b>NOTA:</b> En este documento <code>pages</code> se refiere a la carpeta de componentes expuestos del microfront al shell</i>

<h3>Para consumo vease Shell.md</h3>