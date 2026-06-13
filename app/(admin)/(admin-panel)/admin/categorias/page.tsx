import { revalidatePath } from "next/cache";

import { upsertCategoryAction } from "@/domains/catalog/actions";
import { listCatalogCategoriesWithCounts } from "@/domains/catalog/queries";

async function saveCategory(formData: FormData) {
  "use server";

  await upsertCategoryAction({
    id: (formData.get("id") as string) || undefined,
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    active: formData.get("active") === "on",
    displayOrder: Number(formData.get("displayOrder") ?? 0)
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/produtos");
  revalidatePath("/");
}

export default async function AdminCategoriesPage() {
  const categories = await listCatalogCategoriesWithCounts();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Categorias</p>
        <h1 className="page-title">Categorias de produto reais do catalogo (separadas dos servicos de agenda).</h1>
      </div>

      <section className="surface-default border border-brand-100 bg-white p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-xl font-semibold text-ink-900">Nova categoria</h2>
        <form action={saveCategory} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Nome" className="rounded-[12px] border border-stone-200 px-3 py-2" required />
          <input name="slug" placeholder="Slug" className="rounded-[12px] border border-stone-200 px-3 py-2" required />
          <input name="displayOrder" type="number" defaultValue={0} className="rounded-[12px] border border-stone-200 px-3 py-2" />
          <label className="inline-flex items-center gap-2 text-sm text-stone-700"><input name="active" type="checkbox" defaultChecked /> Ativa</label>
          <textarea name="description" placeholder="Descricao" className="md:col-span-2 rounded-[12px] border border-stone-200 px-3 py-2" rows={2} />
          <button className="md:col-span-2 rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Salvar categoria</button>
        </form>
      </section>

      <div className="grid gap-4">
        {categories.map((category) => (
          <article key={category.id} className="surface-default border border-brand-100 bg-white p-5 shadow-[var(--shadow-soft)]">
            <form action={saveCategory} className="grid gap-3 md:grid-cols-3">
              <input type="hidden" name="id" value={category.id} />
              <input name="name" defaultValue={category.name} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
              <input name="slug" defaultValue={category.slug} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
              <input name="displayOrder" type="number" defaultValue={category.displayOrder} className="rounded-[12px] border border-stone-200 px-3 py-2" />
              <textarea name="description" defaultValue={category.description} className="md:col-span-2 rounded-[12px] border border-stone-200 px-3 py-2" rows={2} />
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm text-stone-700"><input name="active" type="checkbox" defaultChecked={category.active} /> Ativa</label>
                <p className="text-xs text-stone-500">Produtos ativos: {category.productCount}</p>
              </div>
              <button className="md:col-span-3 rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Atualizar categoria</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
