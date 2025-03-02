import { useHref, useNavigate, NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const queryClient = new QueryClient();

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        {children}
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
