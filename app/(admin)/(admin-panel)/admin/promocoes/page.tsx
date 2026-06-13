"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/empty-state";

type PromotionBanner = {
  id?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imagePath?: string;
  imageThumbUrl?: string;
  imageThumbPath?: string;
  imageAlt?: string;
  imageMimeType?: string;
  imageSizeBytes?: number;
  imageWidth?: number;
  imageHeight?: number;
  placement: "home_hero" | "home_strip" | "promotions_page" | "campaign";
  displayOrder: number;
  active: boolean;
};

type PromotionRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  type: string;
  active: boolean;
  priority: number;
  startsAt?: string;
  endsAt?: string;
  ctaLabel?: string;
  ctaLink?: string;
  campaignTag?: string;
  highlightedOnHome: boolean;
  banners: PromotionBanner[];
};

const emptyBanner: PromotionBanner = {
  title: "Banner promocional",
  placement: "home_strip",
  displayOrder: 0,
  active: true
};

const emptyForm = {
  id: "",
  title: "",
  slug: "",
  status: "draft",
  type: "campaign",
  active: true,
  priority: 0,
  startsAt: "",
  endsAt: "",
  ctaLabel: "",
  ctaLink: "",
  campaignTag: "",
  highlightedOnHome: false,
  banner: emptyBanner
};

