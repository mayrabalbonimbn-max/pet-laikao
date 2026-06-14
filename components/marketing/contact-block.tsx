import { Instagram, MapPin, MessageCircle, ShoppingBag } from "lucide-react";

import { siteConfig } from "@/config/site";

const channels = [
  { label: "WhatsApp", value: siteConfig.whatsappNumber, href: siteConfig.whatsappUrl, icon: MessageCircle },
  { label: "Instagram", value: siteConfig.instagramHandle, href: siteConfig.instagramUrl, icon: Instagram },
  { label: "Localização", value: siteConfig.addressLine, href: siteConfig.mapUrl, icon: MapPin },
  { label: "iFood", value: "Pedir agora", href: siteConfig.quickLinks.ifood.href, icon: ShoppingBag }
] as const;

export function ContactBlock() {
  return (
    <section className="content-container pb-16">
      <div className="rounded-[34px] bg-[#fff9f2] p-6 shadow-[0_18px_46px_rgba(43,14,70,0.12)] sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <p className="promo-badge">Contato</p>
            <h2 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-brand-900">
              Fale com o Laikão sem complicar.
            </h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-stone-600">
              WhatsApp, endereço, Instagram e iFood em um bloco limpo, forte e sem duplicação.
            </p>
            <p className="mt-4 text-sm font-extrabold text-[var(--magenta-600)]">{siteConfig.hoursLabel}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {channels.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[22px] bg-white p-4 shadow-[inset_0_0_0_2px_rgba(104,23,181,0.1)] transition-transform hover:-translate-y-0.5"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-900 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-extrabold uppercase text-brand-900">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-stone-600">{item.value}</p>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
