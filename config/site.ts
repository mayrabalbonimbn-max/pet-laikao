import { publicRoutes } from "@/lib/routes";

export type ShortcutStatus = "active" | "placeholder";

export const siteConfig = {
  name: "Pet Shop Laikao",
  description:
    "Plataforma premium de servicos, agenda e loja para um pet shop com presenca forte, operacao profissional e experiencia mobile excelente.",
  whatsappNumber: "+55 11 98051-2871",
  phoneNumber: "+55 11 98051-2871",
  email: "contato@petlaikao.com.br",
  channels: {
    contact: {
      label: "Contato",
      email: "contato@petlaikao.com.br",
      description: "Atendimento geral, duvidas e informacoes."
    },
    support: {
      label: "Suporte",
      email: "suporte@petlaikao.com.br",
      description: "Ajuda com pedidos, agenda e uso do site."
    },
    billing: {
      label: "Cobranca",
      email: "cobranca@petlaikao.com.br",
      description: "Pagamentos, comprovantes, reembolsos e financeiro."
    },
    privacy: {
      label: "Privacidade",
      email: "privacidade@petlaikao.com.br",
      description: "Pedidos sobre dados pessoais e LGPD."
    }
  },
  instagramHandle: "@pet_laikao",
  instagramUrl: "https://instagram.com/pet_laikao",
  whatsappUrl: "https://wa.me/5511980512871",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Rua+Franklin+do+Amaral+271,+Vila+Nova+Cachoeirinha,+Sao+Paulo,+SP",
  addressLine: "Rua Franklin do Amaral, 271",
  addressNeighborhood: "Vila Nova Cachoeirinha, Sao Paulo - SP",
  address: "Rua Franklin do Amaral, 271, Vila Nova Cachoeirinha, Sao Paulo - SP",
  hoursLabel: "Seg a sab, 8h as 19h",
  quickLinks: {
    whatsapp: {
      label: "WhatsApp",
      href: "https://wa.me/5511980512871",
      description: "Atendimento rapido e confirmacoes.",
      status: "active" as ShortcutStatus
    },
    instagram: {
      label: "Instagram",
      href: "https://instagram.com/pet_laikao",
      description: "Veja novidades, pets e bastidores.",
      status: "active" as ShortcutStatus
    },
    map: {
      label: "Como chegar",
      href:
        "https://www.google.com/maps/search/?api=1&query=Rua+Franklin+do+Amaral+271,+Vila+Nova+Cachoeirinha,+Sao+Paulo,+SP",
      description: "Rua Franklin do Amaral, 271.",
      status: "active" as ShortcutStatus
    },
    schedule: {
      label: "Agendar",
      href: publicRoutes.schedule,
      description: "Fluxo online do proprio site, pronto para trocar depois.",
      status: "active" as ShortcutStatus
    },
    ifood: {
      label: "iFood",
      href: "https://www.ifood.com.br/delivery/sao-paulo-sp/pet-shop-laikao-vila-nova-cachoeirinha/d7c31af8-0c1f-4649-b99b-0aaf09ce7adf?UTM_Medium=share",
      description: "Pedir no iFood com entrega rapida.",
      status: "active" as ShortcutStatus
    }
  }
} as const;
