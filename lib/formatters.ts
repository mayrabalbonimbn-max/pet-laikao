export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

/**
 * Duração do serviço para a vitrine. Quando ainda não há minutos confirmados
 * (durationMinutes <= 0), mostra "A combinar" em vez de "0 min".
 */
export function formatServiceDuration(durationMinutes: number) {
  return durationMinutes > 0 ? `${durationMinutes} min` : "A combinar";
}

/** Preço de serviço, com prefixo "A partir de" quando o valor é uma base. */
export function formatServicePrice(priceCents: number, priceFrom: boolean) {
  const value = formatCurrency(priceCents / 100);
  return priceFrom ? `A partir de ${value}` : value;
}
