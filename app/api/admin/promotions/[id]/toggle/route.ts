import { NextRequest, NextResponse } from "next/server";

import { togglePromotionActiveAction } from "@/domains/promotions/actions";
import { requireAdminApiSession } from "@/server/auth/admin-api";

export async function PATCH(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const id = (await context.params).id;
    if (!id) {
      return NextResponse.json({ message: "ID da promoção inválido." }, { status: 400 });
    }
    const body = (await request.json()) as { active?: boolean };
    const promotion = await togglePromotionActiveAction(id, Boolean(body.active));
    return NextResponse.json(promotion);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao alterar status da promocao.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
