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
  Menu,
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
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

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

export function AdminMobileNavSheet() {
  const pathname = usePathname();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary" size="icon" className="lg:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent side="left" className="bg-[#210839] text-white">
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="eyebrow">Laikão Admin</p>
            <h2 className="font-heading text-2xl font-semibold text-white">Navegação operacional</h2>
          </div>

          {adminNavigation.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">{group.title}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = iconMap[item.icon];

                  return (
                    <Link
                      key={item.href}
                      href={item.href as any}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors",
                        active ? "bg-white text-brand-900" : "text-white/75 hover:bg-white/[0.07] hover:text-white"
                      )}
                    >
                      <span className={cn("grid h-9 w-9 place-items-center rounded-xl", active ? "bg-brand-100" : "bg-white/[0.08]")}>
                        <Icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
