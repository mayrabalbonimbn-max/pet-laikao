import {
  buildAnnualFinanceReport,
  getFinancialSummary,
  listFinancialCategories,
  listFinancialEntries
} from "@/server/repositories/company-finance-repository";
import { FinancialEntryFilters } from "@/domains/company-finance/types";

export async function listCompanyFinancialCategories() {
  return listFinancialCategories();
}

export async function listCompanyFinancialEntries(filters: FinancialEntryFilters = {}) {
  return listFinancialEntries(filters);
}

export async function getCompanyFinancialSummary(filters: FinancialEntryFilters = {}) {
  return getFinancialSummary(filters);
}

export async function getAnnualManagerialReport(year: number) {
  return buildAnnualFinanceReport(year);
}
