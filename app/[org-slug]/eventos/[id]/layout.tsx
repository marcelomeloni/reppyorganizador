"use client";

import { useState } from "react";
import EventSidebar from "@/components/eventos/EventSidebar";
import EventHeader from "@/components/eventos/EventHeader";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F7F2] overflow-hidden">
      {/* Desktop sidebar */}
      <EventSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <EventHeader
          pageTitle="Painel"
          onMenuToggle={() => setMenuOpen((v) => !v)}
          menuOpen={menuOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}