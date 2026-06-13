export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "reserved";
export type ProductStatus = "draft" | "active" | "out_of_stock" | "archived";
export type InventoryMovementType =
  | "reserve"
  | "release"
  | "decrement"
  | "adjustment"
  | "restock"
  | "entry"
  | "exit";
export type CouponDiscountType = "fixed" | "percentage";

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  active: boolean;
  displayOrder: number;
};

export type ProductVariantRecord = {
  id: string;
  productId: string;
  supplierId?: string;
  slug: string;
  title: string;
  sku: string;
  priceCents: number;
  compareAtCents?: number;
  costCents: number;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  active: boolean;
};

export type ProductImageRecord = {
  id: string;
  productId: string;
  imageUrl: string;
  imagePath: string;
  imageThumbUrl: string;
  imageThumbPath: string;
  alt: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  displayOrder: number;
  isPrimary: boolean;
};

export type ProductRecord = {
  id: string;
  categoryId?: string;
  categoryName?: string;
  slug: string;
  name: string;
  brand?: string;
  description: string;
  status: ProductStatus;
  featured: boolean;
  imageLabel: string;
  mainImageUrl?: string;
  active: boolean;
  images: ProductImageRecord[];
  variants: ProductVariantRecord[];
  createdAt: string;
  updatedAt: string;
};

export type ProductPreview = {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  category: string;
  priceLabel: string;
  priceCents?: number;
  compareAtCents?: number;
  availableQuantity?: number;
  stockStatus: StockStatus;
  imageLabel: string;
  mainImageUrl?: string;
  featured?: boolean;
  onPromotion?: boolean;
};

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  categoryName: string;
  priceLabel: string;
  stockStatus: StockStatus;
  availableQuantity: number;
  reservedQuantity: number;
  sku: string;
  status: ProductStatus;
  featured: boolean;
};

export type InventoryMovementRecord = {
  id: string;
  productId: string;
  variantId: string;
  movementType: InventoryMovementType;
  quantity: number;
  reason: string;
  referenceType: string;
  referenceId: string;
  unitCostCents?: number;
  totalCostCents?: number;
  notes?: string;
  resultingStockQuantity?: number;
  createdAt: string;
};

export type CouponRecord = {
  id: string;
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minSubtotalCents?: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
  usageCount: number;
};

export type CouponApplicationResult = {
  couponId: string;
  code: string;
  discountCents: number;
};
