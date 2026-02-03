import {
  CalculatorInput,
  CalculatorResult,
  FEDERAL_TAX_BRACKETS,
  Province,
  PROVINCES,
  TaxBracket,
} from "./types";

/**
 * Calculate the effective (average) tax rate for a set of brackets.
 * This is the total tax paid divided by total income.
 */
export function effectiveTaxRate(
  income: number,
  brackets: TaxBracket[],
): number {
  if (income <= 0) return 0;

  let totalTax = 0;
  let previousThreshold = 0;

  for (const bracket of brackets) {
    const taxableInBracket =
      Math.min(income, bracket.threshold) - previousThreshold;

    if (taxableInBracket > 0) {
      totalTax += taxableInBracket * bracket.rate;
    }

    if (income <= bracket.threshold) {
      break;
    }

    previousThreshold = bracket.threshold;
  }

  return totalTax / income;
}

/**
 * Calculate the effective federal tax rate based on income.
 */
export function effectiveFederalTaxRate(income: number): number {
  return effectiveTaxRate(income, FEDERAL_TAX_BRACKETS);
}

/**
 * Calculate the effective provincial tax rate based on income and province.
 */
export function effectiveProvincialTaxRate(
  income: number,
  province: Province,
): number {
  return effectiveTaxRate(income, province.taxBrackets);
}

/**
 * Find the marginal tax rate (the rate on the next dollar earned) for a set of brackets.
 */
export function marginalRate(income: number, brackets: TaxBracket[]): number {
  for (const bracket of brackets) {
    if (income <= bracket.threshold) {
      return bracket.rate;
    }
  }
  return brackets[brackets.length - 1]!.rate;
}

/**
 * Calculate the marginal federal tax rate based on income.
 */
export function marginalFederalTaxRate(income: number): number {
  return marginalRate(income, FEDERAL_TAX_BRACKETS);
}

/**
 * Calculate the marginal provincial tax rate based on income and province.
 */
export function marginalProvincialTaxRate(
  income: number,
  province: Province,
): number {
  return marginalRate(income, province.taxBrackets);
}

/**
 * Calculate HSA tax savings for a Canadian small business.
 *
 * Compares the pre-tax income needed to cover medical expenses personally
 * vs. the total cost of running expenses through an HSA (Health Spending Account).
 *
 * @example
 * ```ts
 * import { calculate } from "canada-hsa-calculator";
 *
 * const result = calculate({
 *   annualIncome: 100000,
 *   annualMedicalExpenses: 3000,
 *   province: "ON",
 *   adminFeeRate: 0.08,
 *   annualPlanFee: 120,
 * });
 *
 * console.log(result.savings);          // ~$680
 * console.log(result.marginalTaxRate);  // 0.2965 (29.65%)
 * ```
 */
export function calculate(input: CalculatorInput): CalculatorResult {
  const {
    annualIncome,
    annualMedicalExpenses,
    province: provinceCode,
    adminFeeRate,
    annualPlanFee,
  } = input;

  if (annualIncome <= 0) {
    throw new Error("annualIncome must be greater than 0");
  }
  if (annualMedicalExpenses < 0) {
    throw new Error("annualMedicalExpenses must be >= 0");
  }

  const province = PROVINCES[provinceCode];
  if (!province) {
    throw new Error(`Invalid province code: ${provinceCode}`);
  }

  const federalTaxRate = marginalFederalTaxRate(annualIncome);
  const provincialTaxRate = marginalProvincialTaxRate(annualIncome, province);
  const marginalTaxRate = federalTaxRate + provincialTaxRate;

  const adminFee = annualMedicalExpenses * adminFeeRate;
  const totalBusinessCost = annualMedicalExpenses + adminFee + annualPlanFee;
  const requiredPersonalIncome =
    annualMedicalExpenses / (1 - marginalTaxRate);
  const savings = requiredPersonalIncome - totalBusinessCost;
  const breakEven =
    (annualPlanFee * (1 - marginalTaxRate)) / marginalTaxRate;

  return {
    adminFee,
    totalBusinessCost,
    requiredPersonalIncome,
    savings,
    marginalTaxRate,
    federalTaxRate,
    provincialTaxRate,
    annualPlanFee,
    breakEven,
  };
}
