import { FloatingWhatsAppButton } from "@/components/layout/floating-whatsapp-button";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { CookieBanner } from "@/components/privacy/cookie-consent";
import { PwaEnhancements } from "@/components/pwa/pwa-enhancements";

export async function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <FloatingWhatsAppButton />
      <CookieBanner />
      <PwaEnhancements />
    </div>
  );
}
