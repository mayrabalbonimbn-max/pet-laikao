import { Clock3, Instagram, MapPinned, MessageCircle, Navigation, ShoppingBag } from "lucide-react";

import { FormPrivacyNotice } from "@/components/legal/form-privacy-notice";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function ContactPage() {
  return (
    <div className="content-container py-10 sm:py-14">
      <section className="promo-frame">
        <div className="promo-panel grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="promo-badge">Contato</span>
              <span className="promo-badge-hot">Pratico e direto</span>
            </div>
            <h1 className="promo-title">
              Estamos prontos para atender <span className="promo-word">voce e seu pet</span>
            </h1>
            <p className="text-base font-semibold leading-7 text-brand-950">Visite nossa loja, fale com a gente no WhatsApp, compre pelo iFood ou acompanhe novidades no Instagram.</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <article className="promo-card"><MessageCircle className="h-5 w-5 text-success-500" /><p className="mt-2 text-sm text-stone-500">WhatsApp</p><p className="font-extrabold text-brand-900">{siteConfig.whatsappNumber}</p></article>
              <article className="promo-card bg-[var(--magenta-100)]"><Instagram className="h-5 w-5 text-[var(--magenta-600)]" /><p className="mt-2 text-sm text-stone-500">Instagram</p><p className="font-extrabold text-brand-900">{siteConfig.instagramHandle}</p></article>
              <article className="promo-card sm:col-span-2"><MapPinned className="h-5 w-5 text-brand-600" /><p className="mt-2 text-sm text-stone-500">Endereco</p><p className="font-extrabold text-brand-900">{siteConfig.address}</p></article>
            </div>
          </div>

          <div className="promo-panel-white">
            <h2 className="font-heading text-3xl font-extrabold text-[var(--magenta-600)]">Quer agendar ou saber mais?</h2>
            <p className="mt-2 text-sm text-stone-600">Fale com a gente no WhatsApp.</p>
            <div className="mt-5 grid gap-3">
              <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer"><Button size="lg" fullWidth><MessageCircle className="h-4 w-4" />Falar no WhatsApp</Button></a>
              <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer"><Button variant="secondary" size="lg" fullWidth><Instagram className="h-4 w-4" />Abrir Instagram</Button></a>
              <a href={siteConfig.mapUrl} target="_blank" rel="noreferrer"><Button variant="secondary" size="lg" fullWidth><Navigation className="h-4 w-4" />Ver localizacao</Button></a>
              <a href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--sun-300)] bg-[var(--sun-100)]/85 px-4 py-3 text-sm font-semibold text-brand-900"><ShoppingBag className="h-4 w-4" />Pedir no iFood</a>
            </div>
            <div className="mt-5">
              <FormPrivacyNotice compact />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <article className="promo-frame">
          <div className="promo-panel-white">
          <h2 className="font-heading text-2xl font-extrabold text-brand-900">Horario e visita</h2>
          <div className="mt-4 grid gap-3">
            <div className="rounded-[16px] border-2 border-brand-100 p-4"><p className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-900"><Clock3 className="h-4 w-4 text-brand-600" />{siteConfig.hoursLabel}</p></div>
            <div className="rounded-[16px] border-2 border-brand-900 bg-[var(--sun-100)] p-4"><p className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-900"><MapPinned className="h-4 w-4 text-brand-600" />{siteConfig.address}</p></div>
          </div>
          </div>
        </article>

        <div className="overflow-hidden rounded-[28px] border-[5px] border-brand-900 bg-white shadow-[var(--shadow-soft)]">
          <div className="flex min-h-[19rem] flex-col items-center justify-center bg-[#fff9f2] p-8 text-center">
            <MapPinned className="h-9 w-9 text-brand-600" />
            <h2 className="mt-4 font-heading text-2xl font-extrabold text-brand-900">Mapa e chegada rapida</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-stone-600">A cliente abre rota em um toque e chega sem friccao.</p>
            <a href={siteConfig.mapUrl} target="_blank" rel="noreferrer" className="mt-5"><Button size="lg">Abrir no mapa</Button></a>
          </div>
        </div>
      </section>
    </div>
  );
}
