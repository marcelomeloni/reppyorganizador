"use client";

import { useState } from "react";
import { Image, CircleNotch } from "@phosphor-icons/react";

type Props = {
  eventId: string;
  eventSlug?: string;
};

export default function EventFlyerButton({ eventId, eventSlug }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading || !eventId) return;
    setLoading(true);
    try {
      // Replace with your real apiService call:
      // const blob = await apiService.getBlob(`/manage/events/${eventId}/flyer`);
      await new Promise((r) => setTimeout(r, 1800)); // mock delay
      // const blob = new Blob([], { type: "image/jpeg" }); // mock
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = `Flyer-${eventSlug || eventId}.jpg`;
      // document.body.appendChild(a);
      // a.click();
      // setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    } catch (err) {
      console.error("Erro ao gerar flyer:", err);
      alert("Não foi possível gerar o flyer. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-[100px] text-sm font-bold text-[#0A0A0A] bg-[#F0F0EB] hover:bg-[#E0E0D8] border border-[#E0E0D8] transition-all disabled:opacity-50 disabled:cursor-wait"
      style={{ fontFamily: "var(--font-display,'DM Sans',sans-serif)" }}
    >
      {loading ? (
        <CircleNotch size={16} weight="bold" className="animate-spin" />
      ) : (
        <Image size={16} weight="bold" />
      )}
      {loading ? "Gerando..." : "Flyer"}
    </button>
  );
}