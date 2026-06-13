import Link from "next/link";
import { Clock3, MessageCircle, Scissors, ShieldCheck, Sparkles, WashingMachine, Dog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { listPublicServices } from "@/domains/appointments/queries";
import { formatCurrency } from "@/lib/formatters";
import { publicRoutes } from "@/lib/routes";

const serviceIcons = [Sparkles, Scissors, WashingMachine, Dog, ShieldCheck];

export default async function ServicesPage() {
  const services = await listPublicServices();

  return (
    <div className="content-container py-10 sm:py-14">
      <section className="promo-frame">
        <div className="promo-panel">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="promo-badge">Estetica Animal</span>
              <span className="promo-badge-hot">Agenda online</span>
            </div>
            <h1 className="promo-title">
              Cuidado e carinho <span className="promo-word">que seu pet merece!</span>
            </h1>
            <p className="text-base font-semibold leading-7 text-brand-950">
              Banho, tosa, hidratacao, escovacao e corte de unhas com visual de campanha, mas operacao real integrada a agenda.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={publicRoutes.schedule} className="sm:min-w-[14rem]"><Button size="lg" fullWidth>Agendar agora</Button></Link>
              <a href="https://wa.me/5511980512871" target="_blank" rel="noreferrer" className="sm:min-w-[14rem]"><Button variant="secondary" size="lg" fullWidth>Falar no WhatsApp</Button></a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.length === 0 ? (
          <article className="surface-default border border-brand-100 bg-white p-5 shadow-[var(--shadow-soft)] md:col-span-2 xl:col-span-3">
            <p className="font-semibold text-ink-900">Sem servicos ativos no momento.</p>
            <p className="mt-1 text-sm text-stone-600">Ative os servicos no admin para exibir aqui.</p>
          </article>
        ) : null}
        {services.map((service, index) => {
          const Icon = serviceIcons[index % serviceIcons.length];

          return (
            <article key={service.slug} className="promo-card flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="promo-icon"><Icon className="h-5 w-5" /></div>
                <span className="rounded-full bg-[var(--sun-100)] px-3 py-1 text-xs font-extrabold uppercase text-brand-950">
                  {service.durationMinutes} min
                </span>
              </div>
              <h2 className="mt-4 font-heading text-2xl font-extrabold text-brand-900">{service.name}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{service.description}</p>

              <div className="mt-4 grid gap-2 rounded-[18px] border-2 border-brand-100 bg-[#fff9f2] p-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-stone-500">Preco</span><strong className="font-heading text-lg text-brand-700">{formatCurrency(service.priceCents / 100)}</strong></div>
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1.5 text-stone-500"><Clock3 className="h-4 w-4 text-brand-500" /> Duracao</span><strong className="text-ink-900">{service.durationMinutes} min</strong></div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Link href={`/servicos/${service.slug}`}><Button variant="secondary" fullWidth>Ver detalhes</Button></Link>
                <Link href={publicRoutes.schedule}><Button fullWidth>Agendar</Button></Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-10 rounded-[28px] bg-brand-900 p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sun-300)]">Agenda online</p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold text-white">Escolha o servico, veja horarios e reserve.</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={publicRoutes.schedule}><Button variant="secondary">Ir para agenda</Button></Link>
            <a href="https://wa.me/5511980512871" target="_blank" rel="noreferrer"><Button variant="secondary"><MessageCircle className="h-4 w-4" />WhatsApp</Button></a>
          </div>
        </div>
      </section>
    </div>
  );
}
