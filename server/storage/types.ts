export type StoredPromotionImage = {
  imagePath: string;
  imageUrl: string;
  imageThumbPath: string;
  imageThumbUrl: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
};

export type PromotionImageUploadInput = {
  bytes: Buffer;
  originalName: string;
  mimeType: string;
  alt?: string;
};

export interface PromotionImageStorage {
  save(input: PromotionImageUploadInput): Promise<StoredPromotionImage>;
  remove(imagePath?: string, imageThumbPath?: string): Promise<void>;
}

export type StoredProductImage = {
  imagePath: string;
  imageUrl: string;
  imageThumbPath: string;
  imageThumbUrl: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
};

export type ProductImageUploadInput = {
  bytes: Buffer;
  originalName: string;
  mimeType: string;
};

export interface ProductImageStorage {
  save(input: ProductImageUploadInput): Promise<StoredProductImage>;
  remove(imagePath?: string, imageThumbPath?: string): Promise<void>;
}
