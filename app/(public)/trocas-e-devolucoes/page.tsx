import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { legalPageMap } from "@/config/legal";

const page = legalPageMap["trocas-e-devolucoes"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description
};

export default function LegalRoutePage() {
  return <LegalPageLayout page={page} />;
}
