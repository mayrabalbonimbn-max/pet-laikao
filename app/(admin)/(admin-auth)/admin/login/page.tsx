"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!response.ok) {
      setError("Nao foi possivel entrar. Verifique e-mail e senha e tente novamente.");
      return;
    }

    setSuccess(true);
    const searchParams = new URLSearchParams(window.location.search);
    const nextPath = searchParams.get("next");

    const destination =
      nextPath && nextPath.startsWith("/admin")
        ? nextPath
        : "/admin/dashboard";

    window.location.href = destination;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#210839] text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1fr_520px]">
        <section className="relative hidden min-h-screen px-10 py-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(214,167,255,0.24),transparent_34%),radial-gradient(circle_at_80%_76%,rgba(28,143,133,0.22),transparent_32%)]" />
          <div className="relative flex items-center gap-4">
            <Image
              src="/brand/logo-laikao-white.jpeg"
              alt="Pet Shop Laikao"
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/20"
              priority
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-200">
                Pet Shop Laikao
              </p>
              <h1 className="mt-1 font-heading text-2xl font-semibold text-white">
                Admin comercial
              </h1>
            </div>
          </div>

          <div className="relative max-w-2xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.08] px-4 py-2 text-sm font-semibold text-brand-100">
              <ShieldCheck className="h-4 w-4" />
              Acesso protegido para a operacao
            </div>

            <div className="space-y-4">
              <p className="font-heading text-5xl font-semibold leading-tight text-white">
                Painel sobrio para controlar agenda, loja e pagamentos.
              </p>
              <p className="max-w-xl text-base leading-7 text-white/[0.68]">
                Uma entrada separada do dashboard, feita para transmitir confianca antes de abrir a
                rotina de agendamentos, pedidos, estoque, promocoes e financeiro.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-3 gap-3">
              {["Agenda", "Pedidos", "Financeiro"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/[0.12] bg-white/[0.08] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/[0.44]">
                    Modulo
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-3 text-sm text-white/[0.56]">
            <Sparkles className="h-4 w-4 text-brand-200" />
            Estrutura preparada para evoluir para API propria sem trocar a experiencia da gestao.
          </div>
        </section>

        <section className="flex min-h-screen items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex items-center gap-4 lg:hidden">
              <Image
                src="/brand/logo-laikao-white.jpeg"
                alt="Pet Shop Laikao"
                width={56}
                height={56}
                className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/20"
                priority
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
                  Pet Shop Laikao
                </p>
                <h1 className="font-heading text-xl font-semibold text-white">
                  Admin comercial
                </h1>
              </div>
            </div>

            <form
              onSubmit={onSubmit}
              className="rounded-[28px] border border-white bg-white p-6 text-ink-900 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-8"
            >
              <div className="mb-7 space-y-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                    Acesso administrativo
                  </p>
                  <h2 className="mt-2 font-heading text-3xl font-semibold leading-tight text-ink-900">
                    Entrar no painel
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    Use seu e-mail de gestao para abrir o ambiente operacional do Laikao.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block space-y-2 text-sm">
                  <span className="font-semibold text-ink-900">E-mail</span>
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="gestao@laikao.com"
                    className="h-12 rounded-2xl border-stone-100 bg-sand-50"
                  />
                </label>

                <label className="block space-y-2 text-sm">
                  <span className="font-semibold text-ink-900">Senha</span>
                  <Input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Sua senha"
                    className="h-12 rounded-2xl border-stone-100 bg-sand-50"
                  />
                </label>
              </div>

              {error ? (
                <div className="mt-5 flex gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.08] p-4 text-sm font-medium leading-5 text-rose-600">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              {success ? (
                <div className="mt-5 flex gap-3 rounded-2xl border border-success-500/20 bg-success-500/[0.08] p-4 text-sm font-medium leading-5 text-success-500">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Acesso confirmado. Abrindo o painel...</span>
                </div>
              ) : null}

              <Button disabled={loading} type="submit" fullWidth size="lg" className="mt-6 rounded-2xl">
                {loading ? "Validando acesso..." : "Entrar no admin"}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="mt-6 rounded-2xl bg-[#f7f5fb] p-4 text-xs leading-5 text-stone-500">
                Sessao protegida por cookie httpOnly, expiracao controlada e bloqueio temporario apos tentativas
                repetidas.
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}