import { MetricItem } from "@/domains/admin/types";

import { cn } from "@/lib/utils";

const toneMap = {
  neutral: "bg-white",
  success: "bg-white shadow-[inset_0_4px_0_rgba(35,132,93,0.42)]",
  warning: "bg-white shadow-[inset_0_4px_0_rgba(212,138,29,0.42)]",
  danger: "bg-white shadow-[inset_0_4px_0_rgba(197,69,82,0.42)]"
} as const;

export function MetricCard({ item }: { item: MetricItem }) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-white p-5 shadow-[0_14px_35px_rgba(32,16,51,0.08)]",
        toneMap[item.tone ?? "neutral"]
      )}
    >
      <p className="text-sm font-semibold text-stone-500">{item.label}</p>
      <p className="mt-3 font-heading text-3xl font-semibold text-ink-900">{item.value}</p>
      <p className="mt-2 min-h-10 text-sm leading-5 text-stone-500">{item.helper}</p>
    </article>
  );
}
