"use client";

import Link from "next/link";
import {
  BadgeDollarSign,
  BadgePercent,
  BellRing,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  PackageSearch,
  Rows3,
  Scissors,
  ShoppingBag,
  WalletCards,
  type LucideIcon
} from "lucide-react";
import { usePathname } from "next/navigation";

import { adminNavigation } from "@/config/admin";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  BadgeDollarSign,
  BadgePercent,
  BellRing,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  PackageSearch,
  Rows3,
  Scissors,
  ShoppingBag,
  WalletCards
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[292px] border-r border-white/10 bg-[#210839] text-white lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-brand-700 shadow-[0_14px_32px_rgba(0,0,0,0.22)]">
            <span className="font-heading text-lg font-bold">L</span>
          </span>
          <span>
            <span className="block font-heading text-lg font-semibold text-white">Laikão Admin</span>
            <span className="block text-xs font-medium text-white/55">Painel comercial</span>
          </span>
        </Link>
      </div>

      <div className="border-b border-white/10 px-5 py-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Hoje</p>
          <p className="mt-2 text-sm font-semibold text-white">Agenda, loja e pagamentos em uma rotina.</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-3/4 rounded-full bg-brand-300" />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto px-4 py-5">
        {adminNavigation.map((group) => (
          <div key={group.title} className="space-y-3">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              {group.title}
            </p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = iconMap[item.icon];

                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all",
                      active
                        ? "bg-white text-brand-900 shadow-[0_16px_34px_rgba(0,0,0,0.22)]"
                        : "text-white/68 hover:bg-white/[0.07] hover:text-white"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-xl transition-colors",
                        active ? "bg-brand-100 text-brand-700" : "bg-white/[0.06] text-white/55 group-hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-white/[0.06] px-4 py-3 text-xs leading-5 text-white/60">
          Base pronta para separar API, filas e automacoes sem mudar a rotina da operacao.
        </div>
      </div>
    </aside>
  );
}
