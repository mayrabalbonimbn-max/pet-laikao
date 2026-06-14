import Link from "next/link";

import { AgendaBookingFlow } from "@/components/appointments/agenda-booking-flow";
import { siteConfig } from "@/config/site";
import { getAgendaBootstrapData, getAvailabilityData } from "@/domains/appointments/queries";
import { publicRoutes } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const bootstrap = await getAgendaBootstrapData();
  // Só entram na agenda online serviços com duração confirmada. Enquanto as
  // durações estiverem a confirmar, o agendamento fica indisponível com um
  // estado claro, sem inventar horários nem quebrar a página.
  const bookableServices = bootstrap.services.filter((service) => service.durationMinutes > 0);

  if (bookableServices.length === 0) {
    return (
      <div className="content-container py-8 sm:py-12">
        <div className="lk-wrap">
          <article className="lk-card" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <h2>Agendamento online chegando</h2>
            <p>
              Estamos finalizando os horarios de banho e tosa por aqui. Por enquanto, fale com a gente no WhatsApp pra
              marcar o horario do seu pet. E rapidinho.
            </p>
            <div className="card-acoes" style={{ marginTop: 22, justifyContent: "center" }}>
              <a className="btn btn--zap" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
                Agendar pelo WhatsApp
              </a>
              <Link className="btn btn--linha" href={publicRoutes.services}>
                Ver os servicos
              </Link>
            </div>
          </article>
        </div>
      </div>
    );
  }

  const bootstrapForFlow = { ...bootstrap, services: bookableServices };
  const initialService = bookableServices[0];
  const initialAvailability = await getAvailabilityData({
    serviceId: initialService.id,
    selectedDate: bootstrap.initialSelectedDate,
    view: "month"
  });

  return (
    <div className="content-container py-8 sm:py-12">
      <AgendaBookingFlow bootstrap={bootstrapForFlow} initialAvailability={initialAvailability} />
    </div>
  );
}
