"use client";
import dynamic from "next/dynamic";
import MainSkeleton from "../layout/MainSkeleton";
import { MainSkeletonVariants } from "../core/types/mainSkeletonVariants";

type FederationLoadErrorProps = {
  remote: string;
  exportName: string;
  detail?: string;
};

function getRemoteEntryUrl(remote: string) {
  const remoteName = remote.split("/")[0];

  if (remoteName === "operaciones") {
    return process.env.NEXT_PUBLIC_MF_OPERACIONES;
  }

  if (remoteName === "catalogos") {
    return process.env.NEXT_PUBLIC_MF_CATALOGOS;
  }

  if (remoteName === "auth") {
    return process.env.NEXT_PUBLIC_MF_AUTH;
  }

  if (remoteName === "dashboardReportes") {
    return process.env.NEXT_PUBLIC_MF_DASHBOARD_REPORTES;
  }

  return undefined;
}

function FederationLoadError({
  remote,
  exportName,
  detail,
}: FederationLoadErrorProps) {
  const remoteEntryUrl = getRemoteEntryUrl(remote);

  return (
    <section
      style={{
        border: "1px solid #fecaca",
        background: "#fef2f2",
        borderRadius: 12,
        color: "#7f1d1d",
        padding: 20,
      }}
    >
      <strong>No se pudo cargar el modulo remoto.</strong>
      <p style={{ margin: "8px 0 0" }}>
        Revisa que el microfrontend este levantado y que exponga{" "}
        <code>{exportName}</code> en <code>{remote}</code>.
      </p>
      {remoteEntryUrl ? (
        <p style={{ margin: "8px 0 0" }}>
          Remote entry esperado: <code>{remoteEntryUrl}</code>
        </p>
      ) : null}
      {detail ? (
        <p style={{ margin: "8px 0 0" }}>
          Detalle: <code>{detail}</code>
        </p>
      ) : null}
    </section>
  );
}

function getErrorDetail(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

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
          return {
            default: () => (
              <FederationLoadError
                remote={remote}
                exportName={exportName}
                detail="El remoto retorno una respuesta vacia."
              />
            ),
          };
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
            default: () => (
              <FederationLoadError
                remote={remote}
                exportName={exportName}
                detail={`Exportaciones disponibles: ${Object.keys(mod).join(", ") || "ninguna"}`}
              />
            ),
          };
        }

        return { default: Component };
        
      } catch (error) {
        console.error(`[Federation] Fallo catastrófico al cargar '${remote}':`, error);
        return {
          default: () => (
            <FederationLoadError
              remote={remote}
              exportName={exportName}
              detail={getErrorDetail(error)}
            />
          ),
        };
      }
    },
    {
      ssr: false,
      loading: () => <MainSkeleton variant={skeletonVariant} />,
    },
  );
}
