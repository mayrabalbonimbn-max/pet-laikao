import Link from "next/link";
import Image from "next/image";

import { HeroBanner } from "@/components/marketing/hero-banner";
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Check = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const linkCards = [
  {
    href: publicRoutes.services,
    title: "Banho e tosa",
    text: "Estetica animal com hora marcada: banho, tosa, hidratacao e mais.",
    cta: "Ver servicos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M5 8c0-3 3-5 7-5M19 8c0-3-3-5-7-5" />
        <path d="M5 8c-2 4 0 9 7 12 7-3 9-8 7-12" />
      </svg>
    )
  },
  {
    href: publicRoutes.products,
    title: "Loja completa",
    text: "Racao, petisco, higiene, beleza, acessorio e brinquedo. Compre e retire.",
    cta: "Ver produtos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7h16l-1 13H5z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
    )
  },
  {
    href: publicRoutes.promotions,
    title: "Promocoes e iFood",
    text: "Ofertas da loja e delivery ate meia-noite, com entrega ou retirada.",
    cta: "Ver promocoes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12l9-9 9 9-9 9z" />
        <circle cx="9" cy="9" r="1.3" fill="currentColor" />
      </svg>
    )
  }
];

export default function HomePage() {
  return (
    <>
      <HeroBanner />

      <div className="faixa">
        <div className="lk-wrap row">
          <div className="it">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {siteConfig.hoursLabel}
          </div>
          <div className="it">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            Vila Nova Cachoeirinha
          </div>
          <div className="it">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 4h4l2 5-2 1c1 2 2 3 4 4l1-2 5 2v4c0 1-1 2-2 2A16 16 0 0 1 3 6c0-1 1-2 2-2z" />
            </svg>
            (11) 98051-2871
          </div>
          <div className="it">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
            @pet_laikao
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="lk-wrap">
          <div>
            <span className="selo sec-eyebrow">
              <Paw className="paw" /> Por onde comecar
            </span>
            <h2>Tudo pro seu pet, em um lugar so.</h2>
            <p className="sec-lead">Escolha o que voce precisa hoje. A gente cuida do resto com o carinho de sempre.</p>
          </div>
          <div className="cards">
            {linkCards.map((card) => (
              <Link key={card.href} className="lk-card linkcard" href={card.href}>
                <div className="ico">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <span className="seta">
                  {card.cta} {Arrow}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec--lav">
        <div className="lk-wrap sobre-grid">
          <div className="photo-frame photo-frame--quadro" aria-label="Foto da loja Laikao">
            <Image
              src="/images/fachada-loja.jpg"
              alt="Fachada da Pet Shop Laikão, na Vila Nova Cachoeirinha"
              fill
              sizes="(min-width: 920px) 45vw, 100vw"
            />
          </div>
          <div className="txt">
            <span className="selo sec-eyebrow">Quem e a Laikao</span>
            <h2>Um pet shop de bairro, com cuidado de gente que ama bicho.</h2>
            <p>
              Na Pet Shop Laikao, da Cris, cada pet e tratado como se fosse da casa. Aqui na Vila Nova Cachoeirinha a gente
              conhece o seu cachorro e o seu gato pelo nome, sabe do jeitinho de cada um e cuida com calma, do banho ao petisco.
            </p>
            <p className="promessa">Paixao que une, amor que cuida.</p>
            <div className="selos-conf">
              <span className="s">{Check} Atendimento de confianca</span>
              <span className="s">{Check} Caes e gatos</span>
              <span className="s">{Check} Loja, estetica e delivery</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="lk-wrap">
          <div className="cta-band">
            <h2>Bora deixar seu pet lindo e cheiroso?</h2>
            <p>Agende o banho e a tosa em poucos toques, ou chame a Cris no WhatsApp pra tirar qualquer duvida.</p>
            <div className="acoes">
              <Link className="btn btn--linha" href={publicRoutes.schedule}>
                Agendar agora
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
