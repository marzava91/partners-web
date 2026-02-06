"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// (Opcional en dev)
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Evita reintentar 4xx (errores de request/permiso) y reintenta 5xx/Network
            retry: (failureCount, error: any) => {
              const status = error?.status ?? error?.response?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 1; // equivalente a retry: 1
            },

            refetchOnWindowFocus: false,
            refetchOnReconnect: true,

            staleTime: 30_000, // 30s fresh
            gcTime: 5 * 60_000, // 5 min en cache cuando ya no está en uso
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )} */}
    </QueryClientProvider>
  );
}