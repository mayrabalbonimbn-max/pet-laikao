import Link from "next/link";
import type { Route } from "next";
import { Instagram, MapPinned, MessageCircle, ShoppingBag } from "lucide-react";

import { siteConfig } from "@/config/site";
import { publicRoutes } from "@/lib/routes";

const navigationLinks = [
  { label: "Home", href: publicRoutes.home },
  { label: "Servicos", href: publicRoutes.services },
  { label: "Produtos", href: publicRoutes.products },
  { label: "Promocoes", href: publicRoutes.promotions },
  { label: "Contato", href: publicRoutes.contact }
];

const legalLinks = [
  { label: "Privacidade", href: publicRoutes.privacy },
  { label: "Termos", href: publicRoutes.terms },
  { label: "Trocas e devolucoes", href: publicRoutes.exchangesReturns },
  { label: "Agendamento", href: publicRoutes.schedulingPolicy }
];

export async function PublicFooter() {
  return (
    <footer className="bg-brand-900 text-white">
      <div className="content-container grid gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <p className="font-heading text-2xl font-extrabold text-white">{siteConfig.name}</p>
          <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-white/70">
            Loja, estetica animal, produtos, retirada e atendimento direto para cuidar melhor do seu pet.
          </p>
          <p className="mt-4 text-sm font-semibold text-[var(--sun-300)]">{siteConfig.address}</p>
        </div>

        <div>
          <p className="text-sm font-extrabold uppercase text-[var(--sun-300)]">Navegacao</p>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-white/70">
            {navigationLinks.map((item) => (
              <Link key={item.href} href={item.href as Route} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-extrabold uppercase text-[var(--sun-300)]">Canais</p>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-white/70">
            <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
              <MessageCircle className="h-4 w-4 text-success-500" />
              WhatsApp
            </a>
            <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
              <Instagram className="h-4 w-4 text-[var(--magenta-300)]" />
              Instagram
            </a>
            <a href={siteConfig.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
              <MapPinned className="h-4 w-4 text-[var(--sun-300)]" />
              Localizacao
            </a>
            <a href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
              <ShoppingBag className="h-4 w-4 text-[var(--sun-300)]" />
              iFood
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="content-container flex flex-col gap-3 py-5 text-xs font-semibold text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{siteConfig.name} - {siteConfig.hoursLabel}</p>
          <div className="flex flex-wrap gap-3">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href as Route} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
