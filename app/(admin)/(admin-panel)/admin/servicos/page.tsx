import { revalidatePath } from "next/cache";

import { upsertAdminServiceAction } from "@/domains/appointments/admin-actions";
import { listAdminServices } from "@/domains/appointments/queries";
import { formatCurrency } from "@/lib/formatters";

async function saveService(formData: FormData) {
  "use server";

  await upsertAdminServiceAction({
    id: (formData.get("id") as string) || undefined,
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    durationMinutes: Number(formData.get("durationMinutes") ?? 0),
    priceCents: Math.round(Number(formData.get("priceReais") ?? 0) * 100),
    active: formData.get("active") === "on",
    displayOrder: Number(formData.get("displayOrder") ?? 0),
    petSpecies: String(formData.get("petSpecies") ?? "all"),
    petSize: String(formData.get("petSize") ?? "all")
  });

  revalidatePath("/admin/servicos");
  revalidatePath("/servicos");
  revalidatePath("/");
  revalidatePath("/agenda");
}

export default async function AdminServicesPage() {
  const services = await listAdminServices();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Servicos</p>
        <h1 className="page-title">Servicos reais com preco, duracao, prioridade e elegibilidade.</h1>
      </div>

      <section className="surface-default border border-brand-100 bg-white p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-xl font-semibold text-ink-900">Novo servico</h2>
        <form action={saveService} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Nome" className="rounded-[12px] border border-stone-200 px-3 py-2" required />
          <input name="slug" placeholder="Slug" className="rounded-[12px] border border-stone-200 px-3 py-2" required />
          <input name="priceReais" type="number" step="0.01" min="0" placeholder="Preco (R$)" className="rounded-[12px] border border-stone-200 px-3 py-2" required />
          <input name="durationMinutes" type="number" min="1" placeholder="Duracao (min)" className="rounded-[12px] border border-stone-200 px-3 py-2" required />
          <input name="displayOrder" type="number" defaultValue={0} placeholder="Prioridade" className="rounded-[12px] border border-stone-200 px-3 py-2" />
          <label className="inline-flex items-center gap-2 text-sm text-stone-700"><input name="active" type="checkbox" defaultChecked /> Ativo</label>
          <select name="petSpecies" className="rounded-[12px] border border-stone-200 px-3 py-2">
            <option value="all">Especie: todos</option>
            <option value="dog">Cachorro</option>
            <option value="cat">Gato</option>
            <option value="other">Outros</option>
          </select>
          <select name="petSize" className="rounded-[12px] border border-stone-200 px-3 py-2">
            <option value="all">Porte: todos</option>
            <option value="small">Pequeno</option>
            <option value="medium">Medio</option>
            <option value="large">Grande</option>
            <option value="giant">Gigante</option>
          </select>
          <textarea name="description" placeholder="Descricao" className="md:col-span-2 rounded-[12px] border border-stone-200 px-3 py-2" rows={2} required />
          <button className="md:col-span-2 rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Salvar servico</button>
        </form>
      </section>

      <div className="grid gap-4">
        {services.map((service) => (
          <article key={service.id} className="surface-default border border-brand-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <form action={saveService} className="grid gap-3 md:grid-cols-3">
              <input type="hidden" name="id" value={service.id} />
              <input name="name" defaultValue={service.name} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
              <input name="slug" defaultValue={service.slug} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
              <input name="displayOrder" type="number" defaultValue={service.displayOrder} className="rounded-[12px] border border-stone-200 px-3 py-2" />
              <input name="priceReais" type="number" step="0.01" min="0" defaultValue={(service.priceCents / 100).toFixed(2)} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
              <input name="durationMinutes" type="number" min="1" defaultValue={service.durationMinutes} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
              <label className="inline-flex items-center gap-2 text-sm text-stone-700"><input name="active" type="checkbox" defaultChecked={service.active} /> Ativo</label>
              <select name="petSpecies" defaultValue={service.petSpecies ?? "all"} className="rounded-[12px] border border-stone-200 px-3 py-2">
                <option value="all">Especie: todos</option>
                <option value="dog">Cachorro</option>
                <option value="cat">Gato</option>
                <option value="other">Outros</option>
              </select>
              <select name="petSize" defaultValue={service.petSize ?? "all"} className="rounded-[12px] border border-stone-200 px-3 py-2">
                <option value="all">Porte: todos</option>
                <option value="small">Pequeno</option>
                <option value="medium">Medio</option>
                <option value="large">Grande</option>
                <option value="giant">Gigante</option>
              </select>
              <textarea name="description" defaultValue={service.description} className="md:col-span-3 rounded-[12px] border border-stone-200 px-3 py-2" rows={2} required />
              <p className="md:col-span-3 text-xs text-stone-500">Preco atual: {formatCurrency(service.priceCents / 100)}</p>
              <button className="md:col-span-3 rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Atualizar servico</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
