#!/usr/bin/env node

import { calculate, marginalFederalTaxRate, marginalProvincialTaxRate } from "./calculator";
import { ProvinceCode, PROVINCES } from "./types";

const VALID_PROVINCES = Object.keys(PROVINCES) as ProvinceCode[];

function usage(): never {
  console.log(`
canada-hsa-calculator — Canadian HSA tax savings calculator
https://www.frontierhsa.ca/calculator

Usage:
  hsa-calc <income> <expenses> <province> [options]

Arguments:
  income        Annual pre-tax income (e.g., 100000)
  expenses      Annual medical expenses (e.g., 3000)
  province      Province code: ${VALID_PROVINCES.join(", ")}

Options:
  --admin-fee   Admin fee rate as percentage (default: 8)
  --plan-fee    Annual plan fee in dollars (default: 120)
  --json        Output as JSON
  --help, -h    Show this help

Examples:
  hsa-calc 100000 3000 ON
  hsa-calc 85000 5000 BC --admin-fee 5 --plan-fee 450
  hsa-calc 120000 2000 AB --json
`);
  process.exit(0);
}

function formatDollars(n: number): string {
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(n: number): string {
  return (n * 100).toFixed(2) + "%";
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    usage();
  }

  // Parse positional args
  const positional = args.filter(a => !a.startsWith("--"));
  if (positional.length < 3) {
    console.error("Error: requires 3 arguments: <income> <expenses> <province>");
    console.error("Run 'hsa-calc --help' for usage.");
    process.exit(1);
  }

  const income = parseFloat(positional[0]!);
  const expenses = parseFloat(positional[1]!);
  const provinceArg = positional[2]!.toUpperCase() as ProvinceCode;

  if (isNaN(income) || income <= 0) {
    console.error("Error: income must be a positive number");
    process.exit(1);
  }
  if (isNaN(expenses) || expenses < 0) {
    console.error("Error: expenses must be a non-negative number");
    process.exit(1);
  }
  if (!VALID_PROVINCES.includes(provinceArg)) {
    console.error(`Error: invalid province '${positional[2]}'. Must be one of: ${VALID_PROVINCES.join(", ")}`);
    process.exit(1);
  }

  // Parse options
  let adminFeeRate = 0.08;
  let annualPlanFee = 120;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--admin-fee" && args[i + 1]) {
      adminFeeRate = parseFloat(args[i + 1]!) / 100;
      i++;
    } else if (args[i] === "--plan-fee" && args[i + 1]) {
      annualPlanFee = parseFloat(args[i + 1]!);
      i++;
    } else if (args[i] === "--json") {
      jsonOutput = true;
    }
  }

  const result = calculate({
    annualIncome: income,
    annualMedicalExpenses: expenses,
    province: provinceArg,
    adminFeeRate,
    annualPlanFee,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const province = PROVINCES[provinceArg];

  console.log("");
  console.log("  Canadian HSA Tax Savings Calculator");
  console.log("  ===================================");
  console.log("");
  console.log(`  Province:           ${province.name} (${provinceArg})`);
  console.log(`  Annual Income:      ${formatDollars(income)}`);
  console.log(`  Medical Expenses:   ${formatDollars(expenses)}`);
  console.log("");
  console.log("  Tax Rates");
  console.log("  ---------");
  console.log(`  Federal marginal:   ${formatPercent(result.federalTaxRate)}`);
  console.log(`  Provincial marginal:${formatPercent(result.provincialTaxRate).padStart(8)}`);
  console.log(`  Combined marginal:  ${formatPercent(result.marginalTaxRate)}`);
  console.log("");
  console.log("  Comparison");
  console.log("  ----------");
  console.log(`  Without HSA:        ${formatDollars(result.requiredPersonalIncome)} pre-tax income needed`);
  console.log(`  With HSA:           ${formatDollars(result.totalBusinessCost)} total business cost`);
  console.log(`    Expenses:         ${formatDollars(expenses)}`);
  console.log(`    Admin fee:        ${formatDollars(result.adminFee)} (${(adminFeeRate * 100).toFixed(0)}%)`);
  console.log(`    Plan fee:         ${formatDollars(annualPlanFee)}/year`);
  console.log("");
  console.log(`  SAVINGS:            ${formatDollars(result.savings)}/year`);
  console.log(`  Break-even:         ${formatDollars(result.breakEven)} in expenses`);
  console.log("");
  console.log("  Try the full calculator: https://www.frontierhsa.ca/calculator");
  console.log("");
}

main();
