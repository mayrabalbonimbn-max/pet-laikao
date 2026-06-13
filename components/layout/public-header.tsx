"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { publicRoutes } from "@/lib/routes";

const navItems = [
  { label: "Inicio", href: publicRoutes.home },
  { label: "Servicos", href: publicRoutes.services },
  { label: "Produtos", href: publicRoutes.products },
  { label: "Promocoes", href: publicRoutes.promotions },
  { label: "Contato", href: publicRoutes.contact }
];

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

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="topo">
      <div className="lk-wrap bar">
        <Link className="marca" href={publicRoutes.home} aria-label="Pet Shop Laikao, inicio">
          <span className="stamp" aria-hidden="true">
            <Paw />
          </span>
          <span>
            <span className="pet">Pet Shop</span> <span className="lk">Laikao</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "ativo" : undefined}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="topo-dir">
          <Link className="btn btn--rosa topo-cta" href={publicRoutes.schedule}>
            Agendar
          </Link>
          <button
            className="burger"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="menuMob"
            onClick={() => setOpen((value) => !value)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className={open ? "menu-mob open" : "menu-mob"} id="menuMob">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "ativo" : undefined}
            aria-current={isActive(item.href) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <Link className="btn btn--rosa" href={publicRoutes.schedule} onClick={() => setOpen(false)}>
          Agendar banho e tosa
        </Link>
      </div>
    </header>
  );
}
