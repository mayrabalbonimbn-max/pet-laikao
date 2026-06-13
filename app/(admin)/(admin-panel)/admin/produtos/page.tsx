import { revalidatePath } from "next/cache";
import Image from "next/image";

import { EmptyState } from "@/components/feedback/empty-state";
import { updateProductAdminAction } from "@/domains/catalog/actions";
import { listCatalogCategories } from "@/domains/catalog/queries";
import { productStatusLabels } from "@/domains/catalog/constants";
import { listProductRecords } from "@/server/repositories/commerce-repository";
import { getProductImageStorage } from "@/server/storage/products-storage";
import { formatCurrency } from "@/lib/formatters";

export const dynamic = "force-dynamic";

async function saveProduct(formData: FormData) {
  "use server";

  const storage = getProductImageStorage();
  const currentMainImageUrl = String(formData.get("currentMainImageUrl") ?? "") || undefined;
  const imageIds = formData.getAll("imageId").map(String);
  const removeImageIds = new Set(formData.getAll("removeImageId").map(String));
  const primaryImageId = String(formData.get("primaryImageId") ?? "");
  const existingImages = imageIds
    .map((id, index) => ({
      id,
      imageUrl: String(formData.get(`imageUrl:${id}`) ?? ""),
      imagePath: String(formData.get(`imagePath:${id}`) ?? ""),
      imageThumbUrl: String(formData.get(`imageThumbUrl:${id}`) ?? ""),
      imageThumbPath: String(formData.get(`imageThumbPath:${id}`) ?? ""),
      alt: String(formData.get(`imageAlt:${id}`) ?? ""),
      mimeType: String(formData.get(`imageMimeType:${id}`) ?? ""),
      sizeBytes: Number(formData.get(`imageSizeBytes:${id}`) ?? 0),
      width: Number(formData.get(`imageWidth:${id}`) ?? 0),
      height: Number(formData.get(`imageHeight:${id}`) ?? 0),
      displayOrder: Number(formData.get(`imageOrder:${id}`) ?? index),
      isPrimary: id === primaryImageId
    }))
    .filter((image) => image.id && image.imageUrl && !removeImageIds.has(image.id));

  const removedImages = imageIds
    .filter((id) => removeImageIds.has(id))
    .map((id) => ({
      imagePath: String(formData.get(`imagePath:${id}`) ?? ""),
      imageThumbPath: String(formData.get(`imageThumbPath:${id}`) ?? "")
    }));

  const uploadedImages = [];
  const files = [...formData.getAll("galleryFiles"), formData.get("imageFile")].filter(Boolean);
  for (const file of files) {
    if (!(file instanceof File) || file.size <= 0) continue;
    const uploaded = await storage.save({
      bytes: Buffer.from(await file.arrayBuffer()),
      originalName: file.name,
      mimeType: file.type
    });

    uploadedImages.push({
      imageUrl: uploaded.imageUrl,
      imagePath: uploaded.imagePath,
      imageThumbUrl: uploaded.imageThumbUrl,
      imageThumbPath: uploaded.imageThumbPath,
      alt: String(formData.get("name") ?? "Produto Laikao"),
      mimeType: uploaded.mimeType,
      sizeBytes: uploaded.sizeBytes,
      width: uploaded.width,
      height: uploaded.height,
      displayOrder: existingImages.length + uploadedImages.length,
      isPrimary: existingImages.length === 0 && uploadedImages.length === 0
    });
  }

  const images = [...existingImages, ...uploadedImages].sort((left, right) => left.displayOrder - right.displayOrder);
  if (images.length > 0 && !images.some((image) => image.isPrimary)) {
    images[0].isPrimary = true;
  }
  const mainImageUrl = images.find((image) => image.isPrimary)?.imageUrl ?? images[0]?.imageUrl ?? currentMainImageUrl;

  await updateProductAdminAction({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    categoryId: String(formData.get("categoryId") ?? "") || undefined,
    status: String(formData.get("status") ?? "draft"),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    imageLabel: String(formData.get("imageLabel") ?? "Imagem"),
    mainImageUrl,
    images,
    variantPriceCents: Math.round(Number(formData.get("priceReais") ?? 0) * 100),
    variantStockQuantity: Number(formData.get("stockQuantity") ?? 0)
  });

  await Promise.all(removedImages.map((image) => storage.remove(image.imagePath, image.imageThumbPath)));

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath(`/produto/${String(formData.get("slug") ?? "")}`);
  revalidatePath("/");
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([listProductRecords(), listCatalogCategories()]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Produtos</p>
        <h1 className="page-title">Cadastre e atualize os produtos da loja: preço, estoque, categoria e fotos.</h1>
      </div>

      <div className="grid gap-4">
        {products.length === 0 ? (
          <EmptyState
            title="Nenhum produto ainda"
            description="Cadastre o primeiro produto e ele aparece aqui com preço, estoque, categoria e fotos, prontinho para a loja."
          />
        ) : products.map((product) => {
          const variant = product.variants[0];

          return (
            <article key={product.id} className="surface-default border border-brand-100 bg-white p-5 shadow-[var(--shadow-soft)]">
              <form action={saveProduct} className="grid gap-3 md:grid-cols-3">
                <input type="hidden" name="id" value={product.id} />
                <input type="hidden" name="currentMainImageUrl" value={product.mainImageUrl ?? ""} />
                <input name="name" defaultValue={product.name} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
                <input name="slug" defaultValue={product.slug} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
                <input name="imageLabel" defaultValue={product.imageLabel} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
                <select name="categoryId" defaultValue={product.categoryId ?? ""} className="rounded-[12px] border border-stone-200 px-3 py-2">
                  <option value="">Sem categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <select name="status" defaultValue={product.status} className="rounded-[12px] border border-stone-200 px-3 py-2">
                  {Object.entries(productStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-4 rounded-[12px] border border-stone-200 px-3 py-2">
                  <label className="inline-flex items-center gap-2 text-sm text-stone-700"><input type="checkbox" name="active" defaultChecked={product.active} /> Ativo</label>
                  <label className="inline-flex items-center gap-2 text-sm text-stone-700"><input type="checkbox" name="featured" defaultChecked={product.featured} /> Destaque</label>
                </div>
                <input name="priceReais" type="number" min="0" step="0.01" defaultValue={((variant?.priceCents ?? 0) / 100).toFixed(2)} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
                <input name="stockQuantity" type="number" min="0" defaultValue={variant?.stockQuantity ?? 0} className="rounded-[12px] border border-stone-200 px-3 py-2" required />
                <p className="text-xs text-stone-500">Preço atual: {formatCurrency((variant?.priceCents ?? 0) / 100)} | Reservado: {variant?.reservedQuantity ?? 0}</p>
                <textarea name="description" defaultValue={product.description} className="md:col-span-3 rounded-[12px] border border-stone-200 px-3 py-2" rows={2} required />

                <div className="md:col-span-3 rounded-[14px] border border-stone-200 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Galeria do produto</p>
                      <p className="text-xs text-stone-500">A imagem principal aparece nos cards e abre a galeria do produto.</p>
                    </div>
                    <p className="text-xs font-semibold text-brand-700">{product.images.length} imagem(ns)</p>
                  </div>

                  {product.images.length > 0 ? (
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      {product.images.map((image, index) => (
                        <div key={image.id} className="grid gap-3 rounded-[14px] border border-stone-200 bg-stone-50/60 p-3 sm:grid-cols-[7rem_1fr]">
                          <div className="relative h-28 overflow-hidden rounded-[12px] bg-white">
                            <Image src={image.imageThumbUrl} alt={image.alt} fill className="object-cover" sizes="112px" />
                          </div>
                          <div className="space-y-2">
                            <input type="hidden" name="imageId" value={image.id} />
                            <input type="hidden" name={`imageUrl:${image.id}`} value={image.imageUrl} />
                            <input type="hidden" name={`imagePath:${image.id}`} value={image.imagePath} />
                            <input type="hidden" name={`imageThumbUrl:${image.id}`} value={image.imageThumbUrl} />
                            <input type="hidden" name={`imageThumbPath:${image.id}`} value={image.imageThumbPath} />
                            <input type="hidden" name={`imageMimeType:${image.id}`} value={image.mimeType} />
                            <input type="hidden" name={`imageSizeBytes:${image.id}`} value={image.sizeBytes} />
                            <input type="hidden" name={`imageWidth:${image.id}`} value={image.width} />
                            <input type="hidden" name={`imageHeight:${image.id}`} value={image.height} />
                            <input name={`imageAlt:${image.id}`} defaultValue={image.alt} className="w-full rounded-[10px] border border-stone-200 px-3 py-2 text-sm" />
                            <div className="grid gap-2 sm:grid-cols-3">
                              <label className="text-xs font-semibold text-stone-600">
                                Ordem
                                <input name={`imageOrder:${image.id}`} type="number" min="0" defaultValue={image.displayOrder ?? index} className="mt-1 w-full rounded-[10px] border border-stone-200 px-3 py-2 text-sm" />
                              </label>
                              <label className="flex items-center gap-2 rounded-[10px] border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700">
                                <input type="radio" name="primaryImageId" value={image.id} defaultChecked={image.isPrimary || (!product.images.some((item) => item.isPrimary) && index === 0)} />
                                Principal
                              </label>
                              <label className="flex items-center gap-2 rounded-[10px] border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700">
                                <input type="checkbox" name="removeImageId" value={image.id} />
                                Remover
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-stone-500">Sem fotos ainda. A página do produto mostra um visual de marca enquanto isso.</p>
                  )}

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <label className="grid gap-1 text-xs font-semibold text-stone-600">
                      Substituir/adicionar imagem principal
                      <input type="file" name="imageFile" accept="image/jpeg,image/png,image/webp" className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-stone-600">
                      Adicionar várias imagens
                      <input type="file" name="galleryFiles" accept="image/jpeg,image/png,image/webp" multiple className="rounded-[12px] border border-stone-200 px-3 py-2 text-sm" />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">Formatos aceitos: JPG, PNG e WebP. Limite de 8MB por arquivo.</p>
                </div>

                <button className="md:col-span-3 rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Atualizar produto</button>
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
