# Instrucciones de uso de la librería

## 1. Cada vez que hagan cambios en la carpeta <code>commons</code> ejecuten el siguiente comando:

```bash
pnpm --filter @nexoroute/commons build
```

Eso actualizará la carpeta <code>dist</code> y estará lista.

## 2. Hecho eso, reinstalar todo desde la carpeta raíz

```bash
pnpm install
```

### NOTA: Todos los <code>package.json</code> de los microfronts ya cuentan con dicha carpeta como librería, en dado caso que no, para instalarla manualmente sigue estos pasos:

##

```bash
cd ../sistema_viajes/apps/frontends/nombre_microfront
```

```bash
pnpm add @nexoroute/common
```
