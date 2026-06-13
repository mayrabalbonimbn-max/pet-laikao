import { Bell, ChevronDown, Search, ShieldCheck } from "lucide-react";

import { AdminMobileNavSheet } from "@/components/layout/admin-mobile-nav-sheet";
import { AdminLogoutButton } from "@/components/layout/admin-logout-button";
import { getAdminSessionUser } from "@/server/auth/admin-auth";

export async function AdminTopbar() {
  const user = await getAdminSessionUser();

  return (
    <div className="sticky top-0 z-30 border-b border-white/70 bg-[rgba(247,245,251,0.86)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <AdminMobileNavSheet />
          <div className="hidden min-w-0 sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Operação Laikão</p>
            <p className="mt-0.5 truncate text-sm text-stone-500">Agenda, pedidos, loja e financeiro conectados</p>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-[0_12px_30px_rgba(32,16,51,0.07)] sm:max-w-xl lg:ml-8">
            <Search className="h-4 w-4 shrink-0 text-brand-700" />
            <p className="truncate text-sm text-stone-500">Buscar cliente, pet, pedido, agendamento ou pagamento</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white bg-white text-stone-500 shadow-[0_12px_30px_rgba(32,16,51,0.07)] transition hover:text-brand-700"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-white bg-white px-3 py-2 shadow-[0_12px_30px_rgba(32,16,51,0.07)] sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-brand-700">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-4 text-ink-900">{user?.name ?? "Gestão Laikão"}</span>
              <span className="block text-xs capitalize text-stone-500">{user?.role ?? "Super admin"}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-stone-500" />
          </div>
          <AdminLogoutButton />
        </div>
      </div>
    </div>
  );
}
