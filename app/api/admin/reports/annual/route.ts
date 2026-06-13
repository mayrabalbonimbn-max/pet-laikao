import { NextRequest, NextResponse } from "next/server";

import { getAnnualManagerialReport } from "@/domains/company-finance/queries";

function escapeCsv(value: string) {
  const normalized = value.replaceAll('"', '""');
  return `"${normalized}"`;
}

export async function GET(request: NextRequest) {
  const year = Number(request.nextUrl.searchParams.get("year") ?? new Date().getUTCFullYear());
  const report = await getAnnualManagerialReport(year);

  const lines = [
    ["tipo_relatorio", "apoio_gerencial_anual"],
    ["ano", String(report.year)],
    ["observacao", "Nao substitui declaracao fiscal oficial; uso gerencial e apoio contabil."],
    [],
    ["data", "origem", "categoria", "descricao", "direcao", "forma_pagamento", "status", "valor_centavos"],
    ...report.rows.map((row) => [
      row.date,
      row.source,
      row.category,
      row.description,
      row.direction,
      row.paymentMethod,
      row.status,
      String(row.amountCents)
    ]),
    [],
    ["categoria", "direcao", "total_centavos"],
    ...report.categoryTotals.map((item) => [item.category, item.direction, String(item.totalCents)])
  ];

  const csv = lines.map((line) => line.map((value) => escapeCsv(value)).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laikao-relatorio-gerencial-${year}.csv"`
    }
  });
}
