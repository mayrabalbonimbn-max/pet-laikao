"use client";

import Link from "next/link";
import { CalendarDays, Instagram, MapPinned, Menu, MessageCircle, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { siteConfig } from "@/config/site";
import { publicRoutes } from "@/lib/routes";

const items = [
  { label: "Home", href: publicRoutes.home },
  { label: "Serviços", href: publicRoutes.services },
  { label: "Agenda", href: publicRoutes.schedule },
  { label: "Produtos", href: publicRoutes.products },
  { label: "Promoções", href: publicRoutes.promotions },
  { label: "Contato", href: publicRoutes.contact },
  { label: "Carrinho", href: publicRoutes.cart }
];

const practicalLinks = [
  {
    label: "WhatsApp",
    href: siteConfig.whatsappUrl,
    icon: MessageCircle
  },
  {
    label: "Instagram",
    href: siteConfig.instagramUrl,
    icon: Instagram
  },
  {
    label: "Mapa",
    href: siteConfig.mapUrl,
    icon: MapPinned
  }
];

export function MobileNavSheet() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary" size="icon" className="lg:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent side="right" className="bg-[#fff9f2] p-0 text-ink-900">
        <div className="flex h-full flex-col">
          <div className="border-b-4 border-[var(--magenta-500)] bg-brand-900 px-6 py-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sun-300)]">Laikão</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold leading-tight text-white">Aqui tem tudo para o seu pet</h2>
            <p className="mt-2 text-sm leading-6 text-white/85">{siteConfig.addressLine}</p>
          </div>

          <div className="space-y-8 px-6 py-6">
            <nav className="flex flex-col gap-3">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[18px] border-2 border-brand-100 bg-white px-4 py-3 text-base font-extrabold text-brand-900 hover:border-brand-900 hover:bg-brand-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink-900">Contato e redes</p>
              <div className="grid gap-3">
                {practicalLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-[18px] border-2 border-brand-100 bg-white px-4 py-3 text-sm font-extrabold text-brand-900 hover:border-brand-900 hover:bg-brand-50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-brand-100 text-brand-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-stone-100 px-6 py-5">
            <div className="grid gap-3">
              <Link
                href={siteConfig.quickLinks.schedule.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-brand-900 bg-[var(--magenta-600)] px-5 text-base font-extrabold text-white"
              >
                <CalendarDays className="h-4 w-4" />
                Agendar agora
              </Link>
              <a href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-brand-900 bg-[var(--sun-300)] px-5 text-base font-extrabold text-brand-950">
                <ShoppingBag className="h-4 w-4" />
                Pedir no iFood
              </a>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
