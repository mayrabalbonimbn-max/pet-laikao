import Link from "next/link";

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

export function HeroBanner() {
  return (
    <section className="hero">
      <div className="lk-wrap hero-grid">
        <div>
          <span className="selo">
            <Paw className="paw" /> Estetica animal &middot; Zona Norte SP
          </span>
          <h1>
            O seu pet bem cuidado, do <span className="rosa">banho</span> ao petisco.
          </h1>
          <p className="tag">Paixao que une, amor que cuida.</p>
          <p className="sub">
            A Cris e a equipe da Laikao dao banho, tosa e atencao de verdade pro seu bicho, com loja completa, retirada e iFood
            ate meia-noite.
          </p>
          <div className="hero-acoes">
            <Link className="btn btn--rosa" href={publicRoutes.schedule}>
              Agendar banho e tosa
            </Link>
            <a className="btn btn--zap" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8.9-.3.2-.5 0a6.6 6.6 0 0 1-1.9-1.2 7.3 7.3 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4a.4.4 0 0 0 0-.4c0-.1-.5-1.3-.7-1.8s-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11 11 0 0 0 4.3 3.8c.6.2 1 .4 1.4.5a3.3 3.3 0 0 0 1.5.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1z" />
              </svg>
              WhatsApp
            </a>
          </div>
          <div className="chips">
            <span className="chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2v20M5 8c0-3 3-5 7-5M19 8c0-3-3-5-7-5" />
                <path d="M5 8c-2 4 0 9 7 12 7-3 9-8 7-12" />
              </svg>
              Banho e tosa
            </span>
            <span className="chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              iFood ate meia-noite
            </span>
            <span className="chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 7h13v8H3z" />
                <path d="M16 10h3l2 3v2h-5z" />
                <circle cx="7" cy="17" r="1.6" />
                <circle cx="17" cy="17" r="1.6" />
              </svg>
              Entrega ou retirada
            </span>
          </div>
        </div>

        <div className="photo-frame" aria-label="Foto da Cris com um pet">
          <div className="ph-fallback">
            <Paw className="big-paw" />
            <span>Coloque aqui uma foto da Cris com um pet feliz</span>
          </div>
          <div className="frame-badge">
            <span className="dot" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 20.5s-6.5-4.2-8.6-8.4C1.8 8.7 3.3 5.5 6.4 5.5c1.8 0 3 1.2 3.6 2.2.6-1 1.8-2.2 3.6-2.2 3.1 0 4.6 3.2 3 6.6-2.1 4.2-8.2 8.4-8.2 8.4z" />
              </svg>
            </span>
            <div>
              <b>Atendida pela Cris</b>
              <small>Quem cuida tem nome e rosto</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
