"use client";

import { Menu, Bell, Search } from "lucide-react";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search conversations, orders…"
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1"
            aria-label="Search dashboard"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          aria-label="Notifications"
          onClick={() => {
            /* Placeholder – opens notifications panel when wired */
          }}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden />
        </button>

        <UserMenu />
      </div>
    </header>
  );
}
