"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppointmentConfirmationPanel } from "@/components/appointments/appointment-confirmation-panel";
import { AvailabilityCalendar } from "@/components/appointments/availability-calendar";
import { BookingStepper } from "@/components/appointments/booking-stepper";
import { BookingSummaryCard } from "@/components/appointments/booking-summary-card";
import { PaymentOptionSelector } from "@/components/appointments/payment-option-selector";
import { PetProfileSelector } from "@/components/appointments/pet-profile-selector";
import { ServiceSelector } from "@/components/appointments/service-selector";
import { TimeSlotPicker } from "@/components/appointments/time-slot-picker";
import { CalendarViewSwitcher } from "@/components/calendar/calendar-view-switcher";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { InlineNotice } from "@/components/feedback/inline-notice";
import { FormPrivacyNotice } from "@/components/legal/form-privacy-notice";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  AgendaAvailabilityResponse,
  AgendaBootstrapData,
  AppointmentPaymentStatus,
  AppointmentStatus,
  CalendarView,
  PaymentMethod,
  PaymentOption,
  PetSize,
  PetSpecies
} from "@/domains/appointments/types";
import { mapSummaryPricing } from "@/domains/appointments/mappers";
import { PaymentIntentView, PaymentStatusView } from "@/domains/payments/types";

type HoldResponse = {
  id: string;
  status: AppointmentStatus;
  paymentStatus: AppointmentPaymentStatus;
  holdExpiresAt?: string;
  serviceName: string;
  customerName: string;
  petName: string;
  selectedStartAt: string;
  amountDueLabel: string;
  amountPaidLabel: string;
  amountBalanceLabel: string;
};

const defaultProfileForm = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  petName: "",
  petBreed: "",
  petSpecies: "dog" as PetSpecies,
  petSize: "medium" as PetSize
};

function formatCurrency(cents?: number) {
  if (cents === undefined) {
    return undefined;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);
}

function formatSelectedDateTime(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(new Date(value));
}

function mapAppointmentStatusToHold(
  appointment: NonNullable<PaymentStatusView["appointment"]>
): HoldResponse {
  return {
    id: appointment.id,
    status: appointment.status,
    paymentStatus: appointment.paymentStatus,
    holdExpiresAt: appointment.holdExpiresAt,
    serviceName: appointment.serviceName,
    customerName: appointment.customerName,
    petName: appointment.petName,
    selectedStartAt: appointment.selectedStartAt,
    amountDueLabel: appointment.amountDueLabel,
    amountPaidLabel: appointment.amountPaidLabel,
    amountBalanceLabel: appointment.amountBalanceLabel
  };
}

