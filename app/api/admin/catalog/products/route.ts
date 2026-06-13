import { NextRequest, NextResponse } from "next/server";

import { updateProductAdminAction } from "@/domains/catalog/actions";
import { listCatalogAdminProducts } from "@/domains/catalog/queries";
import { requireAdminApiSession } from "@/server/auth/admin-api";

export async function GET() {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  const products = await listCatalogAdminProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const body = await request.json();
    await updateProductAdminAction(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao atualizar produto.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
