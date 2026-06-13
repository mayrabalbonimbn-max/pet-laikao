import Link from "next/link";
import { CalendarDays, ExternalLink, Instagram, MapPinned, MessageCircle, ShoppingBag } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const shortcutMeta = {
  whatsapp: {
    icon: MessageCircle,
    card: "border-success-500/15 bg-white hover:border-success-500/35",
    accent: "bg-success-500/10 text-success-500 border-success-500/20",
    badge: "bg-success-500/10 text-success-500"
  },
  instagram: {
    icon: Instagram,
    card: "border-[var(--magenta-300)]/60 bg-white hover:border-[var(--magenta-300)]",
    accent: "bg-[var(--magenta-100)] text-[var(--magenta-600)] border-[var(--magenta-300)]",
    badge: "bg-[var(--magenta-100)] text-[var(--magenta-600)]"
  },
  map: {
    icon: MapPinned,
    card: "border-brand-100/70 bg-white hover:border-brand-300",
    accent: "bg-brand-100 text-brand-700 border-brand-200",
    badge: "bg-brand-100 text-brand-700"
  },
  schedule: {
    icon: CalendarDays,
    card: "border-brand-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,233,255,0.76))] hover:border-brand-400",
    accent: "bg-brand-500 text-white border-brand-400",
    badge: "bg-[var(--sun-100)] text-ink-900"
  },
  ifood: {
    icon: ShoppingBag,
    card: "border-[var(--sun-300)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,241,168,0.72))]",
    accent: "bg-[var(--sun-100)] text-ink-900 border-[var(--sun-300)]",
    badge: "bg-[var(--magenta-100)] text-[var(--magenta-600)]"
  }
} as const;

export function PracticalLinksGrid({
  className,
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  const entries = Object.entries(siteConfig.quickLinks) as Array<
    [keyof typeof siteConfig.quickLinks, (typeof siteConfig.quickLinks)[keyof typeof siteConfig.quickLinks]]
  >;

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-5", className)}>
      {entries.map(([key, item]) => {
        const Icon = shortcutMeta[key].icon;
        const isExternal = item.href.startsWith("http");
        const isPlaceholder = item.status === "placeholder";

        if (isPlaceholder) {
          return null;
        }

        const content = (
          <>
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-[16px] border transition-transform group-hover:scale-[1.03]", shortcutMeta[key].accent)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink-900">{item.label}</p>
              <ExternalLink className="h-4 w-4 text-brand-500" />
            </div>
            {!compact ? <p className="mt-1 text-sm leading-6 text-stone-500">{item.description}</p> : null}
          </>
        );

        const classNameValue = cn(
          "group rounded-[var(--radius-lg)] border px-4 py-4 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
          shortcutMeta[key].card
        );

        return isExternal ? (
          <a key={key} href={item.href} target="_blank" rel="noreferrer" className={classNameValue}>
            {content}
          </a>
        ) : (
          <Link key={key} href={item.href} className={classNameValue}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
