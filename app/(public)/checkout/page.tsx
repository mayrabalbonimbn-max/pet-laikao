import { Suspense } from "react";
import { CreditCard, ReceiptText, UserRound } from "lucide-react";

import { CheckoutPageClient } from "@/components/commerce/checkout-page-client";
import { FormPrivacyNotice } from "@/components/legal/form-privacy-notice";

const checkoutSections = [
  {
    title: "Identificacao",
    description: "Campos curtos, legiveis e conectados ao pedido real.",
  },
  {
    title: "Entrega ou retirada",
    description: "Escolha clara entre retirada na loja e entrega local.",
  },
  {
    title: "Revisao",
    description: "Resumo do pedido e observacoes sempre visiveis.",
  },
  {
    title: "Pagamento",
    description: "A tela ja nasce preparada para a payment layer dos pedidos.",
  },
];

export default function CheckoutPage() {
  return (
    <div className="content-container py-10 sm:py-14">
      <section className="grid gap-8 rounded-[32px] border border-brand-100/80 bg-linear-to-br from-brand-200/85 via-white to-[var(--magenta-100)]/75 p-6 shadow-[var(--shadow-soft)] sm:p-8 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <p className="eyebrow">Checkout</p>
          <h1 className="page-title">Checkout claro, confiavel e organizado para fechar o pedido real sem parecer formulario cru.</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-500">
            A etapa final continua conversando com a camada de carrinho e pedidos persistida, agora com uma paleta ainda mais coerente com a nova identidade lilas.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {checkoutSections.map((section) => (
              <div
                key={section.title}
                className="rounded-[var(--radius-lg)] border border-brand-100/70 bg-white/88 p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm"
              >
                <p className="text-sm font-semibold text-brand-700">{section.title}</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">{section.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
          <article className="rounded-[var(--radius-lg)] border border-brand-100/70 bg-white/88 p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm">
            <UserRound className="h-5 w-5 text-brand-600" />
            <p className="mt-3 text-sm font-semibold text-ink-900">Dados organizados por bloco</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">Cada secao explica melhor o que o cliente precisa fazer.</p>
          </article>
          <article className="rounded-[var(--radius-lg)] border border-brand-100/70 bg-white/88 p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm">
            <ReceiptText className="h-5 w-5 text-brand-600" />
            <p className="mt-3 text-sm font-semibold text-ink-900">Resumo facil de entender</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">O total e o conteudo do pedido continuam visiveis sem esmagar a tela.</p>
          </article>
          <article className="rounded-[var(--radius-lg)] border border-[var(--sun-300)] bg-[var(--sun-100)]/82 p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm">
            <CreditCard className="h-5 w-5 text-brand-600" />
            <p className="mt-3 text-sm font-semibold text-brand-950">Pronto para a payment layer</p>
            <p className="mt-2 text-sm leading-6 text-brand-900/78">O pedido ja nasce real hoje e abre caminho limpo para o pagamento na proxima etapa.</p>
          </article>
        </div>
      </section>

      <div className="mt-6">
        <FormPrivacyNotice />
      </div>

      <Suspense
        fallback={
          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.82fr]">
            <div className="space-y-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="surface-default h-56 animate-pulse border border-brand-100/60 bg-brand-50/60" />
              ))}
            </div>
            <div className="surface-default h-80 animate-pulse border border-brand-100/60 bg-brand-50/60" />
          </div>
        }
      >
        <CheckoutPageClient />
      </Suspense>
    </div>
  );
}
