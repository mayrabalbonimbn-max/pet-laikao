import Link from "next/link";
import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { publicRoutes } from "@/lib/routes";

export default function OfflinePage() {
  return (
    <div className="content-container py-16 sm:py-24">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-brand-100 bg-white p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <WifiOff className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-heading text-3xl font-semibold text-ink-900">Você está offline</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Algumas páginas públicas ficam disponíveis em cache, mas agenda, carrinho, checkout e áreas de conta precisam de internet.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={publicRoutes.home}>
            <Button size="lg">Voltar para início</Button>
          </Link>
          <a href={publicRoutes.offline} className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-brand-200 px-5 text-sm font-semibold text-ink-900 hover:bg-brand-50">
            Tentar novamente
          </a>
        </div>
      </div>
    </div>
  );
}
