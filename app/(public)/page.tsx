import Link from "next/link";
import { BadgePercent, Bone, MessageCircle, Scissors, ShoppingBag, Sparkles, Truck, WashingMachine } from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { ContactBlock } from "@/components/marketing/contact-block";
import { HeroBanner } from "@/components/marketing/hero-banner";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { listPublicServices } from "@/domains/appointments/queries";
import { listCatalogProducts } from "@/domains/catalog/queries";
import { listHomeHighlightedPromotions } from "@/domains/promotions/queries";
import { publicRoutes } from "@/lib/routes";

const serviceIcons = [WashingMachine, Scissors, Sparkles, Bone, Sparkles];

export default async function HomePage() {
  const [featuredProducts, highlightedPromotions, services] = await Promise.all([
    listCatalogProducts().then((items) => items.slice(0, 3)),
    listHomeHighlightedPromotions(),
    listPublicServices()
  ]);

  const mainPromotion = highlightedPromotions[0] ?? null;

  return (
    <div className="bg-transparent">
      <HeroBanner />

      <section className="content-container py-12">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <p className="promo-badge">Estetica Animal</p>
            <h2 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-brand-900 sm:text-5xl">
              Banho, tosa e cuidado com visual de campanha, sem bagunca.
            </h2>
            <p className="mt-4 text-base font-semibold leading-7 text-stone-600">
              Um bloco forte para o servico mais importante: explica o cuidado, mostra os servicos e leva para a agenda.
            </p>
            <Link href={publicRoutes.schedule} className="mt-6 inline-flex">
              <Button size="lg">Agendar horario</Button>
            </Link>
          </div>

          <div className="rounded-[32px] border-[4px] border-brand-900 bg-[#fff9f2] p-5 shadow-[0_18px_46px_rgba(43,14,70,0.16)] sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {["Banho", "Tosa", "Hidratacao", "Escovacao", "Corte de unhas"].map((label, index) => {
                const Icon = serviceIcons[index % serviceIcons.length];
                return (
                  <article key={label} className="rounded-[22px] bg-white p-4 shadow-[inset_0_0_0_2px_rgba(104,23,181,0.12)]">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-900 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 font-heading text-xl font-extrabold text-brand-900">{label}</h3>
                    <p className="mt-1 text-sm leading-6 text-stone-600">Cuidado, higiene e carinho para seu pet se sentir bem.</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-900 py-12 text-white">
        <div className="content-container">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-[var(--sun-300)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-950">
                Produtos
              </p>
              <h2 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Aqui tem tudo para o seu pet.
              </h2>
            </div>
            <Link href={publicRoutes.products}>
              <Button variant="secondary">Abrir loja</Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="content-container py-12">
        <div className="rounded-[32px] bg-[linear-gradient(135deg,#f5e9ff_0%,#fff9f2_48%,#fff1a8_100%)] p-6 shadow-[0_18px_46px_rgba(43,14,70,0.12)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <p className="promo-badge-hot">Promocoes</p>
              <h2 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-brand-900">
                {mainPromotion?.title ?? "Campanhas, iFood e ofertas em um unico lugar."}
              </h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-brand-950/75">
                {mainPromotion?.description ??
                  "Promoções, pedidos rápidos, retirada e campanhas de produtos aparecem juntos, sem espalhar chamadas pela home inteira."}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={(mainPromotion?.ctaLink ?? publicRoutes.promotions) as "/promocoes"}>
                  <Button size="lg">{mainPromotion?.ctaLabel ?? "Ver promocoes"}</Button>
                </Link>
                <a href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="lg">
                    <ShoppingBag className="h-4 w-4" />
                    Pedir no iFood
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Ofertas", icon: BadgePercent },
                { label: "Entrega ou retirada", icon: Truck },
                { label: "WhatsApp direto", icon: MessageCircle }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className="rounded-[20px] bg-white p-4 shadow-[inset_0_0_0_2px_rgba(104,23,181,0.12)]">
                    <Icon className="h-5 w-5 text-[var(--magenta-600)]" />
                    <p className="mt-2 text-sm font-extrabold uppercase text-brand-900">{item.label}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <ContactBlock />
    </div>
  );
}
