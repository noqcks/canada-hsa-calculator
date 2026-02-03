# Canada HSA Calculator

A TypeScript library for calculating tax savings from a Health Spending Account (HSA) for Canadian small businesses. Includes 2025 federal and provincial tax brackets for all provinces.

**[Try the live calculator at Frontier HSA](https://www.frontierhsa.ca/calculator)**

## What is an HSA?

A Health Spending Account (also called a Health Care Spending Account or HCSA) lets Canadian incorporated businesses pay for medical expenses with pre-tax corporate dollars instead of after-tax personal income. This can save 25-50% depending on your province and income level.

## Install

```bash
npm install @frontierhsa/canada-hsa-calculator
```

## CLI

```bash
# Install globally
npm install -g @frontierhsa/canada-hsa-calculator

# Calculate savings: hsa-calc <income> <expenses> <province>
hsa-calc 100000 3000 ON

#   Canadian HSA Tax Savings Calculator
#   ===================================
#
#   Province:           Ontario (ON)
#   Annual Income:      $100,000.00
#   Medical Expenses:   $3,000.00
#
#   Tax Rates
#   ---------
#   Federal marginal:   20.50%
#   Provincial marginal:  9.15%
#   Combined marginal:  29.65%
#
#   Comparison
#   ----------
#   Without HSA:        $4,264.39 pre-tax income needed
#   With HSA:           $3,360.00 total business cost
#
#   SAVINGS:            $904.39/year

# Custom admin fee and plan fee
hsa-calc 85000 5000 BC --admin-fee 5 --plan-fee 450

# JSON output for scripting
hsa-calc 120000 2000 AB --json
```

## Usage

```ts
import { calculate } from "@frontierhsa/canada-hsa-calculator";

const result = calculate({
  annualIncome: 100000,
  annualMedicalExpenses: 3000,
  province: "ON",
  adminFeeRate: 0.08,   // 8% admin fee
  annualPlanFee: 120,    // $120/year platform fee
});

console.log(result.savings);            // 905.32 — yearly tax savings
console.log(result.marginalTaxRate);    // 0.2965 — combined marginal rate
console.log(result.totalBusinessCost);  // 3360   — total HSA cost
console.log(result.breakEven);          // 284.62 — min expenses to save money
```

## API

### `calculate(input)`

Main function. Returns tax savings from running medical expenses through an HSA vs. paying out of pocket.

**Input:**

| Field | Type | Description |
|---|---|---|
| `annualIncome` | `number` | Annual pre-tax income |
| `annualMedicalExpenses` | `number` | Annual medical expenses |
| `province` | `ProvinceCode` | Province code (`"ON"`, `"BC"`, `"AB"`, etc.) |
| `adminFeeRate` | `number` | Admin fee rate as decimal (e.g., `0.08` = 8%) |
| `annualPlanFee` | `number` | Annual platform fee in dollars |

**Output (`CalculatorResult`):**

| Field | Type | Description |
|---|---|---|
| `savings` | `number` | Total yearly tax savings |
| `marginalTaxRate` | `number` | Combined federal + provincial marginal rate |
| `federalTaxRate` | `number` | Federal marginal rate |
| `provincialTaxRate` | `number` | Provincial marginal rate |
| `adminFee` | `number` | Admin fee amount |
| `totalBusinessCost` | `number` | Total cost through HSA |
| `requiredPersonalIncome` | `number` | Pre-tax income needed without HSA |
| `annualPlanFee` | `number` | Annual plan fee |
| `breakEven` | `number` | Minimum expenses for HSA to save money |

### Tax Rate Functions

```ts
import {
  marginalFederalTaxRate,
  marginalProvincialTaxRate,
  effectiveFederalTaxRate,
  effectiveProvincialTaxRate,
  PROVINCES,
} from "@frontierhsa/canada-hsa-calculator";

// Marginal rates (rate on the next dollar earned)
marginalFederalTaxRate(100000);                    // 0.205
marginalProvincialTaxRate(100000, PROVINCES.ON);   // 0.0915

// Effective rates (average rate across all income)
effectiveFederalTaxRate(100000);                    // 0.1734
effectiveProvincialTaxRate(100000, PROVINCES.ON);   // 0.0698
```

### Tax Bracket Data

```ts
import { FEDERAL_TAX_BRACKETS, PROVINCES } from "@frontierhsa/canada-hsa-calculator";

// 2025 federal brackets
console.log(FEDERAL_TAX_BRACKETS);
// [
//   { threshold: 57375, rate: 0.15 },
//   { threshold: 114750, rate: 0.205 },
//   { threshold: 177882, rate: 0.26 },
//   { threshold: 253414, rate: 0.29 },
//   { threshold: Infinity, rate: 0.33 },
// ]

// All provinces
Object.keys(PROVINCES); // ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "SK", "YT"]
```

## Supported Provinces

| Code | Province |
|---|---|
| AB | Alberta |
| BC | British Columbia |
| MB | Manitoba |
| NB | New Brunswick |
| NL | Newfoundland and Labrador |
| NS | Nova Scotia |
| ON | Ontario |
| PE | Prince Edward Island |
| SK | Saskatchewan |
| YT | Yukon |

## How the Math Works

1. **Marginal tax rate** = federal marginal rate + provincial marginal rate for your income bracket
2. **Without HSA**: You need `expenses / (1 - marginalTaxRate)` in pre-tax income to cover medical costs
3. **With HSA**: You pay `expenses + adminFee + planFee` as a deductible business expense
4. **Savings** = what you'd need without HSA - what you pay with HSA

Example: $3,000 in medical expenses at a 29.65% marginal rate
- Without HSA: need $4,265 pre-tax income
- With HSA: pay $3,360 (expenses + 8% admin + $120 fee)
- Savings: **$905/year**

## Development

```bash
npm install
npm test
npm run build
```

## License

MIT - [Frontier HSA](https://www.frontierhsa.ca)
