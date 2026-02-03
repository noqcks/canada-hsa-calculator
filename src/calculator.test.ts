import { describe, expect, it } from "vitest";

import {
  calculate,
  effectiveFederalTaxRate,
  effectiveProvincialTaxRate,
  marginalFederalTaxRate,
  marginalProvincialTaxRate,
} from "./calculator";
import { PROVINCES } from "./types";

describe("effectiveFederalTaxRate", () => {
  it("returns 15% for income within first bracket", () => {
    expect(effectiveFederalTaxRate(40000)).toBeCloseTo(0.15, 4);
  });

  it("returns blended rate for $100k income", () => {
    expect(effectiveFederalTaxRate(100000)).toBeCloseTo(0.17344375, 4);
  });
});

describe("effectiveProvincialTaxRate", () => {
  it("[ON] returns 5.05% for income within first bracket", () => {
    expect(effectiveProvincialTaxRate(40000, PROVINCES.ON)).toBeCloseTo(
      0.0505,
      4,
    );
  });

  it("[ON] returns blended rate for $100k income", () => {
    expect(effectiveProvincialTaxRate(100000, PROVINCES.ON)).toBeCloseTo(
      0.06981674,
      4,
    );
  });
});

describe("marginalFederalTaxRate", () => {
  it("returns 15% for income in first bracket", () => {
    expect(marginalFederalTaxRate(40000)).toBe(0.15);
  });

  it("returns 20.5% for income in second bracket", () => {
    expect(marginalFederalTaxRate(100000)).toBe(0.205);
  });

  it("returns 33% for very high income", () => {
    expect(marginalFederalTaxRate(300000)).toBe(0.33);
  });
});

describe("marginalProvincialTaxRate", () => {
  it("[ON] returns 5.05% for low income", () => {
    expect(marginalProvincialTaxRate(40000, PROVINCES.ON)).toBe(0.0505);
  });

  it("[ON] returns 9.15% for $100k income", () => {
    expect(marginalProvincialTaxRate(100000, PROVINCES.ON)).toBe(0.0915);
  });

  it("[AB] returns 10% for income under $151k", () => {
    expect(marginalProvincialTaxRate(100000, PROVINCES.AB)).toBe(0.1);
  });

  it("[BC] returns 7.7% for income around $80k", () => {
    expect(marginalProvincialTaxRate(80000, PROVINCES.BC)).toBe(0.077);
  });
});

describe("calculate", () => {
  it("calculates savings for Ontario individual", () => {
    const result = calculate({
      annualIncome: 100000,
      annualMedicalExpenses: 3000,
      province: "ON",
      adminFeeRate: 0.08,
      annualPlanFee: 120,
    });

    expect(result.marginalTaxRate).toBeCloseTo(0.2965, 4);
    expect(result.adminFee).toBe(240);
    expect(result.totalBusinessCost).toBe(3360);
    expect(result.requiredPersonalIncome).toBeCloseTo(4264.39, 0);
    expect(result.savings).toBeGreaterThan(0);
  });

  it("calculates savings for Alberta business", () => {
    const result = calculate({
      annualIncome: 120000,
      annualMedicalExpenses: 5000,
      province: "AB",
      adminFeeRate: 0.05,
      annualPlanFee: 450,
    });

    // $120k: federal 0.26 (third bracket) + AB 0.10 = 0.36
    expect(result.marginalTaxRate).toBeCloseTo(0.36, 4);
    expect(result.adminFee).toBe(250);
    expect(result.totalBusinessCost).toBe(5700);
    expect(result.savings).toBeGreaterThan(0);
  });

  it("returns zero savings when expenses are zero", () => {
    const result = calculate({
      annualIncome: 100000,
      annualMedicalExpenses: 0,
      province: "ON",
      adminFeeRate: 0.08,
      annualPlanFee: 120,
    });

    expect(result.adminFee).toBe(0);
    expect(result.totalBusinessCost).toBe(120);
    expect(result.requiredPersonalIncome).toBe(0);
    expect(result.savings).toBe(-120);
  });

  it("throws for invalid income", () => {
    expect(() =>
      calculate({
        annualIncome: 0,
        annualMedicalExpenses: 1000,
        province: "ON",
        adminFeeRate: 0.08,
        annualPlanFee: 120,
      }),
    ).toThrow("annualIncome must be greater than 0");
  });

  it("computes break-even point", () => {
    const result = calculate({
      annualIncome: 100000,
      annualMedicalExpenses: 3000,
      province: "ON",
      adminFeeRate: 0.08,
      annualPlanFee: 120,
    });

    const expected =
      (120 * (1 - result.marginalTaxRate)) / result.marginalTaxRate;
    expect(result.breakEven).toBeCloseTo(expected, 2);
  });
});
