import { publicRoutes } from "@/lib/routes";

export type ShortcutStatus = "active" | "placeholder";

export const siteConfig = {
  name: "Pet Shop Laikão",
  description:
    "Plataforma premium de serviços, agenda e loja para um pet shop com presença forte, operação profissional e experiência mobile excelente.",
  whatsappNumber: "+55 11 98051-2871",
  phoneNumber: "+55 11 98051-2871",
  email: "contato@petlaikao.com.br",
  channels: {
    contact: {
      label: "Contato",
      email: "contato@petlaikao.com.br",
      description: "Atendimento geral, dúvidas e informações."
    },
    support: {
      label: "Suporte",
      email: "suporte@petlaikao.com.br",
      description: "Ajuda com pedidos, agenda e uso do site."
    },
    billing: {
      label: "Cobrança",
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
  addressNeighborhood: "Vila Nova Cachoeirinha, São Paulo - SP",
  address: "Rua Franklin do Amaral, 271, Vila Nova Cachoeirinha, São Paulo - SP",
  hoursLabel: "Seg a sáb, 8h às 19h",
  quickLinks: {
    whatsapp: {
      label: "WhatsApp",
      href: "https://wa.me/5511980512871",
      description: "Atendimento rápido e confirmações.",
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
      description: "Fluxo online do próprio site, pronto para trocar depois.",
      status: "active" as ShortcutStatus
    },
    ifood: {
      label: "iFood",
      href: "https://www.ifood.com.br/delivery/sao-paulo-sp/pet-shop-laikao-vila-nova-cachoeirinha/d7c31af8-0c1f-4649-b99b-0aaf09ce7adf?UTM_Medium=share",
      description: "Pedir no iFood com entrega rápida.",
      status: "active" as ShortcutStatus
    }
  }
} as const;
