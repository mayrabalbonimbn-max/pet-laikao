"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cookieCategories, cookieConsentStorageKey, type CookieCategoryId } from "@/config/legal";
import { cn } from "@/lib/utils";

type CookiePreferences = Record<CookieCategoryId, boolean>;

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false
};

function readStoredPreferences(): CookiePreferences | null {
  try {
    const raw = window.localStorage.getItem(cookieConsentStorageKey);
    if (!raw) return null;
    return { ...defaultPreferences, ...JSON.parse(raw), necessary: true };
  } catch {
    return null;
  }
}

function persistPreferences(preferences: CookiePreferences) {
  const nextPreferences = { ...preferences, necessary: true };
  window.localStorage.setItem(cookieConsentStorageKey, JSON.stringify(nextPreferences));
  window.dispatchEvent(new CustomEvent("laikao:cookie-consent", { detail: nextPreferences }));
}

export function CookiePreferencesPanel({
  onSaved,
  framed = false
}: {
  onSaved?: () => void;
  framed?: boolean;
}) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = readStoredPreferences();
    if (stored) setPreferences(stored);
  }, []);

  const enabledOptionalCount = useMemo(
    () => Number(preferences.analytics) + Number(preferences.marketing),
    [preferences.analytics, preferences.marketing]
  );

  function updatePreference(category: CookieCategoryId, value: boolean) {
    if (category === "necessary") return;
    setPreferences((current) => ({ ...current, [category]: value, necessary: true }));
    setSaved(false);
  }

  function save() {
    persistPreferences(preferences);
    setSaved(true);
    onSaved?.();
  }

  return (
    <div className={cn("space-y-5", framed && "surface-default border-brand-100 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6")}>
      <div className="space-y-2">
        <p className="eyebrow">Preferencias</p>
        <h2 className="font-heading text-2xl font-semibold text-ink-900">Controle seus cookies</h2>
        <p className="text-sm leading-6 text-stone-600">
          Necessarios ficam sempre ativos. Analiticos e marketing permanecem desativados ate voce permitir.
        </p>
      </div>

      <div className="grid gap-3">
        {cookieCategories.map((category) => {
          const checked = preferences[category.id];
          return (
            <div key={category.id} className="rounded-[var(--radius-lg)] border border-brand-100/70 bg-brand-50/45 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{category.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{category.description}</p>
                  {category.required ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Sempre ativo</p> : null}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={checked}
                  disabled={category.required}
                  onClick={() => updatePreference(category.id, !checked)}
                  className={cn(
                    "relative mt-1 h-7 w-12 shrink-0 rounded-full border transition-all focus-visible:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-80",
                    checked ? "border-brand-600 bg-brand-600" : "border-stone-300 bg-white"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                      checked ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500">
          {enabledOptionalCount === 0 ? "Nenhum cookie opcional ativo." : `${enabledOptionalCount} categoria(s) opcional(is) ativa(s).`}
        </p>
        <Button onClick={save}>Salvar preferencias</Button>
      </div>

      {saved ? <p className="rounded-[14px] border border-success-500/20 bg-success-500/10 px-4 py-3 text-sm font-medium text-success-500">Preferencias salvas neste navegador.</p> : null}
    </div>
  );
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    setVisible(!readStoredPreferences());
  }, []);

  function acceptAll() {
    persistPreferences({ necessary: true, analytics: true, marketing: true });
    setVisible(false);
    setShowPreferences(false);
  }

  function rejectOptional() {
    persistPreferences(defaultPreferences);
    setVisible(false);
    setShowPreferences(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[130] sm:left-auto sm:right-4 sm:w-[31rem]">
      <div className="overflow-hidden rounded-[24px] border border-brand-200 bg-white shadow-[var(--shadow-elevated)]">
        <div className="bg-linear-to-r from-brand-700 via-brand-600 to-brand-500 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-[14px] bg-white/15 p-2"><SlidersHorizontal className="h-4 w-4" /></div>
              <div>
                <p className="font-heading text-lg font-semibold text-white">Cookies no Laikao</p>
                <p className="mt-1 text-sm leading-6 text-white/86">
                  Usamos cookies necessarios para o funcionamento do site e, com sua autorizacao, cookies analiticos e de terceiros para melhorar sua experiencia.
                </p>
              </div>
            </div>
            <button onClick={rejectOptional} className="rounded-full p-1.5 text-white/75 hover:bg-white/12 hover:text-white" aria-label="Fechar e recusar cookies nao essenciais">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showPreferences ? (
          <div className="max-h-[70vh] overflow-y-auto p-5">
            <CookiePreferencesPanel onSaved={() => setVisible(false)} />
          </div>
        ) : (
          <div className="space-y-4 p-5">
            <p className="text-xs leading-5 text-stone-500">
              Voce pode alterar sua escolha depois em <Link href={"/preferencias-de-cookies" as Route} className="font-semibold text-brand-700 hover:text-brand-900">Preferencias de Cookies</Link>.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button onClick={acceptAll} size="sm">Aceitar todos</Button>
              <Button onClick={rejectOptional} variant="secondary" size="sm">Recusar nao essenciais</Button>
              <Button onClick={() => setShowPreferences(true)} variant="ghost" size="sm">Configurar preferencias</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
