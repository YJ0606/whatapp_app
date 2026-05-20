"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export function UserMenu() {
  const { user, logout, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Account";
  const email = user?.email ?? "Sign in required";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-semibold">{initials}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{isLoading ? "Loading…" : displayName}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>
          <Link
            href="/dashboard/settings"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <Settings className="w-4 h-4 text-gray-400" />
            Settings
          </Link>
          <Link
            href="/dashboard/team"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <User className="w-4 h-4 text-gray-400" />
            Team
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
