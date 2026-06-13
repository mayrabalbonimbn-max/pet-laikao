import Link from "next/link";

import { PageHead } from "@/components/marketing/page-head";
import { siteConfig } from "@/config/site";
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

const Arrow = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Zap = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20z" />
  </svg>
);

export default function ContactPage() {
  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Paw className="paw" /> Contato
          </>
        }
        title={
          <>
            Vem falar com a <span className="rosa">Laikao.</span>
          </>
        }
        description="Estamos pertinho, na Vila Nova Cachoeirinha. Chame no WhatsApp, abra a rota ou siga a gente no Instagram."
        actions={
          <>
            <a className="btn btn--zap" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
              {Zap} Falar no WhatsApp
            </a>
            <Link className="btn btn--rosa" href={publicRoutes.schedule}>
              Agendar horario
            </Link>
          </>
        }
      />

      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="lk-wrap">
          <div className="visita-grid">
            <div className="vcard">
              <div className="vi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 4h4l2 5-2 1c1 2 2 3 4 4l1-2 5 2v4c0 1-1 2-2 2A16 16 0 0 1 3 6c0-1 1-2 2-2z" />
                </svg>
              </div>
              <h3>WhatsApp</h3>
              <p>Resposta rapida pra agendar ou tirar duvida.</p>
              <a className="link" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
                {siteConfig.whatsappNumber} {Arrow}
              </a>
            </div>

            <div className="vcard">
              <div className="vi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                </svg>
              </div>
              <h3>Instagram</h3>
              <p>Novidades, promocoes e os pets mais fofos do dia.</p>
              <a className="link" href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
                {siteConfig.instagramHandle} {Arrow}
              </a>
            </div>

            <div className="vcard">
              <div className="vi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>
              <h3>Endereco</h3>
              <p>{siteConfig.addressLine}, {siteConfig.addressNeighborhood}.</p>
              <a className="link" href={siteConfig.mapUrl} target="_blank" rel="noreferrer">
                Abrir no mapa {Arrow}
              </a>
            </div>

            <div className="vcard">
              <div className="vi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <h3>Horario</h3>
              <p>Segunda a sabado, das 8h as 19h. iFood ate meia-noite.</p>
              <a className="link" href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer">
                Pedir no iFood {Arrow}
              </a>
            </div>
          </div>

          <div className="mapa">
            <iframe
              title="Mapa da Pet Shop Laikao"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Rua+Franklin+do+Amaral+271,+Vila+Nova+Cachoeirinha,+Sao+Paulo,+SP&output=embed"
            />
          </div>

          <p className="lgpd">
            Ao falar com a gente, voce concorda com o tratamento das informacoes para atendimento, agendamento, compra e
            suporte, conforme nossa <Link href={publicRoutes.privacy}>Politica de Privacidade</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