export function AgendaBookingFlow({
  bootstrap,
  initialAvailability
}: {
  bootstrap: AgendaBootstrapData;
  initialAvailability: AgendaAvailabilityResponse;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedServiceId, setSelectedServiceId] = useState(bootstrap.services[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(initialAvailability.selectedDate);
  const [selectedView, setSelectedView] = useState<CalendarView>(initialAvailability.selectedView);
  const [availability, setAvailability] = useState(initialAvailability);
  const [selectedStartAt, setSelectedStartAt] = useState<string | undefined>();
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("deposit_50");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [profileMode, setProfileMode] = useState<"existing" | "new">("existing");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(bootstrap.customers[0]?.id);
  const [selectedPetId, setSelectedPetId] = useState<string | undefined>(bootstrap.customers[0]?.pets[0]?.id);
  const [profileForm, setProfileForm] = useState(defaultProfileForm);
  const [appointmentHold, setAppointmentHold] = useState<HoldResponse | null>(null);
  const [paymentStatusView, setPaymentStatusView] = useState<PaymentStatusView | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [countdownLabel, setCountdownLabel] = useState<string | undefined>();
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isPending, startTransition] = useTransition();
  const countdownRefreshRef = useRef(false);

  const selectedService = useMemo(
    () => bootstrap.services.find((service) => service.id === selectedServiceId),
    [bootstrap.services, selectedServiceId]
  );

  const selectedCustomer = useMemo(
    () => bootstrap.customers.find((customer) => customer.id === selectedCustomerId),
    [bootstrap.customers, selectedCustomerId]
  );

  const selectedPet = useMemo(
    () => selectedCustomer?.pets.find((pet) => pet.id === selectedPetId),
    [selectedCustomer, selectedPetId]
  );

  const summaryPricing = useMemo(
    () => mapSummaryPricing(selectedService, paymentOption),
    [selectedService, paymentOption]
  );

  const currentPaymentIntent = paymentStatusView?.payment ?? null;

  useEffect(() => {
    let ignore = false;

    if (!selectedServiceId || !selectedDate) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/appointments/availability?serviceId=${selectedServiceId}&selectedDate=${selectedDate}&view=${selectedView}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar a disponibilidade.");
        }

        const data = (await response.json()) as AgendaAvailabilityResponse;

        if (!ignore) {
          setAvailability(data);
          setLoadError(null);
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error instanceof Error ? error.message : "Falha ao carregar disponibilidade.");
        }
      }
    });

    return () => {
      ignore = true;
    };
  }, [selectedDate, selectedServiceId, selectedView]);

  useEffect(() => {
    setSelectedStartAt(undefined);
    setAppointmentHold(null);
    setPaymentStatusView(null);
    setPaymentError(null);
  }, [selectedServiceId]);

  useEffect(() => {
    if (!appointmentHold?.holdExpiresAt || appointmentHold.status !== "hold_pending_payment") {
      setCountdownLabel(undefined);
      countdownRefreshRef.current = false;
      return;
    }

    const interval = window.setInterval(() => {
      const diff = new Date(appointmentHold.holdExpiresAt!).getTime() - Date.now();

      if (diff <= 0) {
        setCountdownLabel("00:00");

        if (!countdownRefreshRef.current) {
          countdownRefreshRef.current = true;
          void checkPaymentStatus(undefined, undefined, undefined, true);
        }

        return;
      }

      const minutes = String(Math.floor(diff / 60_000)).padStart(2, "0");
      const seconds = String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0");
      setCountdownLabel(`${minutes}:${seconds}`);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [appointmentHold]);

  useEffect(() => {
    if (selectedCustomer && !selectedCustomer.pets.some((pet) => pet.id === selectedPetId)) {
      setSelectedPetId(selectedCustomer.pets[0]?.id);
    }
  }, [selectedCustomer, selectedPetId]);

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent");
    const providerPaymentId = searchParams.get("transaction_nsu") ?? undefined;
    const providerCheckoutId = searchParams.get("slug") ?? undefined;

    if (!paymentIntentId) {
      return;
    }

    void checkPaymentStatus(paymentIntentId, providerPaymentId, providerCheckoutId, true);
    router.replace("/agenda", { scroll: false });
  }, [router, searchParams]);

  const currentStep = appointmentHold ? 6 : selectedStartAt ? 5 : selectedServiceId ? 4 : 1;

  async function refreshAvailability() {
    const availabilityResponse = await fetch(
      `/api/appointments/availability?serviceId=${selectedServiceId}&selectedDate=${selectedDate}&view=${selectedView}`,
      { cache: "no-store" }
    );

    if (availabilityResponse.ok) {
      setAvailability((await availabilityResponse.json()) as AgendaAvailabilityResponse);
    }
  }

  function hydrateSelectionFromPaymentStatus(appointment: NonNullable<PaymentStatusView["appointment"]>) {
    setAppointmentHold(mapAppointmentStatusToHold(appointment));
    setSelectedStartAt(appointment.selectedStartAt);
    setSelectedDate(appointment.selectedStartAt.slice(0, 10));
    const matchingService = bootstrap.services.find((service) => service.id === appointment.serviceId);
    if (matchingService) {
      setSelectedServiceId(matchingService.id);
    }
  }

  async function createPaymentIntentForAppointment({
    appointmentId,
    kind
  }: {
    appointmentId: string;
    kind: "initial" | "balance";
  }) {
    setIsCreatingPayment(true);
    setPaymentError(null);

    try {
      const endpoint =
        kind === "initial"
          ? `/api/appointments/${appointmentId}/payment-intent`
          : `/api/appointments/${appointmentId}/pay-balance`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: paymentMethod })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Nao foi possivel gerar a cobranca.");
      }

      if (data.appointment) {
        const appointmentView = {
          id: data.appointment.id,
          serviceId: data.appointment.serviceId,
          status: data.appointment.status,
          paymentStatus: data.appointment.paymentStatus,
          serviceName: data.appointment.serviceName,
          customerName: data.appointment.customerName,
          petName: data.appointment.petName,
          selectedStartAt: data.appointment.scheduledStartAt,
          holdExpiresAt: data.appointment.holdExpiresAt,
          amountDueCents: data.appointment.amountDueCents,
          amountPaidCents: data.appointment.amountPaidCents,
          amountBalanceCents: data.appointment.amountBalanceCents,
          amountDueLabel: formatCurrency(data.appointment.amountDueCents) ?? "R$ 0,00",
          amountPaidLabel: formatCurrency(data.appointment.amountPaidCents) ?? "R$ 0,00",
          amountBalanceLabel: formatCurrency(data.appointment.amountBalanceCents) ?? "R$ 0,00"
        };

        hydrateSelectionFromPaymentStatus(appointmentView);
        setPaymentStatusView({
          payment: data.payment as PaymentIntentView,
          appointment: appointmentView
        });
      } else {
        setPaymentStatusView({
          payment: data.payment as PaymentIntentView,
          appointment: paymentStatusView?.appointment
        });
      }

      toast.success(
        kind === "initial"
          ? "Cobranca criada para o agendamento."
          : "Cobranca do saldo gerada com sucesso."
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao gerar cobranca.";
      setPaymentError(message);
      toast.error(message);
    } finally {
      setIsCreatingPayment(false);
    }
  }

  async function checkPaymentStatus(
    explicitPaymentId?: string,
    providerPaymentId?: string,
    providerCheckoutId?: string,
    sync = true
  ) {
    const paymentId = explicitPaymentId ?? currentPaymentIntent?.id;
    if (!paymentId) {
      return;
    }

    setIsCheckingPayment(true);
    setPaymentError(null);

    try {
      const response = await fetch(
        `/api/payments/${paymentId}/status?sync=${sync ? "true" : "false"}${
          providerPaymentId ? `&providerPaymentId=${providerPaymentId}` : ""
        }${providerCheckoutId ? `&providerCheckoutId=${providerCheckoutId}` : ""}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Nao foi possivel atualizar o status do pagamento.");
      }

      const nextStatusView = data as PaymentStatusView;
      setPaymentStatusView(nextStatusView);

      if (nextStatusView.appointment) {
        hydrateSelectionFromPaymentStatus(nextStatusView.appointment);
      }

      await refreshAvailability();

      if (nextStatusView.payment.status === "paid") {
        toast.success("Pagamento conciliado com sucesso.");
      } else if (nextStatusView.payment.status === "failed") {
        toast.error("O gateway retornou falha para esta cobranca.");
      } else if (nextStatusView.payment.status === "expired") {
        toast.error("A cobranca expirou antes da confirmacao.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao consultar o status.";
      setPaymentError(message);
      toast.error(message);
    } finally {
      setIsCheckingPayment(false);
    }
  }

  async function createHold() {
    if (!selectedService || !selectedStartAt) {
      toast.error("Selecione servico, tutor, pet, data e horario antes de continuar.");
      return;
    }

    if (profileMode === "existing" && (!selectedCustomer || !selectedPet)) {
      toast.error("Selecione um tutor e um pet cadastrados antes de continuar.");
      return;
    }

    if (profileMode === "new" && (!profileForm.customerName || !profileForm.customerPhone || !profileForm.petName)) {
      toast.error("Preencha nome do tutor, telefone e nome do pet para continuar.");
      return;
    }

    const payload =
      profileMode === "existing" && selectedCustomer && selectedPet
        ? {
            serviceId: selectedService.id,
            selectedStartAt,
            paymentOption,
            paymentMethod,
            customerId: selectedCustomer.id,
            petId: selectedPet.id,
            customerName: selectedCustomer.fullName,
            customerPhone: selectedCustomer.phone,
            customerEmail: selectedCustomer.email ?? "",
            petName: selectedPet.name,
            petSpecies: selectedPet.species,
            petSize: selectedPet.size,
            petBreed: selectedPet.breed ?? ""
          }
        : {
            serviceId: selectedService.id,
            selectedStartAt,
            paymentOption,
            paymentMethod,
            customerName: profileForm.customerName,
            customerPhone: profileForm.customerPhone,
            customerEmail: profileForm.customerEmail,
            petName: profileForm.petName,
            petSpecies: profileForm.petSpecies,
            petSize: profileForm.petSize,
            petBreed: profileForm.petBreed
          };

    const response = await fetch("/api/appointments/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message ?? "Nao foi possivel preparar a reserva.");
      return;
    }

    setAppointmentHold(data);
    setPaymentStatusView(null);
    setPaymentError(null);
    await refreshAvailability();
    toast.success("Hold do slot criado. Agora o fluxo esta aguardando pagamento.");
    await createPaymentIntentForAppointment({
      appointmentId: data.id,
      kind: "initial"
    });
  }

  async function resetHoldState() {
    setAppointmentHold(null);
    setPaymentStatusView(null);
    setPaymentError(null);
    await refreshAvailability();
  }

  function openCheckout() {
    if (!currentPaymentIntent?.checkoutUrl) {
      toast.error("A cobranca ainda nao retornou um checkout utilizavel.");
      return;
    }

    window.location.assign(currentPaymentIntent.checkoutUrl);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="eyebrow">Agenda online</p>
        <h1 className="page-title">Agendamento online com reserva de horário, pagamento e acompanhamento no painel.</h1>
        <p className="max-w-3xl text-base leading-7 text-stone-500">
          Escolha o serviço, informe o pet, reserve um horário disponível e acompanhe a confirmação do pagamento no mesmo fluxo.
        </p>
      </div>

      <BookingStepper current={currentStep} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-ink-900">1. Escolha o servico</p>
                <p className="text-sm text-stone-500">Serviços cadastrados no painel da loja.</p>
            </div>
            <ServiceSelector services={bootstrap.services} selectedServiceId={selectedServiceId} onSelect={setSelectedServiceId} />
          </section>

          <section className="space-y-4">
            <PetProfileSelector
              customers={bootstrap.customers}
              mode={profileMode}
              selectedCustomerId={selectedCustomerId}
              selectedPetId={selectedPetId}
              form={profileForm}
              onModeChange={setProfileMode}
              onExistingChange={({ customerId, petId }) => {
                setSelectedCustomerId(customerId);
                setSelectedPetId(petId);
              }}
              onFormChange={(field, value) => setProfileForm((current) => ({ ...current, [field]: value }))}
            />
            <FormPrivacyNotice compact />
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-900">2. Selecione data e horario</p>
                <p className="text-sm text-stone-500">Veja os horários disponíveis por mês, semana ou dia.</p>
              </div>
              <CalendarViewSwitcher value={selectedView} onChange={setSelectedView} />
            </div>

            {loadError ? (
              <ErrorState title="Disponibilidade indisponivel" description={loadError} />
            ) : (
              <>
                <AvailabilityCalendar
                  monthLabel={new Intl.DateTimeFormat("pt-BR", {
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC"
                  }).format(new Date(`${selectedDate}T12:00:00.000Z`))}
                  days={availability.days}
                  view={selectedView}
                  onSelectDate={setSelectedDate}
                />
                {availability.slots.length > 0 ? (
                  <TimeSlotPicker slots={availability.slots} selectedStartAt={selectedStartAt} onSelect={setSelectedStartAt} />
                ) : (
                  <EmptyState
                    title="Sem disponibilidade para esse dia"
                    description="Nenhum slot livre para o recorte selecionado. Escolha outra data ou altere a visao do calendario."
                  />
                )}
              </>
            )}
          </section>

          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink-900">3. Defina a forma de pagamento</p>
                <p className="text-sm text-stone-500">Escolha Pix ou cartão para confirmar a reserva.</p>
              </div>
              <div className="w-full md:w-52">
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  placeholder="Metodo"
                  options={[
                    { label: "Pix", value: "pix" },
                    { label: "Cartao de credito", value: "credit_card" }
                  ]}
                />
              </div>
            </div>
            <PaymentOptionSelector value={paymentOption} totalCents={selectedService?.priceCents} onChange={setPaymentOption} />
            <InlineNotice
              tone="warning"
              title="Horário reservado enquanto o pagamento é concluído"
              description="Ao avançar, o horário fica protegido por alguns minutos. A confirmação, falha ou expiração do pagamento atualiza o agendamento automaticamente."
            />
          </section>
        </div>

        <div className="space-y-4">
          <BookingSummaryCard
            serviceName={appointmentHold?.serviceName ?? selectedService?.name}
            customerName={appointmentHold?.customerName ?? (profileMode === "existing" ? selectedCustomer?.fullName : profileForm.customerName)}
            petName={appointmentHold?.petName ?? (profileMode === "existing" ? selectedPet?.name : profileForm.petName)}
            dateLabel={formatSelectedDateTime(appointmentHold?.selectedStartAt ?? selectedStartAt)}
            totalCents={paymentStatusView?.appointment?.amountDueCents ?? selectedService?.priceCents}
            paymentOption={paymentOption}
            chargeNowCents={paymentStatusView?.payment.amountCents ?? summaryPricing?.chargeNowCents}
            balanceCents={paymentStatusView?.appointment?.amountBalanceCents ?? summaryPricing?.balanceCents}
          />

          {!appointmentHold ? (
            <Button fullWidth size="lg" onClick={() => void createHold()} disabled={isPending || !selectedStartAt}>
              Preparar reserva e gerar cobranca
            </Button>
          ) : (
            <AppointmentConfirmationPanel
              appointment={appointmentHold}
              paymentIntent={currentPaymentIntent}
              paymentError={paymentError}
              countdownLabel={countdownLabel}
              isCreatingPayment={isCreatingPayment}
              isCheckingStatus={isCheckingPayment}
              onCreatePayment={() =>
                void createPaymentIntentForAppointment({
                  appointmentId: appointmentHold.id,
                  kind: "initial"
                })
              }
              onOpenCheckout={openCheckout}
              onCheckStatus={() =>
                void checkPaymentStatus(
                  undefined,
                  searchParams.get("transaction_nsu") ?? undefined,
                  searchParams.get("slug") ?? undefined,
                  true
                )
              }
              onRetry={() => void resetHoldState()}
              onCreateBalancePayment={
                appointmentHold.status === "confirmed_partial"
                  ? () =>
                      void createPaymentIntentForAppointment({
                        appointmentId: appointmentHold.id,
                        kind: "balance"
                      })
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
