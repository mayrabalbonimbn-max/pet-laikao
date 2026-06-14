import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHead } from "@/components/marketing/page-head";
import { siteConfig } from "@/config/site";
import {
  BATH_SERVICE_SLUG,
  COMMERCIAL_TOSA_SLUG,
  bathIncludesNote,
  bathPriceTable,
  commercialTosaTiers,
  getServiceMeta
} from "@/config/services-content";
import { getPublicServiceDetail } from "@/domains/appointments/queries";
import { formatCurrency, formatServiceDuration } from "@/lib/formatters";
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

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getPublicServiceDetail(slug);

  if (!service) {
    notFound();
  }

  const especies = (service.petSpecies ?? "all") === "all" ? "Cães e gatos" : service.petSpecies;
  const meta = getServiceMeta(service.slug);
  const isBanho = service.slug === BATH_SERVICE_SLUG;
  const isComercial = service.slug === COMMERCIAL_TOSA_SLUG;

  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Paw className="paw" /> Estética animal
          </>
        }
        title={service.name}
        description={service.description}
        actions={
          <>
            <Link className="btn btn--rosa" href={publicRoutes.schedule}>
              Agendar este serviço
            </Link>
            <a className="btn btn--zap" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
              {Zap} Tirar dúvidas
            </a>
          </>
        }
      />

      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="lk-wrap">
          <article className="lk-card" style={{ maxWidth: 720 }}>
            <h3>O que você reserva</h3>
            <p>Banho, tosa e o acabamento certinho pro seu pet sair lindo, cheiroso e bem cuidado.</p>
            <div className="meta">
              <div>
                <span className="v">{formatCurrency(service.priceCents / 100)}</span>
                <span className="k">{meta.priceFrom ? "A partir de" : "Valor"}</span>
              </div>
              <div>
                <span className="v">{formatServiceDuration(service.durationMinutes)}</span>
                <span className="k">Duração</span>
              </div>
              <div>
                <span className="v">{especies}</span>
                <span className="k">Atendemos</span>
              </div>
            </div>
            <div className="inclui" style={{ marginTop: 20 }}>
              <span className="pill">{Check} Hora marcada</span>
              <span className="pill">{Check} Profissionais que amam bicho</span>
              <span className="pill">{Check} Retirada na loja</span>
            </div>
            <div className="card-acoes" style={{ marginTop: 22 }}>
              <Link className="btn btn--rosa" href={publicRoutes.schedule}>
                Agendar agora
              </Link>
              <Link className="btn btn--linha" href={publicRoutes.services}>
                Ver outros serviços
              </Link>
            </div>
          </article>
        </div>
      </section>

      {isBanho && (
        <section className="sec" style={{ paddingTop: 8 }}>
          <div className="lk-wrap">
            <article className="lk-card" style={{ maxWidth: 720 }}>
              <h3>Valor do banho por porte</h3>
              <p>
                Estes são valores de referência, a partir de. O preço final depende do porte, da raça e da pelagem do seu pet,
                e a gente confirma certinho no agendamento.
              </p>
              <div className="tabela-precos" style={{ marginTop: 16 }}>
                {bathPriceTable.map((linha) => (
                  <div className="tabela-linha" key={linha.porte}>
                    <span className="tabela-porte">{linha.porte}</span>
                    <span className="tabela-valor">
                      A partir de <b>{formatCurrency(linha.fromReais)}</b>
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 16, fontWeight: 700, color: "var(--roxo-profundo)" }}>{bathIncludesNote}</p>
            </article>
          </div>
        </section>
      )}

      {isComercial && (
        <section className="sec" style={{ paddingTop: 8 }}>
          <div className="lk-wrap">
            <article className="lk-card" style={{ maxWidth: 720 }}>
              <h3>Níveis da tosa comercial</h3>
              <p>Escolha a altura da pelagem. Cada nível tem um valor a partir de:</p>
              <div className="tabela-precos" style={{ marginTop: 16 }}>
                {commercialTosaTiers.map((tier) => (
                  <div className="tabela-linha" key={tier.nome}>
                    <span className="tabela-porte">{tier.nome}</span>
                    <span className="tabela-valor">
                      A partir de <b>{formatCurrency(tier.fromReais)}</b>
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      )}

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
                Pet que chega com <b>pulga ou carrapato</b> precisa ser medicado na hora, pra proteger o ambiente e os outros
                clientes. Qualquer dúvida, chame a Cris no WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
