import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { listActivePromotions } from "@/domains/promotions/queries";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const promotions = await listActivePromotions();
  const highlight = promotions[0] ?? null;
  const otherPromotions = promotions.slice(1);

  return (
    <div className="content-container py-10 sm:py-14">
      <section className="rounded-[34px] bg-[linear-gradient(135deg,#6817b5_0%,#9f38f6_46%,#ef4fb3_100%)] p-1.5 shadow-[0_20px_54px_rgba(43,14,70,0.18)]">
        <div className="rounded-[28px] bg-[#fff9f2] p-6 sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_0.82fr] lg:items-center">
            <div>
              <p className="promo-badge-hot">Promocoes</p>
              <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-brand-900 sm:text-5xl">
                Ofertas e campanhas do Laikao sem complicacao.
              </h1>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-brand-950/75">
                Produtos, iFood, retirada e campanhas em uma pagina mais direta, com menos ruido e mais foco.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/produtos"><Button size="lg">Ver produtos</Button></Link>
                <a href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="lg"><ShoppingBag className="h-4 w-4" />Pedir no iFood</Button>
                </a>
              </div>
            </div>

            {highlight ? (
              <article className="rounded-[24px] bg-white p-5 shadow-[inset_0_0_0_2px_rgba(104,23,181,0.1)]">
                {highlight.banners[0]?.imageThumbUrl ? (
                  <div className="mb-4 overflow-hidden rounded-[18px]">
                    <Image src={highlight.banners[0].imageThumbUrl} alt={highlight.banners[0].imageAlt ?? highlight.title} width={960} height={540} className="h-auto w-full object-cover" />
                  </div>
                ) : null}
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--magenta-600)]">Campanha em destaque</p>
                <h2 className="mt-2 font-heading text-2xl font-extrabold text-brand-900">{highlight.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{highlight.description ?? "Campanha ativa com condicoes especiais para cuidar melhor do seu pet."}</p>
                <Link href={(highlight.ctaLink ?? "/produtos") as "/produtos"} className="mt-4 inline-flex">
                  <Button variant="secondary">{highlight.ctaLabel ?? "Aproveitar"}</Button>
                </Link>
              </article>
            ) : (
              <article className="rounded-[24px] bg-white p-5 shadow-[inset_0_0_0_2px_rgba(104,23,181,0.1)]">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--magenta-600)]">Em breve</p>
                <h2 className="mt-2 font-heading text-2xl font-extrabold text-brand-900">Novas campanhas aparecem aqui.</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">Enquanto isso, veja a loja ou fale com o Laikao no WhatsApp.</p>
              </article>
            )}
          </div>
        </div>
      </section>

      {otherPromotions.length > 0 ? (
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {otherPromotions.map((promotion) => (
            <article key={promotion.id} className="rounded-[24px] bg-white p-5 shadow-[0_14px_34px_rgba(43,14,70,0.08)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--magenta-600)]">{promotion.type}</p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold text-brand-900">{promotion.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{promotion.description ?? "Promocao para cuidar melhor do seu pet."}</p>
              <Link href={(promotion.ctaLink ?? "/produtos") as "/produtos"} className="mt-4 inline-flex">
                <Button variant="secondary">{promotion.ctaLabel ?? "Aproveitar"}</Button>
              </Link>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
