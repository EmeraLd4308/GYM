"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useToast } from "@/components/ToastProvider";

export function LoginToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { error } = useToast();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const err = searchParams.get("err");
    if (!err?.trim()) return;
    done.current = true;
    const text = err.length > 400 ? `${err.slice(0, 400)}…` : err;
    error(text);
    router.replace("/", { scroll: false });
  }, [searchParams, router, error]);

  return null;
}
