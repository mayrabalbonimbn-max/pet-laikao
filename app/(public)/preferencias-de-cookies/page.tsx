import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Cookie } from "lucide-react";

import { CookiePreferencesPanel } from "@/components/privacy/cookie-consent";

export const metadata: Metadata = {
  title: "Preferências de Cookies",
  description: "Escolha quais categorias de cookies opcionais o Pet Shop Laikão pode usar neste navegador."
};

export default function CookiePreferencesPage() {
  return (
    <div className="content-container py-10 sm:py-14">
      <section className="grid gap-6 rounded-[32px] border border-brand-100 bg-linear-to-br from-brand-200/90 via-white to-[#fff4fb] p-6 shadow-[var(--shadow-soft)] sm:p-8 lg:grid-cols-[1fr_0.42fr] lg:items-center">
        <div className="space-y-4">
          <p className="eyebrow">Cookies</p>
          <h1 className="page-title">Preferências de Cookies</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">
            Escolha como o site do Pet Shop Laikão pode usar cookies opcionais neste navegador. Cookies necessários continuam ativos para manter segurança, carrinho, agenda e navegação funcionando.
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-white/80 bg-white/88 p-5 shadow-[var(--shadow-soft)]">
          <Cookie className="h-6 w-6 text-brand-600" />
          <p className="mt-3 text-sm font-semibold text-ink-900">Base preparada para analytics e pixels</p>
          <p className="mt-2 text-sm leading-6 text-stone-500">As escolhas ficam salvas localmente e podem ser lidas por integracoes futuras antes de carregar ferramentas nao essenciais.</p>
          <Link href={"/cookies" as Route} className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-900">Ler Politica de Cookies</Link>
        </div>
      </section>

      <div className="mt-8">
        <CookiePreferencesPanel framed />
      </div>
    </div>
  );
}
