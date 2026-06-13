import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import sharp from "sharp";

import { storageConfig } from "@/config/storage";
import { PromotionImageStorage, PromotionImageUploadInput } from "@/server/storage/types";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getFileNameSuffix() {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return { year, month, day };
}

function makeRelativePath(fileName: string) {
  const { year, month, day } = getFileNameSuffix();
  return path.posix.join(year, month, day, fileName);
}

function absolutePath(relativePath: string) {
  return path.join(storageConfig.promotions.uploadRoot, ...relativePath.split("/"));
}

function publicUrl(relativePath: string) {
  return `${storageConfig.promotions.publicBaseUrl}/${relativePath}`;
}

async function writeImage(filePath: string, buffer: Buffer) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
}

export class LocalPromotionImageStorage implements PromotionImageStorage {
  async save(input: PromotionImageUploadInput) {
    if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
      throw new Error("Formato invalido. Use jpg, jpeg, png ou webp.");
    }

    if (input.bytes.length > storageConfig.promotions.maxUploadBytes) {
      throw new Error("Arquivo muito grande para upload.");
    }

    const optimizedMain = sharp(input.bytes).rotate().resize(storageConfig.promotions.main.width, storageConfig.promotions.main.height, {
      fit: "cover",
      position: "attention"
    });

    const mainBuffer = await optimizedMain.webp({ quality: storageConfig.promotions.main.quality }).toBuffer();
    const metadata = await sharp(mainBuffer).metadata();

    const thumbBuffer = await sharp(input.bytes)
      .rotate()
      .resize(storageConfig.promotions.thumb.width, storageConfig.promotions.thumb.height, {
        fit: "cover",
        position: "attention"
      })
      .webp({ quality: storageConfig.promotions.thumb.quality })
      .toBuffer();

    const baseName = `promotion-${randomUUID()}`;
    const imageRelativePath = makeRelativePath(`${baseName}.webp`);
    const thumbRelativePath = makeRelativePath(`${baseName}-thumb.webp`);

    await writeImage(absolutePath(imageRelativePath), mainBuffer);
    await writeImage(absolutePath(thumbRelativePath), thumbBuffer);

    return {
      imagePath: imageRelativePath,
      imageUrl: publicUrl(imageRelativePath),
      imageThumbPath: thumbRelativePath,
      imageThumbUrl: publicUrl(thumbRelativePath),
      mimeType: "image/webp",
      sizeBytes: mainBuffer.length,
      width: metadata.width ?? storageConfig.promotions.main.width,
      height: metadata.height ?? storageConfig.promotions.main.height
    };
  }

  async remove(imagePath?: string, imageThumbPath?: string) {
    const paths = [imagePath, imageThumbPath].filter(Boolean) as string[];
    await Promise.all(
      paths.map(async (relativePath) => {
        const filePath = absolutePath(relativePath);
        try {
          await fs.unlink(filePath);
        } catch {
          // Intentionally silent when file does not exist.
        }
      })
    );
  }
}
