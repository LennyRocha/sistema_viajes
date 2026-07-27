# Levantar backend

<h6>Versión 1.0.0</h6>

## ¡IMPORTANTE! Antes de continuar

### En la raíz del proyecto ejecutar

```bash
pnpm install
```

#### Esto instalrá las dependencias del workspace de pnpm

## Levantar todos los microservicios

<h3>I. Accede a la carpeta <code>dev-cli</code>de backend :</h3>

```bash
cd apps\backend\dev-cli
```

<h3>II. Agregar tu microservicio al <code>dev.mjs en el objeto SERVICES</code></h3>

```bash
//El gateway y el servicio de catalogo ya está disponible, pero los demás no (actualizar esto cuando agreguen los demás)

const SERVICES = {
    'gateway': {
        label: 'gateway — punto unico de entrada (:5000)',
        dir: 'gateway',
        command: 'pnpm',
        args: ['start:dev'],
        color: 'magenta',
        required: true,
    },
    'catalogo-service': {
        label: 'catalogo-service — API de catálogos (:5002)',
        dir: 'services/catalogo-service',
        command: 'pnpm',
        args: ['start:dev'],
        docker: true, // levanta Postgres + Redis antes de arrancar
        color: 'cyan',
    },
    //Agregar dependiendo:
    "x-service":{
        label: "Nombre que aparece en la consola al momento de elegir el servicio",
        dir: "services/x-service",
        command: 'pnpm',
        args: ['start:dev'],
        docker: true, // levanta Postgres + Redis antes de arrancar,
        color: "el que quieras, pero escribelo en inglés papito"
    }
};
```

<h3>III. Ejecutar</h3>

```bash
pnpm dev
```

<h3>IV. Seleccionar los microservicios que vas a levantar (el checkbox en verde indica que ese microfront se va a levantar), para no levantarlo, usa las flechas del teclado y presiona la barra espaciadora para seleccionar/deseleccionarla</h3>

<i><b>NOTA: </b>El gateway se ejecutará obligatoriamente</i>

<h3>V. Presionar<code>Enter</code> </h3>

<h3>VI. Opcionalmente puedes elegir hacer el build a la carpeta  <code>commons</code> , elige y/n</h3>

<h3>VII. Y ya, ya están levantados todos los microfronts</h3>

## Crear microservicio

Sigue el notion de Ulises:

<a href="https://florentine-bug-aec.notion.site/III-Microservicios-desde-cero-Tu-primer-microservicio-395a3d7d603a8067a809f6e81f138d0b#395a3d7d603a80f4b452eeb6637599a9">Crear el microservicio</a>

<a href="https://florentine-bug-aec.notion.site/III-Documentaci-n-de-API-395a3d7d603a80b1965df1e25b4dc78a">Agregar documentación Swagger</a>

## Archivos .env

### Para gateway

```bash
PORT=5000
AUTH_SERVICE_URL=http://localhost:5001
CATALOGO_SERVICE_URL=http://localhost:5002
OPERACIONES_SERVICE_URL=http://localhost:5003
DASHBOARD_SERVICE_URL=http://localhost:5004
```

### Para cada microservicio

```bash
DATABASE_URL="postgresql://postgres:root@localhost:5437/catalogos_db?schema=public"
REDIS_URL="redis://localhost:6379"
PORT=5002
```

Postgres se expone en el host por el puerto 5437 para no chocar con un Postgres
local. Dentro del contenedor sigue usando 5432.

Reemplaza PORT y el nombre de la base de datos según el microservicio

## Puertos de los microservicios por si acaso

<table border="1" style="border-collapse: collapse; width:100%">
 <thead>
   <tr>
     <th>Microservicio</th>
     <th>Puerto</th>
   </tr>
 </thead>
 <tbody>
    <tr>
     <td>gateway</td>
     <td>5000
</td>
   </tr>
   <tr>
     <td>auth-front</td>
     <td>5001
</td>
   </tr>
   <tr>
     <td>catalogos-front</td>
     <td>5002
</td>
   </tr>
      <tr>
     <td>dashboard-reportes-front</td>
     <td>5003
     </td>
   </tr>
   <tr>
     <td>operaciones-front</td>
     <td>5004
 </td>
   </tr>
 </tbody>
</table>

<i><b>NOTA:</b> Este README fue hecho a mano </i>
