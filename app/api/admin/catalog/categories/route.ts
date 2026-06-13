import { NextRequest, NextResponse } from "next/server";

import { upsertCategoryAction } from "@/domains/catalog/actions";
import { listCatalogCategoriesWithCounts } from "@/domains/catalog/queries";
import { requireAdminApiSession } from "@/server/auth/admin-api";

export async function GET() {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  const categories = await listCatalogCategoriesWithCounts();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const body = await request.json();
    await upsertCategoryAction(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao salvar categoria.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
