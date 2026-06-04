"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      import("@/mocks/browser").then(({ worker }) => {
        worker.start({ onUnhandledRequest: "bypass" }).catch(() => undefined);
      });
    }
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
