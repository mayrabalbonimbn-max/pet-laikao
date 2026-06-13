export const adminNavigation = [
  {
    title: "Visão geral",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" }]
  },
  {
    title: "Operação",
    items: [
      { label: "Agenda", href: "/admin/agenda", icon: "CalendarDays" },
      { label: "Agendamentos", href: "/admin/agendamentos", icon: "ClipboardList" },
      { label: "Pedidos", href: "/admin/pedidos", icon: "ShoppingBag" },
      { label: "Promoções", href: "/admin/promocoes", icon: "BadgePercent" },
      { label: "Financeiro", href: "/admin/financeiro", icon: "WalletCards" },
      { label: "Relatórios", href: "/admin/relatorios", icon: "ChartNoAxesCombined" },
      { label: "Notificações", href: "/admin/notificacoes", icon: "BellRing" }
    ]
  },
  {
    title: "Catálogo",
    items: [
      { label: "Categorias", href: "/admin/categorias", icon: "Rows3" },
      { label: "Produtos", href: "/admin/produtos", icon: "PackageSearch" },
      { label: "Estoque", href: "/admin/estoque", icon: "Boxes" },
      { label: "Precificação", href: "/admin/precificacao", icon: "BadgeDollarSign" },
      { label: "Serviços", href: "/admin/servicos", icon: "Scissors" }
    ]
  }
] as const;
