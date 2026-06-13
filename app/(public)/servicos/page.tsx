import Link from "next/link";

import { PageHead } from "@/components/marketing/page-head";
import { siteConfig } from "@/config/site";
import { listPublicServices } from "@/domains/appointments/queries";
import { formatCurrency } from "@/lib/formatters";
import { publicRoutes } from "@/lib/routes";

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

const ScissorsBath = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2v20M5 8c0-3 3-5 7-5M19 8c0-3-3-5-7-5" />
    <path d="M5 8c-2 4 0 9 7 12 7-3 9-8 7-12" />
  </svg>
);

const Check = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const Zap = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20z" />
  </svg>
);

export default async function ServicesPage() {
  const services = await listPublicServices();

  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Paw className="paw" /> Estetica animal
          </>
        }
        title={
          <>
            Cuidado, beleza e <span className="rosa">carinho</span> pro seu pet.
          </>
        }
        description="Escolha o servico, veja o preco e o tempo, e reserve o horario em poucos toques. Sem fila, sem confusao."
        actions={
          <>
            <Link className="btn btn--rosa" href={publicRoutes.schedule}>
              Agendar agora
            </Link>
            <a className="btn btn--zap" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
              {Zap} Falar no WhatsApp
            </a>
          </>
        }
      />

      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="lk-wrap">
          <div className="cards" style={{ marginTop: 0 }}>
            {services.map((service) => (
              <article key={service.slug} className="lk-card">
                <div className="ico">{ScissorsBath}</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="meta">
                  <div>
                    <span className="v">{formatCurrency(service.priceCents / 100)}</span>
                    <span className="k">Valor</span>
                  </div>
                  <div>
                    <span className="v">{service.durationMinutes} min</span>
                    <span className="k">Duracao</span>
                  </div>
                </div>
                <div className="card-acoes">
                  <Link className="btn btn--rosa" href={publicRoutes.schedule}>
                    Agendar
                  </Link>
                  <Link className="btn btn--linha" href={`/servicos/${service.slug}`}>
                    Ver detalhes
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div style={{ marginTop: 54 }}>
            <span className="selo sec-eyebrow">Tambem fazemos</span>
            <h2 style={{ fontSize: "clamp(1.6rem,4.5vw,2.3rem)", fontWeight: 800 }}>Outros cuidados no balcao da Laikao</h2>
            <div className="inclui">
              <span className="pill">{Check} Hidratacao</span>
              <span className="pill">{Check} Escovacao</span>
              <span className="pill">{Check} Corte de unhas</span>
              <span className="pill">{Check} Caes e gatos</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec--lav" style={{ paddingTop: 40 }}>
        <div className="lk-wrap">
          <div className="nota">
            <div className="nico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3>Antes de trazer seu pet</h3>
              <p>
                Pra proteger todos os bichinhos que passam por aqui, pet que chega com <b>pulga ou carrapato</b> precisa ser
                medicado na hora, evitando que passe pro ambiente e pros outros clientes. Qualquer duvida, chame a gente no
                WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="lk-wrap">
          <div className="cta-band">
            <h2>Reserve o horario do seu pet</h2>
            <p>Escolha o servico, veja os horarios livres e confirme. Rapidinho.</p>
            <div className="acoes">
              <Link className="btn btn--linha" href={publicRoutes.schedule}>
                Ir para a agenda
              </Link>
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
