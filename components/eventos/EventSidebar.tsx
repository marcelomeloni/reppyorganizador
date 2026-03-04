"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  ChartBar,
  Tag,
  X,
  FileText,
  Users,
  Megaphone,
  House,
  CaretLeft,
  QrCode,
  Link as LinkIcon,
} from "@phosphor-icons/react";
import { useOrganization } from "@/context/OrganizationContext";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

type Props = {
  open?: boolean;
  onClose?: () => void;
};

export default function EventSidebar({ open, onClose }: Props) {
  const params = useParams();
  const pathname = usePathname();
  const orgSlug = params["org-slug"] as string;
  const id = params["id"] as string;
  const { currentOrg } = useOrganization();

  const role = currentOrg?.role ?? "";
  const base = `/${orgSlug}/eventos/${id}`;

  // ── Nav por role ────────────────────────────────────────────────────────────
  const navGroups: NavGroup[] = (() => {
    if (role === "promoter") {
      return [
        {
          group: "Promoter",
          items: [
            {
              label: "Meu Link",
              href: `${base}/promoter`,
              icon: <LinkIcon size={18} weight="bold" />,
            },
          ],
        },
      ];
    }

    if (role === "checkin_staff") {
      return [
        {
          group: "Check-in",
          items: [
            {
              label: "Escanear",
              href: `${base}/checkin`,
              icon: <QrCode size={18} weight="bold" />,
            },
          ],
        },
      ];
    }

    // owner / admin — acesso completo
    return [
      {
        group: "Geral",
        items: [
          {
            label: "Visão Geral",
            href: `${base}`,
            icon: <House size={18} weight="bold" />,
          },
        ],
      },
      {
        group: "Financeiro",
        items: [
          {
            label: "Painel",
            href: `${base}/financeiro/painel`,
            icon: <ChartBar size={18} weight="bold" />,
          },
          {
            label: "Resumo",
            href: `${base}/financeiro/resumo`,
            icon: <FileText size={18} weight="bold" />,
          },
          {
            label: "Cupons",
            href: `${base}/financeiro/cupons`,
            icon: <Tag size={18} weight="bold" />,
          },
          {
            label: "Cancelamentos",
            href: `${base}/financeiro/cancelamentos`,
            icon: <X size={18} weight="bold" />,
          },
        ],
      },
      {
        group: "Participantes",
        items: [
          {
            label: "Lista",
            href: `${base}/participantes/lista`,
            icon: <Users size={18} weight="bold" />,
          },
          {
            label: "Comunicados",
            href: `${base}/participantes/comunicados`,
            icon: <Megaphone size={18} weight="bold" />,
          },
        ],
      },
    ];
  })();

  const isActive = (href: string) => {
    if (href === base) return pathname === base;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <aside className="w-[220px] h-full bg-[#F0F0EB] border-r border-[#E0E0D8] flex flex-col py-6 px-3 shrink-0">
      {/* Back to events */}
      <Link
        href={`/${orgSlug}/eventos`}
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2 mb-6 text-[#9A9A8F] hover:text-[#0A0A0A] transition-colors text-sm font-medium group"
        style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
      >
        <CaretLeft
          size={14}
          weight="bold"
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Eventos
      </Link>

      {/* Nav groups */}
      <nav className="flex flex-col gap-5 flex-1">
        {navGroups.map((group) => (
          <div key={group.group}>
            <p
              className="px-3 mb-1.5 text-[11px] font-bold tracking-widest uppercase text-[#9A9A8F]"
              style={{ fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}
            >
              {group.group}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-[#0A0A0A] text-[#F7F7F2]"
                          : "text-[#5C5C52] hover:text-[#0A0A0A] hover:bg-[#E0E0D8]"
                      }`}
                      style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)" }}
                    >
                      <span className={active ? "text-[#1BFF11]" : "text-[#9A9A8F]"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden md:flex h-full">{sidebarContent}</div>

      {/* Mobile: slide-in drawer + backdrop */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-[#0A0A0A]/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative z-50 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}