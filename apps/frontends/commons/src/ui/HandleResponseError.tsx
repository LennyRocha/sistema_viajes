import { useEffect } from "react";
import { ApiErrorBody } from "../types/Api-Error";
import EmptyState from "./EmptyStateComponent";
import { EmptyStateImageKey } from "../types/EmptyStateImages";
import { Router } from "../types/NextRouterProps";

type FetchBaseQueryError =
  | { status: number; data: ApiErrorBody }
  | {
      status: "FETCH_ERROR";
      error: string;
      data?: undefined;
    }
  | {
      status: "PARSING_ERROR";
      originalStatus: number;
      data: string;
      error: string;
    }
  | {
      status: "TIMEOUT_ERROR";
      error: string;
      data?: undefined;
    };

type Props = {
  router: Router;
  error: FetchBaseQueryError;
  onRetry?: () => void;
  path?: string;
};

function isConnectionError(
  error: FetchBaseQueryError,
): error is Extract<
  FetchBaseQueryError,
  {
    status:
      | "FETCH_ERROR"
      | "TIMEOUT_ERROR"
      | "PARSING_ERROR";
  }
> {
  return (
    error.status === "FETCH_ERROR" ||
    error.status === "TIMEOUT_ERROR" ||
    error.status === "PARSING_ERROR"
  );
}

type ErrorConfig = {
  variant: EmptyStateImageKey;
  actionKind: "retry" | "back" | "none";
  actionLabel?: string;
};

const configPerStatusCode: Record<number, ErrorConfig> = {
  401: {
    variant: "access-denied",
    actionKind: "back",
    actionLabel: "Volver",
  },
  403: {
    variant: "forbidden",
    actionKind: "back",
    actionLabel: "Volver",
  },
  404: {
    variant: "no-data",
    actionKind: "back",
    actionLabel: "Volver",
  },
  405: { variant: "not-allowed", actionKind: "none" },
  409: {
    variant: "bad-request",
    actionKind: "retry",
    actionLabel: "Reintentar",
  },
  429: {
    variant: "service-unavailable",
    actionKind: "retry",
    actionLabel: "Reintentar",
  },
  500: {
    variant: "server-failed",
    actionKind: "retry",
    actionLabel: "Reintentar",
  },
  501: { variant: "not-implemented", actionKind: "none" },
  502: {
    variant: "network-error",
    actionKind: "retry",
    actionLabel: "Reintentar",
  },
  503: {
    variant: "service-unavailable",
    actionKind: "retry",
    actionLabel: "Reintentar",
  },
  504: {
    variant: "gateway-timeout",
    actionKind: "retry",
    actionLabel: "Reintentar",
  },
};

const defaultConfig: ErrorConfig = {
  variant: "error",
  actionKind: "none",
};

const HandleResponseError = ({
  router,
  error,
  onRetry,
  path,
}: Props) => {
  const isConnIssue = isConnectionError(error);

  useEffect(() => {
    if (isConnIssue) {
      router.replace("/500");
    }
  }, [isConnIssue, router]);

  if (isConnIssue) {
    return null;
  }

  const config =
    configPerStatusCode[error.status] ?? defaultConfig;

  const kindOrUndefined =
    config.actionKind === "back"
      ? {
          label: config.actionLabel ?? "Volver",
          onClick: () => router.back(),
        }
      : undefined;

  const action =
    config.actionKind === "retry" && onRetry
      ? {
          label: config.actionLabel ?? "Reintentar",
          onClick: onRetry,
        }
      : kindOrUndefined;

  return (
    <EmptyState
      variant={config.variant}
      title={error.data.message}
      action={action}
      fullHeight
    />
  );
};

export default HandleResponseError;
