import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MessageCircle, ShoppingBag } from "lucide-react";

import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet";
import { siteConfig } from "@/config/site";
import { publicRoutes } from "@/lib/routes";

const navItems = [
  { label: "Servicos", href: publicRoutes.services },
  { label: "Produtos", href: publicRoutes.products },
  { label: "Promocoes", href: publicRoutes.promotions },
  { label: "Contato", href: publicRoutes.contact }
];

export async function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur-md">
      <div className="content-container flex min-h-20 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-brand-900 bg-white">
            <Image src="/brand/logo-laikao-white.jpeg" alt="Logo Pet Shop Laikao" fill className="object-cover" />
          </div>
          <div>
            <p className="font-heading text-lg font-extrabold text-brand-900">Pet Shop Laikao</p>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--magenta-600)]">
              Loja e estetica animal
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-extrabold text-brand-900 hover:text-[var(--magenta-600)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-brand-200 bg-white px-4 text-sm font-extrabold text-brand-900 hover:border-brand-700">
            <MessageCircle className="h-4 w-4 text-success-500" />
            WhatsApp
          </a>
          <a href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--sun-300)] px-4 text-sm font-extrabold text-brand-950 hover:bg-[var(--sun-500)]">
            <ShoppingBag className="h-4 w-4" />
            iFood
          </a>
          <Link href={siteConfig.quickLinks.schedule.href} className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--magenta-600)] px-4 text-sm font-extrabold text-white hover:bg-[var(--magenta-500)]">
            <CalendarDays className="h-4 w-4" />
            Agendar
          </Link>
        </div>

        <div className="lg:hidden">
          <MobileNavSheet />
        </div>
      </div>
    </header>
  );
}
