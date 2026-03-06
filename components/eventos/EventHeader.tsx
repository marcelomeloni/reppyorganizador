"use client";

import { Bell, MagnifyingGlass, UserCircle, List, X } from "@phosphor-icons/react";

type EventHeaderProps = {
  eventName?: string;
  eventDate?: string;
  pageTitle: string;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
};

export default function EventHeader({
  eventName = "",
  eventDate = "",
  pageTitle,
  onMenuToggle,
  menuOpen,
}: EventHeaderProps) {
  return (
    <header className="h-14 bg-[#F7F7F2] border-b border-[#E0E0D8] flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-1 rounded-[10px] text-[#9A9A8F] hover:text-[#0A0A0A] hover:bg-[#E0E0D8] transition-all"
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
        </button>

        <div
          className="flex items-center gap-1.5 min-w-0"
          style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
        >
          <span className="hidden sm:block text-[#9A9A8F] text-sm truncate max-w-[140px]">
            {eventName}
          </span>
          <span className="hidden sm:block text-[#D0D0C8] text-sm">/</span>
          <span className="text-[#0A0A0A] text-sm font-semibold">{pageTitle}</span>
        </div>

        <span
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#1BFF11]/15 text-[#0A9A06] border border-[#1BFF11]/30"
          style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1BFF11] animate-pulse" />
          {eventDate}
        </span>
      </div>

  
    </header>
  );
}