export const adminNavigation = [
  {
    title: "Visao Geral",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" }]
  },
  {
    title: "Operacao",
    items: [
      { label: "Agenda", href: "/admin/agenda", icon: "CalendarDays" },
      { label: "Agendamentos", href: "/admin/agendamentos", icon: "ClipboardList" },
      { label: "Pedidos", href: "/admin/pedidos", icon: "ShoppingBag" },
      { label: "Promocoes", href: "/admin/promocoes", icon: "BadgePercent" },
      { label: "Financeiro", href: "/admin/financeiro", icon: "WalletCards" },
      { label: "Relatorios", href: "/admin/relatorios", icon: "ChartNoAxesCombined" },
      { label: "Notificacoes", href: "/admin/notificacoes", icon: "BellRing" }
    ]
  },
  {
    title: "Catalogo",
    items: [
      { label: "Categorias", href: "/admin/categorias", icon: "Rows3" },
      { label: "Produtos", href: "/admin/produtos", icon: "PackageSearch" },
      { label: "Estoque", href: "/admin/estoque", icon: "Boxes" },
      { label: "Precificacao", href: "/admin/precificacao", icon: "BadgeDollarSign" },
      { label: "Servicos", href: "/admin/servicos", icon: "Scissors" }
    ]
  }
] as const;
