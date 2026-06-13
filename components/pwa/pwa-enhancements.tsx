"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Wifi, WifiOff, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_STORAGE_KEY = "laikao-pwa-install-dismissed";

export function PwaEnhancements() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [online, setOnline] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        void navigator.serviceWorker.register("/sw.js");
      });
    }

    setDismissed(localStorage.getItem(DISMISS_STORAGE_KEY) === "1");
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    setOnline(navigator.onLine);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const showInstallCard = useMemo(() => !dismissed && !isStandalone && (Boolean(deferredPrompt) || isIOS), [dismissed, isStandalone, deferredPrompt, isIOS]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function dismissInstall() {
    localStorage.setItem(DISMISS_STORAGE_KEY, "1");
    setDismissed(true);
  }

  return (
    <>
      {!online ? (
        <div className="fixed inset-x-3 bottom-3 z-[120] rounded-[14px] border border-amber-500/30 bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900 shadow-[var(--shadow-soft)] sm:left-auto sm:right-4 sm:w-[22rem]">
          <p className="inline-flex items-center gap-2"><WifiOff className="h-4 w-4" /> Sem internet. Algumas funcoes exigem conexao.</p>
        </div>
      ) : null}

      {showInstallCard ? (
        <div className="fixed inset-x-3 bottom-3 z-[110] rounded-[18px] border border-brand-200 bg-white p-4 shadow-[var(--shadow-elevated)] sm:left-auto sm:right-4 sm:w-[23rem]">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">Instalar app Laikao</p>
              <p className="mt-1 text-xs leading-5 text-stone-600">Use como app no celular, com abertura rapida e atalho na tela inicial.</p>
            </div>
            <button onClick={dismissInstall} className="rounded-full p-1 text-stone-500 hover:bg-stone-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          {deferredPrompt ? (
            <button onClick={handleInstall} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700">
              <Download className="h-4 w-4" />
              Instalar app
            </button>
          ) : (
            <p className="rounded-[12px] border border-brand-100 bg-brand-50 px-3 py-2 text-xs leading-5 text-brand-900">
              No iPhone: toque em compartilhar e depois em <strong>Adicionar a Tela de Inicio</strong>.
            </p>
          )}
        </div>
      ) : null}

      {online && isStandalone ? (
        <div className="fixed bottom-3 right-4 z-[100] hidden rounded-full border border-success-500/25 bg-success-500/10 px-3 py-1.5 text-xs font-semibold text-success-500 sm:inline-flex sm:items-center sm:gap-1.5">
          <Wifi className="h-3.5 w-3.5" />
          App ativo
        </div>
      ) : null}
    </>
  );
}
