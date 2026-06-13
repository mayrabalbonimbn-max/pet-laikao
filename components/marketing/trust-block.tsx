import { BadgePercent, HeartHandshake, ShoppingBag, Truck } from "lucide-react";

const items = [
  {
    title: "Atendimento com carinho",
    description: "Atendimento com carinho e atencao de verdade.",
    icon: HeartHandshake,
    accent: "bg-brand-100 text-brand-700 border-brand-200"
  },
  {
    title: "Produtos de qualidade",
    description: "Produtos de qualidade para cuidar melhor do seu pet.",
    icon: ShoppingBag,
    accent: "bg-[var(--sun-100)] text-ink-900 border-[var(--sun-300)]"
  },
  {
    title: "Mais praticidade",
    description: "Mais praticidade para comprar, agendar e falar com a loja.",
    icon: Truck,
    accent: "bg-[var(--magenta-100)] text-[var(--magenta-600)] border-[var(--magenta-300)]"
  },
  {
    title: "Cuidado e confianca",
    description: "Cuidado, confianca e carinho em cada atendimento.",
    icon: BadgePercent,
    accent: "bg-white text-brand-700 border-brand-200"
  }
];

export function TrustBlock() {
  return (
    <section className="content-container py-12 sm:py-16">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="promo-badge">Diferenciais</p>
          <h2 className="section-title text-brand-900">Por que escolher o Laikao?</h2>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.title} className="promo-card">
            <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] border ${item.accent}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-heading text-xl font-extrabold text-brand-900">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-stone-500">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
