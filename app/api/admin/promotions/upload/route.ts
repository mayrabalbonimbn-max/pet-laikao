import { NextRequest, NextResponse } from "next/server";

import { requireAdminApiSession } from "@/server/auth/admin-api";
import { getPromotionImageStorage } from "@/server/storage/promotions-storage";

export async function POST(request: NextRequest) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const alt = String(formData.get("alt") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Arquivo nao enviado." }, { status: 400 });
    }

    const storage = getPromotionImageStorage();
    const result = await storage.save({
      bytes: Buffer.from(await file.arrayBuffer()),
      originalName: file.name,
      mimeType: file.type,
      alt
    });

    return NextResponse.json({
      imagePath: result.imagePath,
      imageUrl: result.imageUrl,
      imageThumbPath: result.imageThumbPath,
      imageThumbUrl: result.imageThumbUrl,
      imageAlt: alt,
      imageMimeType: result.mimeType,
      imageSizeBytes: result.sizeBytes,
      imageWidth: result.width,
      imageHeight: result.height
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao processar upload.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
