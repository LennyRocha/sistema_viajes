"use client";
import dynamic from "next/dynamic";
import MainSkeleton from "../layout/MainSkeleton";
import { MainSkeletonVariants } from "../core/types/mainSkeletonVariants";

export function federatedComponent<
  T extends React.ComponentType<any>,
>(
  remote: string,
  exportName: string,
  skeletonVariant: MainSkeletonVariants = "table",
) {
  return dynamic(
    async () => {
      try {
        const { loadRemote } =
          await import("@module-federation/enhanced/runtime");

        const mod = await loadRemote<Record<string, T>>(remote);

        // 1. Validar que el módulo remoto se haya descargado
        if (!mod) {
          console.error(`[Federation] El remoto '${remote}' retornó null/undefined.`);
          return { default: () => <div>Error de conexión al cargar {remote}</div> };
        }

        // 2. Buscar la exportación solicitada, o hacer fallback al "default"
        const Component = mod[exportName] || mod.default;

        // 3. Si aún así no existe, imprimir qué exportaciones sí trajo el módulo para depurar
        if (!Component) {
          console.error(
            `[Federation] No se encontró '${exportName}' ni 'default' en '${remote}'. Las exportaciones disponibles son:`, 
            Object.keys(mod)
          );
          return { 
            default: () => <div>Error: Componente '{exportName}' no expuesto en {remote}</div> 
          };
        }

        return { default: Component };
        
      } catch (error) {
        console.error(`[Federation] Fallo catastrófico al cargar '${remote}':`, error);
        return { default: () => <div>Error crítico cargando módulo</div> };
      }
    },
    {
      ssr: false,
      loading: () => <MainSkeleton variant={skeletonVariant} />,
    },
  );
}