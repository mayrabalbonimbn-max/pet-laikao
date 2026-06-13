import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";

import { siteConfig } from "@/config/site";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-brand-900 px-0 py-6 text-white sm:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(239,79,179,0.34),transparent_32%),radial-gradient(circle_at_82%_14%,rgba(214,167,255,0.24),transparent_30%),linear-gradient(135deg,#2b0e46_0%,#6817b5_58%,#9f38f6_100%)]" />
      <div className="content-container relative">
        <div className="overflow-hidden rounded-[34px] border-[4px] border-white/20 bg-[#fff9f2] p-5 text-brand-950 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.96fr_0.72fr] lg:items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-[4px] border-brand-900 bg-white shadow-[0_7px_0_rgba(104,23,181,0.16)]">
                  <Image src="/brand/logo-laikao-purple.jpeg" alt="Pet Shop Laikao" fill className="object-cover" priority />
                </div>
                <div>
                  <p className="inline-flex rounded-full bg-[var(--sun-300)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-950">
                    Pet Shop Laikao
                  </p>
                  <p className="mt-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--magenta-600)]">
                    Loja e estetica animal
                  </p>
                </div>
              </div>

              <div>
                <h1 className="font-heading text-4xl font-extrabold leading-[0.98] text-brand-900 sm:text-6xl">
                  Aqui tem tudo para o seu pet.
                </h1>
                <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-brand-950/80 sm:text-lg">
                  Banho, tosa, produtos, retirada, iFood e atendimento direto em uma experiencia mais bonita,
                  roxa e organizada do Laikao.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={siteConfig.quickLinks.schedule.href}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[var(--magenta-600)] px-6 py-3 text-sm font-extrabold uppercase text-white shadow-[0_6px_0_rgba(43,14,70,0.22)] transition-transform hover:-translate-y-0.5"
                >
                  Agendar banho e tosa
                  <CalendarDays className="h-4 w-4" />
                </Link>
                <Link
                  href="/produtos"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border-2 border-brand-900 bg-[var(--sun-300)] px-6 py-3 text-sm font-extrabold uppercase text-brand-950 shadow-[0_6px_0_rgba(43,14,70,0.14)] transition-transform hover:-translate-y-0.5"
                >
                  Ver produtos
                  <ShoppingBag className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] bg-brand-900 p-5 text-white">
              <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-900">
                Estetica Animal
              </p>
              <h2 className="mt-4 font-heading text-4xl font-extrabold leading-none text-white">
                Cuidado, beleza e carinho.
              </h2>
              <div className="mt-5 grid gap-2">
                {["Banho", "Tosa", "Hidratacao", "Escovacao", "Corte de unhas"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-full bg-white px-3 py-2 text-brand-900">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--magenta-600)] text-white">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-extrabold uppercase">{item}</span>
                  </div>
                ))}
              </div>
              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm font-extrabold uppercase text-white"
              >
                Falar no WhatsApp
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
