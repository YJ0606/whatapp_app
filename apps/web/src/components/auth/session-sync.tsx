"use client";

import { useEffect } from "react";
import { syncAuthCookieFromStorage } from "@/lib/auth";

/** Keeps middleware auth cookie in sync with localStorage after refresh */
export function SessionSync() {
  useEffect(() => {
    syncAuthCookieFromStorage();
  }, []);
  return null;
}
