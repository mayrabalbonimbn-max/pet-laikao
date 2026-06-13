import { NextRequest, NextResponse } from "next/server";

import { upsertAdminServiceAction } from "@/domains/appointments/admin-actions";
import { listAdminServices } from "@/domains/appointments/queries";
import { requireAdminApiSession } from "@/server/auth/admin-api";

export async function GET() {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  const services = await listAdminServices();
  return NextResponse.json(services);
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdminApiSession();
  if (response) return response;

  try {
    const body = await request.json();
    await upsertAdminServiceAction(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao salvar servico.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
