"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, ExternalLink, LoaderCircle, MapPinned, PackageCheck, RefreshCcw, TriangleAlert, UserRound } from "lucide-react";

import { CartSummary } from "@/components/commerce/cart-summary";
import { ErrorState } from "@/components/feedback/error-state";
import { InlineNotice } from "@/components/feedback/inline-notice";
import { SuccessBanner } from "@/components/feedback/success-banner";
import { FormPrivacyNotice } from "@/components/legal/form-privacy-notice";
import { PracticalLinksGrid } from "@/components/marketing/practical-links-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckoutPreview } from "@/domains/orders/types";
import { paymentPurposeLabels, paymentStatusLabels } from "@/domains/payments/constants";
import { PaymentStatusView } from "@/domains/payments/types";
import { ensureStoredCartKey } from "@/lib/cart-key";
import { createOrderFromCart, createOrderPaymentIntent, fetchCheckoutPreview, fetchPaymentStatus } from "@/lib/commerce-client";
import { publicRoutes } from "@/lib/routes";

export function CheckoutPageClient() {
  const searchParams = useSearchParams();
  const [cartKey, setCartKey] = useState<string | null>(null);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentLoadError, setPaymentLoadError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; orderNumber: string } | null>(null);
  const [pendingOrderWithoutCheckout, setPendingOrderWithoutCheckout] = useState<{ id: string; orderNumber: string; reason: string } | null>(null);
  const [paymentStatusView, setPaymentStatusView] = useState<PaymentStatusView | null>(null);
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState("pickup");
  const [timeWindow, setTimeWindow] = useState("morning");
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: ""
  });
  const [isSubmitting, startSubmitTransition] = useTransition();
  const paymentIntentId = searchParams.get("payment_intent");
  const providerPaymentId = searchParams.get("transaction_nsu") ?? undefined;
  const providerCheckoutId = searchParams.get("slug") ?? searchParams.get("invoice_slug") ?? undefined;

  const loadPreview = async (key: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const nextPreview = await fetchCheckoutPreview(key);
      setPreview(nextPreview);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Nao foi possivel carregar o checkout.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentStatus = async ({
    paymentId,
    sync
  }: {
    paymentId: string;
    sync?: boolean;
  }) => {
    setIsLoadingPaymentStatus(true);
    setPaymentLoadError(null);

    try {
      const nextPaymentStatus = await fetchPaymentStatus({
        paymentId,
        providerPaymentId,
        providerCheckoutId,
        sync
      });
      setPaymentStatusView(nextPaymentStatus);
      setCreatedOrder(nextPaymentStatus.order ? { id: nextPaymentStatus.order.id, orderNumber: nextPaymentStatus.order.orderNumber } : null);
    } catch (nextError) {
      setPaymentLoadError(nextError instanceof Error ? nextError.message : "Nao foi possivel consultar o status do pagamento.");
    } finally {
      setIsLoadingPaymentStatus(false);
    }
  };

  useEffect(() => {
    const key = ensureStoredCartKey();
    setCartKey(key);

    if (paymentIntentId) {
      void loadPaymentStatus({
        paymentId: paymentIntentId,
        sync: Boolean(providerPaymentId || providerCheckoutId)
      });
    }

    if (key) {
      void loadPreview(key);
      return;
    }

    if (paymentIntentId) {
      setIsLoading(false);
      return;
    }

    setError("Nao foi possivel iniciar o checkout neste dispositivo.");
    setIsLoading(false);
  }, [paymentIntentId, providerCheckoutId, providerPaymentId]);

  useEffect(() => {
    if (!paymentIntentId || !paymentStatusView || paymentStatusView.payment.status !== "pending") {
      return;
    }

    const interval = window.setInterval(() => {
      void loadPaymentStatus({
        paymentId: paymentIntentId,
        sync: false
      });
    }, 6000);

    return () => window.clearInterval(interval);
  }, [paymentIntentId, paymentStatusView]);

  const blockingIssues = preview?.readiness.issues ?? [];
  const sectionError = useMemo(() => {
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      return "Preencha nome e telefone para seguir com a criacao do pedido.";
    }

    return null;
  }, [form.customerName, form.customerPhone]);

  const canCheckout = Boolean(preview?.readiness.canCheckout && !sectionError);

  const handleCreateOrder = () => {
    if (!cartKey) {
      setSubmitError("Carrinho indisponivel para finalizar o pedido.");
      return;
    }

    setSubmitError(null);

    startSubmitTransition(async () => {
      try {
        const result = await createOrderFromCart({
          cartKey,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail || undefined,
          notes: [form.notes, `Modo do pedido: ${deliveryMode}`, `Faixa: ${timeWindow}`].filter(Boolean).join(" | ")
        });

        setCreatedOrder({
          id: result.orderId,
          orderNumber: result.orderNumber
        });

        try {
          const paymentIntent = await createOrderPaymentIntent({
            orderId: result.orderId,
            method: "pix"
          });

          if (paymentIntent.payment.checkoutUrl) {
            window.location.href = paymentIntent.payment.checkoutUrl;
            return;
          }

        setPendingOrderWithoutCheckout({
          id: paymentIntent.order.id,
          orderNumber: paymentIntent.order.orderNumber,
          reason: "O pedido foi criado, mas a cobrança online não retornou um link válido."
        });
        } catch (paymentError) {
          setPendingOrderWithoutCheckout({
            id: result.orderId,
            orderNumber: result.orderNumber,
            reason: paymentError instanceof Error ? paymentError.message : "Nao foi possivel preparar a cobranca do pedido."
          });
        }

        await loadPreview(cartKey);
      } catch (nextError) {
        setSubmitError(nextError instanceof Error ? nextError.message : "Nao foi possivel criar o pedido.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <div className="space-y-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="surface-default h-56 animate-pulse border border-brand-100/60 bg-brand-50/60" />
          ))}
        </div>
        <div className="surface-default h-80 animate-pulse border border-brand-100/60 bg-brand-50/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <ErrorState title="Nao foi possivel carregar o checkout" description={error} />
      </div>
    );
  }

  if (paymentIntentId) {
    const publicStatus = paymentStatusView?.payment.status;
    const paymentStatusTone =
      publicStatus === "paid"
        ? "success"
        : publicStatus === "failed"
          ? "danger"
          : publicStatus === "expired"
            ? "warning"
            : "info";

    return (
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <section className="space-y-5">
          <article className="surface-default border border-brand-100/70 bg-linear-to-br from-white via-brand-50/40 to-[#f3edff] p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="eyebrow">Retorno do pagamento</p>
                <h2 className="font-heading text-2xl font-semibold text-ink-900">
                  {paymentStatusView?.order ? `Pedido ${paymentStatusView.order.orderNumber}` : "Consulta de pagamento do pedido"}
                </h2>
                <p className="text-sm leading-6 text-stone-500">
                  O pagamento retornou e o pedido está lendo o estado financeiro vinculado à cobrança.
                </p>
              </div>
              {isLoadingPaymentStatus ? <LoaderCircle className="h-5 w-5 animate-spin text-brand-700" /> : null}
            </div>

            {paymentLoadError ? (
              <div className="mt-5">
                <ErrorState title="Nao foi possivel consultar o pagamento" description={paymentLoadError} />
              </div>
            ) : null}

            {paymentStatusView ? (
              <div className="mt-5 space-y-4">
                {publicStatus === "paid" ? (
                  <SuccessBanner
                    title="Pagamento aprovado"
                    description={`O pedido ${paymentStatusView.order?.orderNumber ?? ""} foi confirmado e o financeiro ja refletiu isso no admin.`}
                  />
                ) : (
                  <InlineNotice
                    tone={paymentStatusTone}
                    title={`Pagamento ${paymentStatusLabels[paymentStatusView.payment.status].toLowerCase()}`}
                    description={
                      publicStatus === "pending"
                        ? "A cobranca ainda esta aguardando confirmacao. Voce pode reabrir o pagamento ou atualizar o status."
                        : publicStatus === "failed"
                          ? "A tentativa falhou. O pedido continua registrado e voce pode gerar uma nova cobranca."
                          : publicStatus === "expired"
                            ? "A cobranca expirou antes da confirmacao. O pedido segue salvo e uma nova cobranca pode ser criada."
                            : "O pedido foi criado, mas a cobranca ainda exige verificacao."
                    }
                  />
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[var(--radius-lg)] border border-brand-100/70 bg-white/80 p-4">
                    <p className="text-sm text-stone-500">Valor</p>
                    <p className="mt-2 font-heading text-2xl font-semibold text-brand-700">{paymentStatusView.payment.amountLabel}</p>
                    <p className="mt-2 text-xs text-stone-500">{paymentPurposeLabels[paymentStatusView.payment.purpose]}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] border border-brand-100/70 bg-white/80 p-4">
                    <p className="text-sm text-stone-500">Status do pedido</p>
                    <p className="mt-2 font-semibold text-ink-900">{paymentStatusView.order?.orderNumber ?? "Pedido vinculado"}</p>
                    <p className="mt-2 text-xs text-stone-500">
                      Financeiro {paymentStatusLabels[paymentStatusView.payment.status].toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {paymentStatusView.payment.checkoutUrl ? (
                    <a href={paymentStatusView.payment.checkoutUrl} target="_blank" rel="noreferrer">
                      <Button>
                        Abrir cobranca
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : null}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void loadPaymentStatus({
                        paymentId: paymentIntentId,
                        sync: Boolean(providerPaymentId || providerCheckoutId)
                      })
                    }
                    disabled={isLoadingPaymentStatus}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Atualizar status
                  </Button>
                  {paymentStatusView.order && paymentStatusView.payment.status !== "paid" ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        startSubmitTransition(async () => {
                          try {
                            const nextIntent = await createOrderPaymentIntent({
                              orderId: paymentStatusView.order!.id,
                              method: "pix"
                            });

                            if (nextIntent.payment.checkoutUrl) {
                              window.location.href = nextIntent.payment.checkoutUrl;
                              return;
                            }

                            setPaymentLoadError("Uma nova cobranca foi criada, mas a URL do checkout nao ficou disponivel.");
                          } catch (nextError) {
                            setPaymentLoadError(nextError instanceof Error ? nextError.message : "Nao foi possivel recriar a cobranca.");
                          }
                        });
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Gerando..." : "Gerar nova cobranca"}
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <InlineNotice tone="info" title="Carregando estado financeiro" description="Estamos consultando o pagamento vinculado ao pedido para mostrar o retorno real do checkout." />
              </div>
            )}
          </article>
        </section>

        <aside className="space-y-4">
          <CartSummary
            sticky
            cta="Voltar aos produtos"
            actionHref={publicRoutes.products}
            summary={{
              subtotalLabel: paymentStatusView?.order?.totalLabel ?? preview?.cart.subtotalLabel ?? "R$ 0,00",
              discountLabel: preview?.cart.discountLabel ?? "R$ 0,00",
              shippingLabel: "Definido no pedido",
              totalLabel: paymentStatusView?.order?.totalLabel ?? preview?.cart.totalLabel ?? "R$ 0,00"
            }}
            notice={{
              title: paymentStatusView?.payment.status === "paid" ? "Pedido confirmado" : "Acompanhamento do pagamento",
              description:
                paymentStatusView?.payment.status === "paid"
                  ? "O pedido ja esta confirmado e refletido no financeiro."
                  : "Se o pagamento ainda estiver processando, este bloco continua sendo atualizado pelo sistema."
            }}
          />
        </aside>
      </div>
    );
  }

  if (!preview || preview.cart.items.length === 0) {
    return (
      <div className="mt-8 space-y-5">
        <ErrorState title="Checkout bloqueado" description="O carrinho esta vazio ou invalido. Adicione produtos antes de tentar criar um pedido." />
        <Link href={publicRoutes.products}>
          <Button variant="secondary">Voltar para produtos</Button>
        </Link>
        <PracticalLinksGrid />
      </div>
    );
  }

  if (pendingOrderWithoutCheckout) {
    return (
      <div className="mt-8 space-y-5">
        <SuccessBanner
          title="Pedido criado, mas a cobranca nao ficou disponivel"
          description={`O pedido ${pendingOrderWithoutCheckout.orderNumber} foi criado e continua salvo, mas a cobranca online nao ficou disponivel nesta tentativa.`}
        />
        <InlineNotice tone="warning" title="Pagamento indisponivel agora" description={pendingOrderWithoutCheckout.reason} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href={publicRoutes.contact}>
            <Button variant="secondary" fullWidth>
              Falar no WhatsApp
            </Button>
          </Link>
          <Button
            fullWidth
            onClick={() => {
              startSubmitTransition(async () => {
                try {
                  const paymentIntent = await createOrderPaymentIntent({
                    orderId: pendingOrderWithoutCheckout.id,
                    method: "pix"
                  });

                  if (paymentIntent.payment.checkoutUrl) {
                    window.location.href = paymentIntent.payment.checkoutUrl;
                    return;
                  }

                  setSubmitError("A cobranca online ainda nao retornou um link para este pedido.");
                } catch (nextError) {
                  setSubmitError(nextError instanceof Error ? nextError.message : "Nao foi possivel preparar a cobranca.");
                }
              });
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Tentando novamente..." : "Tentar gerar cobranca"}
          </Button>
        </div>
        {submitError ? <InlineNotice tone="danger" title="Cobranca ainda indisponivel" description={submitError} /> : null}
      </div>
    );
  }

  if (createdOrder) {
    return (
      <div className="mt-8 space-y-5">
        <SuccessBanner
          title="Pedido criado com sucesso"
          description={`O pedido ${createdOrder.orderNumber} foi criado e reservou o estoque. Agora estamos preparando ou acompanhando a cobranca real.`}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href={publicRoutes.products}>
            <Button variant="secondary" fullWidth>
              Continuar comprando
            </Button>
          </Link>
          <Link href={publicRoutes.cart}>
            <Button fullWidth>Voltar ao carrinho</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.82fr]">
      <section className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
          <InlineNotice
            tone={preview.readiness.canCheckout ? "success" : "warning"}
            title={preview.readiness.canCheckout ? "Checkout pronto para criar pedido" : "Checkout bloqueado ate resolver os avisos"}
            description={
              preview.readiness.canCheckout
                ? "A camada real do carrinho ja validou estoque, subtotal e consistencia antes de virar pedido e abrir a cobranca."
                : "Os avisos abaixo vem do backend e impedem a criacao de pedido incoerente."
            }
          />
          <InlineNotice
            tone="info"
            title="Pagamento online"
            description="Ao confirmar, o pedido é criado de verdade e a cobrança é preparada em seguida."
          />
        </div>

        <article className="surface-default border border-brand-100/70 bg-linear-to-br from-white via-brand-50/35 to-[#f4efff] p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-brand-100 text-brand-700">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-ink-900">Identificacao</h2>
              <p className="text-sm text-stone-500">Formulario curto, claro e conectado ao pedido real.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink-900">Nome completo</span>
              <Input value={form.customerName} onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))} placeholder="Nome completo" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink-900">Telefone / WhatsApp</span>
              <Input value={form.customerPhone} onChange={(event) => setForm((current) => ({ ...current, customerPhone: event.target.value }))} placeholder="Telefone / WhatsApp" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">E-mail</span>
              <Input value={form.customerEmail} onChange={(event) => setForm((current) => ({ ...current, customerEmail: event.target.value }))} placeholder="E-mail" />
            </label>
          </div>
          <div className="mt-4">
            <FormPrivacyNotice compact />
          </div>

          {sectionError ? (
            <div className="mt-4 rounded-[var(--radius-md)] border border-error-500/15 bg-error-500/5 px-4 py-3 text-sm">
              <div className="flex items-start gap-2 text-error-500">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="font-medium">{sectionError}</p>
              </div>
            </div>
          ) : null}
        </article>

        <article className="surface-default border border-brand-100/70 bg-linear-to-br from-white via-brand-50/30 to-[#f5f0ff] p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-brand-100 text-brand-700">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-ink-900">Entrega ou retirada</h2>
              <p className="text-sm text-stone-500">Escolha como prefere receber ou retirar o pedido.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink-900">Modo do pedido</span>
              <Select value={deliveryMode} onValueChange={setDeliveryMode} options={[{ label: "Retirada na loja", value: "pickup" }, { label: "Entrega local", value: "delivery" }]} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink-900">Faixa de horario</span>
              <Select value={timeWindow} onValueChange={setTimeWindow} options={[{ label: "Manha", value: "morning" }, { label: "Tarde", value: "afternoon" }]} />
            </label>
          </div>
        </article>

        <article className="surface-default border border-brand-100/70 bg-linear-to-br from-white via-brand-50/30 to-[#f5efff] p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-brand-100 text-brand-700">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-ink-900">Revisao do pedido</h2>
              <p className="text-sm text-stone-500">O resumo vem da camada real do carrinho e do estoque.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-brand-100/70 bg-white/80 p-4">
              <p className="text-sm text-stone-500">Itens</p>
              <p className="mt-2 font-semibold text-ink-900">{preview.cart.items.length} produtos selecionados</p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-brand-100/70 bg-white/80 p-4">
              <p className="text-sm text-stone-500">Retirada</p>
              <p className="mt-2 font-semibold text-ink-900">{deliveryMode === "pickup" ? "Loja fisica" : "Entrega local"}</p>
            </div>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-semibold text-ink-900">Observacoes do pedido</span>
            <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Alguma orientacao importante sobre a retirada ou o pedido?" />
          </label>
        </article>

        <article className="surface-default border border-brand-100/70 bg-linear-to-br from-white via-brand-50/35 to-[#f2ebff] p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-brand-100 text-brand-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-ink-900">Pagamento</h2>
              <p className="text-sm text-stone-500">O pedido é salvo e segue para cobrança online.</p>
            </div>
          </div>

          <div className="mt-5 rounded-[var(--radius-lg)] border border-brand-200/80 bg-brand-100/55 p-4">
            <p className="text-sm font-semibold text-brand-700">Fluxo financeiro protegido</p>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              O pedido só muda de estado quando o pagamento confirma o resultado. A tela apenas inicia a ação e mostra o retorno real.
            </p>
          </div>
        </article>

        {blockingIssues.length > 0 ? blockingIssues.map((issue) => (
          <InlineNotice key={issue} tone="warning" title="Checkout bloqueado" description={issue} />
        )) : null}

        {submitError ? <InlineNotice tone="danger" title="Nao foi possivel criar o pedido" description={submitError} /> : null}
      </section>

      <CartSummary
        sticky
        cta="Ir para pagamento"
        onAction={handleCreateOrder}
        actionDisabled={!canCheckout || isSubmitting}
        actionLoading={isSubmitting}
        summary={{
          subtotalLabel: preview.cart.subtotalLabel,
          discountLabel: preview.cart.discountLabel,
          shippingLabel: "Gratis",
          totalLabel: preview.cart.totalLabel
        }}
        notice={{
          title: preview.readiness.canCheckout ? "Resumo pronto para pedido + cobranca" : "Pedido bloqueado por validacao do backend",
          description: preview.readiness.canCheckout
            ? "Ao confirmar, o sistema cria o pedido, reserva o estoque e prepara a cobranca real sem duplicar checkouts desnecessariamente."
            : "Resolva os avisos do carrinho antes de transformar esse checkout em pedido."
        }}
      />
    </div>
  );
}
