export interface TaxBracket {
  /** Upper income threshold for this bracket */
  threshold: number;
  /** Tax rate as a decimal (e.g., 0.15 = 15%) */
  rate: number;
}

export type ProvinceCode =
  | "AB" // Alberta
  | "BC" // British Columbia
  | "MB" // Manitoba
  | "NB" // New Brunswick
  | "NL" // Newfoundland and Labrador
  | "NS" // Nova Scotia
  | "ON" // Ontario
  | "PE" // Prince Edward Island
  | "SK" // Saskatchewan
  | "YT"; // Yukon

export interface Province {
  code: string;
  name: string;
  taxBrackets: TaxBracket[];
}

export interface CalculatorInput {
  /** Annual pre-tax income in dollars */
  annualIncome: number;
  /** Annual medical expenses in dollars */
  annualMedicalExpenses: number;
  /** Province code (e.g., "ON", "BC") */
  province: ProvinceCode;
  /** HSA admin fee rate as a decimal (e.g., 0.08 = 8%) */
  adminFeeRate: number;
  /** Annual platform/plan fee in dollars */
  annualPlanFee: number;
}

export interface CalculatorResult {
  /** Admin fee on medical expenses */
  adminFee: number;
  /** Total cost through the HSA (expenses + admin fee + plan fee) */
  totalBusinessCost: number;
  /** Pre-tax income needed to cover expenses without an HSA */
  requiredPersonalIncome: number;
  /** Total savings by using an HSA */
  savings: number;
  /** Combined federal + provincial marginal tax rate */
  marginalTaxRate: number;
  /** Federal marginal tax rate */
  federalTaxRate: number;
  /** Provincial marginal tax rate */
  provincialTaxRate: number;
  /** Annual plan fee */
  annualPlanFee: number;
  /** Minimum medical expenses needed for the HSA to save money */
  breakEven: number;
}

// 2025 Federal Tax Brackets
// Source: https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html
export const FEDERAL_TAX_BRACKETS: TaxBracket[] = [
  { threshold: 57375, rate: 0.15 },
  { threshold: 114750, rate: 0.205 },
  { threshold: 177882, rate: 0.26 },
  { threshold: 253414, rate: 0.29 },
  { threshold: Infinity, rate: 0.33 },
];

// 2025 Provincial Tax Brackets
export const PROVINCES: Record<ProvinceCode, Province> = {
  AB: {
    code: "AB",
    name: "Alberta",
    taxBrackets: [
      { threshold: 151234, rate: 0.1 },
      { threshold: 181481, rate: 0.12 },
      { threshold: 241974, rate: 0.13 },
      { threshold: 362961, rate: 0.14 },
      { threshold: Infinity, rate: 0.15 },
    ],
  },
  BC: {
    code: "BC",
    name: "British Columbia",
    taxBrackets: [
      { threshold: 49279, rate: 0.0506 },
      { threshold: 98560, rate: 0.077 },
      { threshold: 113158, rate: 0.105 },
      { threshold: 137407, rate: 0.1229 },
      { threshold: 186306, rate: 0.147 },
      { threshold: 259829, rate: 0.168 },
      { threshold: Infinity, rate: 0.205 },
    ],
  },
  MB: {
    code: "MB",
    name: "Manitoba",
    taxBrackets: [
      { threshold: 47564, rate: 0.108 },
      { threshold: 101200, rate: 0.1275 },
      { threshold: Infinity, rate: 0.174 },
    ],
  },
  NB: {
    code: "NB",
    name: "New Brunswick",
    taxBrackets: [
      { threshold: 51306, rate: 0.094 },
      { threshold: 102614, rate: 0.14 },
      { threshold: 190060, rate: 0.16 },
      { threshold: Infinity, rate: 0.195 },
    ],
  },
  NL: {
    code: "NL",
    name: "Newfoundland and Labrador",
    taxBrackets: [
      { threshold: 44192, rate: 0.087 },
      { threshold: 88382, rate: 0.145 },
      { threshold: 157792, rate: 0.158 },
      { threshold: 220910, rate: 0.178 },
      { threshold: 282214, rate: 0.198 },
      { threshold: 564429, rate: 0.208 },
      { threshold: 1128858, rate: 0.213 },
      { threshold: Infinity, rate: 0.218 },
    ],
  },
  NS: {
    code: "NS",
    name: "Nova Scotia",
    taxBrackets: [
      { threshold: 30507, rate: 0.0879 },
      { threshold: 61015, rate: 0.1495 },
      { threshold: 95883, rate: 0.1667 },
      { threshold: 154650, rate: 0.175 },
      { threshold: Infinity, rate: 0.21 },
    ],
  },
  ON: {
    code: "ON",
    name: "Ontario",
    taxBrackets: [
      { threshold: 52886, rate: 0.0505 },
      { threshold: 105775, rate: 0.0915 },
      { threshold: 150000, rate: 0.1116 },
      { threshold: 220000, rate: 0.1216 },
      { threshold: Infinity, rate: 0.1316 },
    ],
  },
  PE: {
    code: "PE",
    name: "Prince Edward Island",
    taxBrackets: [
      { threshold: 33328, rate: 0.095 },
      { threshold: 64656, rate: 0.1347 },
      { threshold: 105000, rate: 0.166 },
      { threshold: 140000, rate: 0.1762 },
      { threshold: Infinity, rate: 0.19 },
    ],
  },
  SK: {
    code: "SK",
    name: "Saskatchewan",
    taxBrackets: [
      { threshold: 53463, rate: 0.105 },
      { threshold: 152750, rate: 0.125 },
      { threshold: Infinity, rate: 0.145 },
    ],
  },
  YT: {
    code: "YT",
    name: "Yukon",
    taxBrackets: [
      { threshold: 57375, rate: 0.064 },
      { threshold: 114750, rate: 0.09 },
      { threshold: 177882, rate: 0.109 },
      { threshold: 500000, rate: 0.128 },
      { threshold: Infinity, rate: 0.15 },
    ],
  },
};
