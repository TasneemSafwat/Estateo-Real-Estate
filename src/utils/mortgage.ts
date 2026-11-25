export interface MortgageAssumptions {
  /** Share of the price paid up front, 0 to 1. */
  downPayment: number;
  /** Yearly interest rate, 0 to 1. */
  annualRate: number;
  years: number;
}

export const DEFAULT_MORTGAGE: MortgageAssumptions = {
  downPayment: 0.2,
  annualRate: 0.065,
  years: 30,
};

/**
 * Standard amortised monthly payment. This is an illustration shown next to
 * listings, not a loan offer.
 */
export function estimateMonthlyPayment(
  price: number,
  assumptions: MortgageAssumptions = DEFAULT_MORTGAGE,
): number {
  const principal = price * (1 - assumptions.downPayment);
  const months = assumptions.years * 12;
  const rate = assumptions.annualRate / 12;
  if (principal <= 0 || months <= 0) return 0;
  if (rate === 0) return principal / months;
  const factor = (1 + rate) ** months;
  return (principal * rate * factor) / (factor - 1);
}
