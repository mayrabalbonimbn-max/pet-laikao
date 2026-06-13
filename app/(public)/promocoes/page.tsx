import Link from "next/link";

import { PageHead } from "@/components/marketing/page-head";
import { siteConfig } from "@/config/site";
import { listActivePromotions } from "@/domains/promotions/queries";
import { publicRoutes } from "@/lib/routes";

export const dynamic = "force-dynamic";

function Paw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="6" cy="9" r="2" />
      <circle cx="12" cy="6.5" r="2.1" />
      <circle cx="18" cy="9" r="2" />
      <path d="M12 11.5c-2.6 0-4.7 2-4.7 4.2 0 1.5 1.2 2.3 2.7 2.3.9 0 1.4-.3 2-.3s1.1.3 2 .3c1.5 0 2.7-.8 2.7-2.3 0-2.2-2.1-4.2-4.7-4.2z" />
    </svg>
  );
}

export default async function PromotionsPage() {
  const promotions = await listActivePromotions();

  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Paw className="paw" /> Promocoes
          </>
        }
        title={
          <>
            Ofertas e <span className="rosa">vantagens</span> da Laikao.
          </>
        }
        description="O que esta valendo agora, mais o jeito mais facil de receber tudo: entrega ou retirada, e iFood ate meia-noite."
      />

      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="lk-wrap">
          <div className="promo-destaque">
            <div>
              <span className="selo">
                <Paw className="paw" /> Sempre disponivel
              </span>
              <h2>Agora tambem no iFood, ate meia-noite.</h2>
              <p>
                Esqueceu a racao ou o petisco acabou tarde da noite? A Laikao entrega pelo iFood ate meia-noite. E se preferir,
                voce compra e retira na loja.
              </p>
              <div className="acoes">
                <a className="btn btn--rosa" href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer">
                  Pedir no iFood
                </a>
                <Link className="btn btn--linha" href={publicRoutes.products}>
                  Ver a loja
                </Link>
              </div>
            </div>
            <div className="photo-frame photo-frame--quadro" aria-hidden="true" style={{ boxShadow: "none", outlineColor: "rgba(255,255,255,.5)" }}>
              <div className="ph-fallback">
                <svg className="big-paw" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 7h13v8H3z" />
                  <path d="M16 10h3l2 3v2h-5z" />
                  <circle cx="7" cy="17" r="1.8" />
                  <circle cx="17" cy="17" r="1.8" />
                </svg>
                <span>Entrega ou retirada, do seu jeito</span>
              </div>
            </div>
          </div>

          <div className="promo-grid">
            <article className="promo">
              <span className="faixinha">Vantagem fixa</span>
              <h3>Retire na loja sem frete</h3>
              <p>Compre pelo site ou WhatsApp e retire na Laikao, na Vila Nova Cachoeirinha, sem pagar entrega.</p>
              <Link className="btn btn--rosa promo-cta" href={publicRoutes.products}>
                Montar pedido
              </Link>
            </article>

            <article className="promo">
              <span className="faixinha">Vantagem fixa</span>
              <h3>Atendimento ate meia-noite</h3>
              <p>Pedidos pelo iFood com a loja aberta ate tarde, pros perrengues de ultima hora.</p>
              <a className="btn btn--rosa promo-cta" href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer">
                Pedir no iFood
              </a>
            </article>

            {promotions.map((promotion) => (
              <article key={promotion.id} className="promo">
                <span className="faixinha">{promotion.type ?? "Campanha"}</span>
                <h3>{promotion.title}</h3>
                <p>{promotion.description ?? "Aproveite e cuide melhor do seu pet."}</p>
                <a className="btn btn--rosa promo-cta" href={promotion.ctaLink ?? publicRoutes.products}>
                  {promotion.ctaLabel ?? "Aproveitar"}
                </a>
              </article>
            ))}

            {promotions.length === 0 ? (
              <article className="promo promo--futuro">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 8v8M8 12h8" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <b>Novas campanhas em breve</b>
                <p style={{ margin: ".3rem 0 0" }}>Siga o @pet_laikao pra ser a primeira a saber.</p>
              </article>
            ) : null}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="lk-wrap">
          <div className="cta-band">
            <h2>Nao quer perder nenhuma oferta?</h2>
            <p>Acompanha a gente no Instagram e fala no WhatsApp pra saber das novidades primeiro.</p>
            <div className="acoes">
              <a className="btn btn--linha" href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
                Seguir no Instagram
              </a>
              <a className="btn btn--claro" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
