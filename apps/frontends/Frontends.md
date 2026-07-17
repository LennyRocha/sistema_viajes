# Levantar microfrontends

<h6>Versión 1.0.0</h6>

## ¡IMPORTANTE! Antes de continuar

### 1- En la raíz del proyecto ejecutar

```bash
pnpm install
```

#### Esto instalrá las dependencias del workspace de pnpm

### 2- Conocer el funcionamiento de los módulos

#### Leer Shell.md, Commons.md y Microfronts.md ubicados en:

```bash
apps\frontends\shell\Shell.md
apps\frontends\shell\Microfronts.md
apps\frontends\commons\Commons.md
```

## Levantar todos los microfrontends

<h3>I. Accede a la carpeta <code>dev-cli</code>de frontends :</h3>

```bash
cd apps\frontends\dev-cli
```

<h3>II. Ejecutar</h3>

```bash
pnpm dev
```

<h3>III. Seleccionar los microfrontends que vas a levantar (el checkbox en verde indica que ese microfront se va a levantar), para no levantarlo, usa las flechas del teclado y presiona la barra espaciadora para seleccionar/deseleccionarla</h3>

<i><b>NOTA:</b>El shell se ejecutará obligatoriamente</i>

<h3>III. Presionar<code>Enter</code> </h3>

<h3>IV. Opcionalmente puedes elegir hacer el build a la carpeta  <code>commons</code> , elige y/n</h3>

<h3>V. Y ya, ya están levantados todos los microfronts</h3>

<i><b>NOTA:</b> Este README fue hecho a mano </i>