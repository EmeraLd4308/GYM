"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

export function ContentFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick((t) => t + 1);
  }, [pathname]);

  return (
    <div key={tick} className="animate-content-in">
      {children}
    </div>
  );
}
