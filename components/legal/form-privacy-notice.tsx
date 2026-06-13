import Link from "next/link";
import type { Route } from "next";
import { ShieldCheck } from "lucide-react";

import { formPrivacyNotice } from "@/config/legal";

export function FormPrivacyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "rounded-[16px] border border-brand-100 bg-brand-50/70 px-4 py-3" : "rounded-[var(--radius-lg)] border border-brand-100 bg-brand-50/70 p-4"}>
      <div className="flex items-start gap-2.5 text-sm leading-6 text-stone-600">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <p>
          {formPrivacyNotice} {" "}
          <Link href={"/privacidade" as Route} className="font-semibold text-brand-700 hover:text-brand-900">Ler Politica de Privacidade</Link>.
        </p>
      </div>
    </div>
  );
}