export default function AdminPromotionsPage() {
  const [rows, setRows] = useState<PromotionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  async function loadRows() {
    setLoading(true);
    const response = await fetch("/api/admin/promotions", { cache: "no-store" });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.message ?? "Falha ao carregar promocoes.");
      return;
    }
    setRows(data);
  }

  useEffect(() => {
    void loadRows();
  }, []);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => Number(b.active) - Number(a.active) || b.priority - a.priority),
    [rows]
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      id: form.id || undefined,
      slug: form.slug,
      title: form.title,
      type: form.type,
      status: form.status,
      active: form.active,
      priority: form.priority,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      ctaLabel: form.ctaLabel || undefined,
      ctaLink: form.ctaLink || undefined,
      campaignTag: form.campaignTag || undefined,
      highlightedOnHome: form.highlightedOnHome,
      items: [],
      banners: form.banner.imageUrl
        ? [
            {
              id: form.banner.id,
              title: form.banner.title,
              subtitle: form.banner.subtitle,
              imageUrl: form.banner.imageUrl,
              imagePath: form.banner.imagePath,
              imageThumbUrl: form.banner.imageThumbUrl,
              imageThumbPath: form.banner.imageThumbPath,
              imageAlt: form.banner.imageAlt,
              imageMimeType: form.banner.imageMimeType,
              imageSizeBytes: form.banner.imageSizeBytes,
              imageWidth: form.banner.imageWidth,
              imageHeight: form.banner.imageHeight,
              placement: form.banner.placement,
              displayOrder: form.banner.displayOrder,
              active: form.banner.active
            }
          ]
        : []
    };

    const response = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(data.message ?? "Falha ao salvar promocao.");
      return;
    }

    setMessage("Promocao salva com sucesso.");
    setForm(emptyForm);
    await loadRows();
  }

  async function onImageUpload(file: File) {
    setUploading(true);
    setMessage(null);

    const body = new FormData();
    body.append("file", file);
    body.append("alt", form.title || "Banner promocional");

    const response = await fetch("/api/admin/promotions/upload", {
      method: "POST",
      body
    });
    const data = await response.json();
    setUploading(false);

    if (!response.ok) {
      setMessage(data.message ?? "Falha no upload da imagem.");
      return;
    }

    setForm((current) => ({
      ...current,
      banner: {
        ...current.banner,
        imageUrl: data.imageUrl,
        imagePath: data.imagePath,
        imageThumbUrl: data.imageThumbUrl,
        imageThumbPath: data.imageThumbPath,
        imageAlt: data.imageAlt,
        imageMimeType: data.imageMimeType,
        imageSizeBytes: data.imageSizeBytes,
        imageWidth: data.imageWidth,
        imageHeight: data.imageHeight
      }
    }));

    setMessage("Imagem enviada com sucesso.");
  }

  async function toggleActive(id: string, active: boolean) {
    const response = await fetch(`/api/admin/promotions/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message ?? "Falha ao alterar status.");
      return;
    }
    setRows((current) => current.map((row) => (row.id === id ? { ...row, active: data.active } : row)));
  }

  function loadForEdit(row: PromotionRow) {
    const banner = row.banners[0];

    setForm({
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      type: row.type,
      active: row.active,
      priority: row.priority,
      startsAt: row.startsAt ? row.startsAt.slice(0, 16) : "",
      endsAt: row.endsAt ? row.endsAt.slice(0, 16) : "",
      ctaLabel: row.ctaLabel ?? "",
      ctaLink: row.ctaLink ?? "",
      campaignTag: row.campaignTag ?? "",
      highlightedOnHome: row.highlightedOnHome,
      banner: banner
        ? {
            id: banner.id,
            title: banner.title,
            subtitle: banner.subtitle,
            imageUrl: banner.imageUrl,
            imagePath: banner.imagePath,
            imageThumbUrl: banner.imageThumbUrl,
            imageThumbPath: banner.imageThumbPath,
            imageAlt: banner.imageAlt,
            imageMimeType: banner.imageMimeType,
            imageSizeBytes: banner.imageSizeBytes,
            imageWidth: banner.imageWidth,
            imageHeight: banner.imageHeight,
            placement: banner.placement,
            displayOrder: banner.displayOrder,
            active: banner.active
          }
        : emptyBanner
    });
  }

  function removeCurrentImage() {
    setForm((current) => ({
      ...current,
      banner: {
        ...current.banner,
        imageUrl: undefined,
        imagePath: undefined,
        imageThumbUrl: undefined,
        imageThumbPath: undefined,
        imageAlt: undefined,
        imageMimeType: undefined,
        imageSizeBytes: undefined,
        imageWidth: undefined,
        imageHeight: undefined
      }
    }));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Promocoes</p>
        <h1 className="page-title">Campanhas reais com banner, preview e upload local na VPS.</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-default p-5">
          <h2 className="font-heading text-xl font-semibold text-ink-900">Promocoes cadastradas</h2>
          {loading ? (
            <p className="mt-4 text-sm text-stone-500">Carregando...</p>
          ) : sortedRows.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Nenhuma promocao cadastrada"
                description="Crie uma campanha real quando houver oferta, banner ou comunicacao comercial aprovada. O admin nao preenche promocoes automaticamente."
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {sortedRows.map((row) => (
                <article key={row.id} className="rounded-xl border border-stone-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-900">{row.title}</p>
                      <p className="text-xs text-stone-500">/{row.slug} • {row.type} • {row.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => loadForEdit(row)} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold">Editar</button>
                      <button onClick={() => toggleActive(row.id, !row.active)} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold">{row.active ? "Desativar" : "Ativar"}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <form onSubmit={onSubmit} className="surface-default space-y-4 p-5">
          <h2 className="font-heading text-xl font-semibold text-ink-900">{form.id ? "Editar promocao" : "Nova promocao"}</h2>
          <input value={form.id} type="hidden" readOnly />
          <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Titulo" className="w-full rounded-xl border border-stone-200 px-3 py-2.5" />
          <input required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="slug-promocao" className="w-full rounded-xl border border-stone-200 px-3 py-2.5" />

          <div className="grid gap-3 sm:grid-cols-2">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl border border-stone-200 px-3 py-2.5">
              <option value="campaign">Campanha</option><option value="product">Produto</option><option value="service">Servico</option><option value="mixed">Misto</option>
            </select>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="rounded-xl border border-stone-200 px-3 py-2.5">
              <option value="draft">Rascunho</option><option value="scheduled">Agendada</option><option value="active">Ativa</option><option value="paused">Pausada</option><option value="expired">Expirada</option>
            </select>
          </div>

          <input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))} placeholder="Prioridade" className="w-full rounded-xl border border-stone-200 px-3 py-2.5" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} className="rounded-xl border border-stone-200 px-3 py-2.5" />
            <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} className="rounded-xl border border-stone-200 px-3 py-2.5" />
          </div>

          <input value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} placeholder="Texto do CTA" className="w-full rounded-xl border border-stone-200 px-3 py-2.5" />
          <input value={form.ctaLink} onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))} placeholder="Link do CTA" className="w-full rounded-xl border border-stone-200 px-3 py-2.5" />

          <div className="rounded-xl border border-stone-200 p-4">
            <p className="mb-2 text-sm font-semibold text-ink-900">Banner promocional (16:9)</p>
            {form.banner.imageUrl ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-lg border border-stone-200">
                  <Image src={form.banner.imageUrl} alt={form.banner.imageAlt ?? "Banner promocional"} width={640} height={360} className="h-auto w-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <label className="inline-flex cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold">
                    Substituir
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])} />
                  </label>
                  <button type="button" onClick={removeCurrentImage} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold">Remover</button>
                </div>
              </div>
            ) : (
              <label className="inline-flex cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold">
                {uploading ? "Enviando..." : "Enviar imagem"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])} />
              </label>
            )}
            <p className="mt-2 text-xs text-stone-500">Formatos: JPG, PNG ou WEBP. O sistema gera imagem principal e thumbnail automaticamente.</p>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-ink-900"><input type="checkbox" checked={form.highlightedOnHome} onChange={(e) => setForm((f) => ({ ...f, highlightedOnHome: e.target.checked }))} /> Destacar na home</label>
          <label className="flex items-center gap-2 text-sm font-medium text-ink-900"><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /> Promocao ativa</label>

          {message ? <p className="text-sm text-brand-700">{message}</p> : null}
          <button disabled={saving || uploading} className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white">{saving ? "Salvando..." : "Salvar promocao"}</button>
        </form>
      </div>
    </div>
  );
}

