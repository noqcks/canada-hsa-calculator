export {
  calculate,
  effectiveFederalTaxRate,
  effectiveProvincialTaxRate,
  effectiveTaxRate,
  marginalFederalTaxRate,
  marginalProvincialTaxRate,
  marginalRate,
} from "./calculator";

export {
  FEDERAL_TAX_BRACKETS,
  PROVINCES,
} from "./types";

export type {
  CalculatorInput,
  CalculatorResult,
  Province,
  ProvinceCode,
  TaxBracket,
} from "./types";
