import { getEnvOrDefault } from "@/lib/env";

/**
 * Feature flags do runtime, lidos por chamada (compatível com `pm2 restart
 * --update-env`). Mantêm código pronto porém não exposto até liberarmos.
 */

/**
 * Controla se a agenda pública mostra o agendamento online (escolher serviço,
 * ver horários, reservar) ou o CTA "agende pelo WhatsApp".
 *
 * Padrão: false. O código do agendamento online continua pronto; com o flag
 * desligado o público vê o modo WhatsApp, mesmo que os serviços já tenham duração.
 * Liga com AGENDA_ONLINE_ENABLED=true no ambiente.
 */
export function isAgendaOnlineEnabled() {
  return getEnvOrDefault("AGENDA_ONLINE_ENABLED", "false").trim().toLowerCase() === "true";
}
