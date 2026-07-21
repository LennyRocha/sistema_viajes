export interface Router {
  back(): void;
  forward(): void;
  refresh(): void;
  push(href: string, options?: NavigateOptions): void;
  replace(href: string, options?: NavigateOptions): void;
  prefetch(href: string, options?: PrefetchOptions): void;
  experimental_gesturePush?(
    href: string,
    options?: NavigateOptions,
  ): void;
}

interface NavigateOptions {
  scroll?: boolean;
  transitionTypes?: string[];
}
interface PrefetchOptions {
  kind: PrefetchKind;
  onInvalidate?: () => void;
}

enum PrefetchKind {
  AUTO = "auto",
  FULL = "full",
}
