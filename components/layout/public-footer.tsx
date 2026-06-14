import Link from "next/link";
import type { Route } from "next";

import { siteConfig } from "@/config/site";
import { publicRoutes } from "@/lib/routes";

const navigationLinks = [
  { label: "Inicio", href: publicRoutes.home },
  { label: "Servicos", href: publicRoutes.services },
  { label: "Produtos", href: publicRoutes.products },
  { label: "Promocoes", href: publicRoutes.promotions },
  { label: "Contato", href: publicRoutes.contact }
];

const legalLinks = [
  { label: "Privacidade", href: publicRoutes.privacy },
  { label: "Termos", href: publicRoutes.terms },
  { label: "Trocas e devoluções", href: publicRoutes.exchangesReturns }
];

export function PublicFooter() {
  return (
    <footer className="rodape">
      <div className="lk-wrap">
        <div className="grid">
          <div>
            <div className="marca">
              <span className="pet">Pet Shop</span> <span className="lk">Laikão</span>
            </div>
            <p>Loja, estética animal, produtos, retirada e atendimento direto pra cuidar melhor do seu pet.</p>
            <p>
              {siteConfig.addressLine}
              <br />
              {siteConfig.addressNeighborhood}
            </p>
            <p>{siteConfig.hoursLabel}</p>
          </div>

          <div>
            <h4>Navegação</h4>
            <ul>
              {navigationLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href as Route}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Canais</h4>
            <ul>
              <li>
                <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href={siteConfig.quickLinks.ifood.href} target="_blank" rel="noreferrer">
                  iFood
                </a>
              </li>
              <li>
                <a href={siteConfig.mapUrl} target="_blank" rel="noreferrer">
                  Localização
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="fim">
          <span>&copy; {new Date().getFullYear()} Pet Shop Laikão. Feito com carinho.</span>
          <span>
            {legalLinks.map((item, index) => (
              <span key={item.href}>
                {index > 0 ? " · " : null}
                <Link href={item.href as Route}>{item.label}</Link>
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
