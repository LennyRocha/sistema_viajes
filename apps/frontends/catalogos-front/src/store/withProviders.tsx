// mfe-servicios/providers/withProviders.tsx
"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import type { ComponentType } from "react";

export function withProviders<P extends object>(
  Component: ComponentType<P>,
) {
  return function WrappedWithProviders(props: P) {
    return (
      <Provider store={store}>
        <Component {...props} />
      </Provider>
    );
  };
}
