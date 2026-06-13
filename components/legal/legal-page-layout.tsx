import Link from "next/link";
import type { Route } from "next";
import { ShieldCheck } from "lucide-react";

import { siteConfig } from "@/config/site";
import { LegalPage, legalPages } from "@/config/legal";

export function LegalPageLayout({ page }: { page: LegalPage }) {
  return (
    <div className="content-container py-10 sm:py-14">
      <section className="overflow-hidden rounded-[32px] border border-brand-100 bg-linear-to-br from-brand-200/90 via-white to-[#fff4fb] p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr] lg:items-end">
          <div className="space-y-4">
            <p className="eyebrow">{page.eyebrow}</p>
            <h1 className="page-title">{page.title}</h1>
            <p className="max-w-3xl text-base leading-7 text-stone-600">{page.description}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Atualizado em {page.updatedAt}</p>
          </div>

          <aside className="rounded-[var(--radius-lg)] border border-white/80 bg-white/88 p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-brand-100 text-brand-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Canais oficiais</p>
                <p className="mt-1 text-sm leading-6 text-stone-500">Use os canais abaixo para suporte, cobranca ou pedidos de privacidade.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-stone-600">
              {Object.values(siteConfig.channels).map((channel) => (
                <a key={channel.email} href={`mailto:${channel.email}`} className="hover:text-brand-700">
                  <span className="font-semibold text-ink-900">{channel.label}:</span> {channel.email}
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.34fr_1fr] lg:items-start">
        <nav className="surface-default sticky top-24 hidden border-brand-100 p-5 lg:block">
          <p className="text-sm font-semibold text-ink-900">Politicas</p>
          <div className="mt-3 grid gap-2 text-sm text-stone-500">
            {legalPages.map((item) => (
              <Link key={item.slug} href={`/${item.slug}` as Route} className={item.slug === page.slug ? "font-semibold text-brand-700" : "hover:text-brand-700"}>
                {item.title}
              </Link>
            ))}
            <Link href={"/preferencias-de-cookies" as Route} className="hover:text-brand-700">Preferencias de Cookies</Link>
          </div>
        </nav>

        <article className="space-y-4">
          {page.sections.map((section) => (
            <section key={section.title} className="surface-default border-brand-100/70 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <h2 className="font-heading text-xl font-semibold text-ink-900 sm:text-2xl">{section.title}</h2>
              {section.body ? <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">{section.body}</p> : null}
              {section.items ? (
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-stone-600 sm:text-base">
                  {section.items.map((item) => (
                    <li key={item} className="rounded-[16px] border border-brand-100/70 bg-brand-50/45 px-4 py-3">{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="rounded-[var(--radius-lg)] border border-[var(--sun-300)] bg-[var(--sun-100)]/78 p-5 text-sm leading-6 text-brand-950 shadow-[var(--shadow-soft)]">
            <p className="font-semibold">Aviso importante</p>
            <p className="mt-1">Este conteudo foi preparado para uma comunicacao clara com clientes no Brasil. Ele nao substitui uma revisao juridica formal para regras especificas do negocio.</p>
          </section>
        </article>
      </div>
    </div>
  );
}
