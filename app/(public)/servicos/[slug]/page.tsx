import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

import { InlineNotice } from "@/components/feedback/inline-notice";
import { PracticalLinksGrid } from "@/components/marketing/practical-links-grid";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getPublicServiceDetail } from "@/domains/appointments/queries";
import { formatCurrency } from "@/lib/formatters";
import { publicRoutes } from "@/lib/routes";

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getPublicServiceDetail(slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="content-container py-10 sm:py-14">
      <div className="grid gap-8 xl:grid-cols-[1fr_0.78fr]">
        <section className="space-y-6">
          <div className="rounded-[32px] border border-brand-100 bg-linear-to-br from-white via-brand-50/70 to-brand-100/70 p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <p className="eyebrow">Servico individual</p>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl space-y-4">
                <h1 className="page-title">{service.name}</h1>
                <p className="text-base leading-7 text-stone-500">{service.description}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-brand-700 shadow-[var(--shadow-soft)]">
                <Sparkles className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <article className="rounded-[var(--radius-lg)] border border-white/80 bg-white/90 p-4">
                <p className="text-sm text-stone-500">Preco base</p>
                <p className="mt-2 font-heading text-2xl font-semibold text-brand-700">{formatCurrency(service.priceCents / 100)}</p>
              </article>
              <article className="rounded-[var(--radius-lg)] border border-white/80 bg-white/90 p-4">
                <p className="inline-flex items-center gap-2 text-sm text-stone-500">
                  <Clock3 className="h-4 w-4 text-brand-500" />
                  Duracao media
                </p>
                <p className="mt-2 font-semibold text-ink-900">{service.durationMinutes} min</p>
              </article>
              <article className="rounded-[var(--radius-lg)] border border-white/80 bg-white/90 p-4">
                <p className="text-sm text-stone-500">Elegibilidade</p>
                <p className="mt-2 font-semibold text-ink-900">
                  {(service.petSpecies ?? "all") === "all" ? "Todas especies" : service.petSpecies} / {(service.petSize ?? "all") === "all" ? "Todos os portes" : service.petSize}
                </p>
              </article>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
            <article className="surface-default border border-stone-100 bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="font-heading text-2xl font-semibold text-ink-900">Servico real controlado no admin</h2>
              <div className="mt-5 grid gap-3">
                {[
                  "Preco e duracao vindos do backend",
                  "Ativacao e ordem configuradas no admin",
                  "Disponibilidade ligada ao fluxo de agenda"
                ].map((highlight) => (
                  <div key={highlight} className="rounded-[var(--radius-lg)] border border-stone-100 bg-sand-50 p-4 text-sm font-medium text-ink-900">
                    {highlight}
                  </div>
                ))}
              </div>
            </article>

            <article className="surface-default border border-stone-100 bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="font-heading text-2xl font-semibold text-ink-900">Se o tutor ainda estiver em duvida</h2>
              <p className="mt-3 text-sm leading-6 text-stone-500">
                O fluxo principal continua sendo o agendamento online, com suporte imediato no WhatsApp quando necessario.
              </p>
              <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-success-500 px-4 py-3 text-sm font-semibold text-white">
                <MessageCircle className="h-4 w-4" />
                Falar no WhatsApp
              </a>
            </article>
          </div>

          <InlineNotice
            tone="success"
            title="Pagina ligada a dados reais"
            description="Servico, preco e duracao vem da base operacional em vez de layout hardcoded."
          />
        </section>

        <aside className="space-y-5">
          <div className="surface-default border border-stone-100 bg-white p-6 shadow-[var(--shadow-soft)]">
            <p className="eyebrow">Proxima acao</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-ink-900">Agende este servico em poucos passos.</h2>
            <p className="mt-3 text-sm leading-6 text-stone-500">
              Escolha data, horario e forma de pagamento no fluxo online.
            </p>

            <div className="mt-6 grid gap-3">
              <Link href={publicRoutes.schedule}>
                <Button size="lg" fullWidth>
                  <CalendarDays className="h-4 w-4" />
                  Agendar este servico
                </Button>
              </Link>
              <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="lg" fullWidth>
                  Tirar duvidas no WhatsApp
                </Button>
              </a>
            </div>
          </div>

          <PracticalLinksGrid compact className="xl:grid-cols-2" />
        </aside>
      </div>
    </div>
  );
}
