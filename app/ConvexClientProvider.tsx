"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) return null;
    return new ConvexReactClient(url);
  }, []);

  if (!convex) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 p-6 text-center text-stone-100">
        <div>
          <p className="text-lg font-semibold">Chybí konfigurace aplikace</p>
          <p className="mt-2 text-sm text-stone-300">NEXT_PUBLIC_CONVEX_URL není nastavené.</p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
