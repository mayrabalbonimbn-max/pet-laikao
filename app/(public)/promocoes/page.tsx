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
            <Paw className="paw" /> Promoções
          </>
        }
        title={
          <>
            Ofertas e <span className="rosa">vantagens</span> da Laikão.
          </>
        }
        description="O que está valendo agora na Laikão. Acompanhe as ofertas e novidades da loja."
      />

      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="lk-wrap">
          <div className="promo-grid">
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
                <b>No momento sem promoções ativas</b>
                <p style={{ margin: ".3rem 0 0" }}>Acompanhe o @pet_laikao pra ser a primeira a saber das novidades.</p>
              </article>
            ) : null}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="lk-wrap">
          <div className="cta-band">
            <h2>Não quer perder nenhuma oferta?</h2>
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
