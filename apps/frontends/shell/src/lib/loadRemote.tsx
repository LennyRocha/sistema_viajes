"use client";
import dynamic from "next/dynamic";
import MainSkeleton from "../layout/MainSkeleton";
import { MainSkeletonVariants } from "../core/types/mainSkeletonVariants";

let initialized = false;

export function federatedComponent<
  T extends React.ComponentType<any>,
>(
  remote: string,
  exportName: string,
  skeletonVariant: MainSkeletonVariants = "table",
) {
  return dynamic(
    async () => {
      const { loadRemote } =
        await import("@module-federation/enhanced/runtime");

      const mod =
        await loadRemote<Record<string, T>>(remote);
      return { default: mod![exportName] };
    },
    {
      ssr: false,
      loading: () => (
        <MainSkeleton variant={skeletonVariant} />
      ),
    },
  );
}
