import { formatCurrency } from "@/lib/formatters";
import {
  getProductRecordBySlug,
  listAdminProductRows,
  listCategoryRecordsWithCounts,
  listCategoryRecords,
  listProductRecords
} from "@/server/repositories/commerce-repository";
import { ProductPreview } from "@/domains/catalog/types";

function computeProductPreview(product: Awaited<ReturnType<typeof listProductRecords>>[number]): ProductPreview {
  const firstVariant = product.variants[0];
  const available = firstVariant?.availableQuantity ?? 0;
  const reserved = firstVariant?.reservedQuantity ?? 0;

  const stockStatus =
    available <= 0 && reserved > 0
      ? "reserved"
      : available <= 0
        ? "out_of_stock"
        : available <= 3
          ? "low_stock"
          : reserved > 0
            ? "reserved"
            : "in_stock";

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.categoryName ?? "Sem categoria",
    priceLabel: formatCurrency((firstVariant?.priceCents ?? 0) / 100),
    priceCents: firstVariant?.priceCents ?? 0,
    compareAtCents: firstVariant?.compareAtCents,
    availableQuantity: available,
    stockStatus,
    imageLabel: product.imageLabel,
    mainImageUrl: product.mainImageUrl,
    featured: product.featured,
    onPromotion: product.featured || Boolean(firstVariant?.compareAtCents && firstVariant.compareAtCents > firstVariant.priceCents)
  };
}

export async function listCatalogProducts() {
  const products = await listProductRecords();
  return products.map(computeProductPreview);
}

export async function getCatalogProductDetail(slug: string) {
  return getProductRecordBySlug(slug);
}

export async function listCatalogCategories() {
  return listCategoryRecords();
}

export async function listCatalogCategoriesWithCounts() {
  return listCategoryRecordsWithCounts();
}

export async function listPublicCatalogCategories() {
  const categories = await listCategoryRecordsWithCounts();
  return categories.filter((category) => category.active && category.productCount > 0);
}

export async function listUpcomingCatalogCategories() {
  const categories = await listCategoryRecordsWithCounts();
  return categories.filter((category) => category.active && category.productCount === 0);
}

export async function listCatalogAdminProducts() {
  return listAdminProductRows();
}
