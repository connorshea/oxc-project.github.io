import type { FixVariant, RawFix } from "../../types/rules";

// Map every concrete fix kind to one of five UI buckets.
// Mixed "fix or suggestion" entries follow the dangerous flag for the chip
// colour, since unsafe is the property a user most wants surfaced.
const VARIANT: Record<Exclude<RawFix, "none">, FixVariant> = {
  pending: "planned",
  fixable_fix: "auto",
  conditional_fix: "auto",
  fixable_suggestion: "suggest",
  conditional_suggestion: "suggest",
  fixable_safe_fix_or_suggestion: "auto",
  conditional_safe_fix_or_suggestion: "auto",
  fixable_dangerous_fix: "auto-unsafe",
  conditional_dangerous_fix: "auto-unsafe",
  fixable_dangerous_suggestion: "suggest-unsafe",
  conditional_dangerous_suggestion: "suggest-unsafe",
  fixable_dangerous_fix_or_suggestion: "auto-unsafe",
  conditional_dangerous_fix_or_suggestion: "auto-unsafe",
};

export const fixVariant = (fix: RawFix): FixVariant | null => {
  return fix === "none" ? null : VARIANT[fix];
};

export const FIX_LABEL: Record<FixVariant, string> = {
  auto: "auto-fix",
  "auto-unsafe": "auto-fix · unsafe",
  suggest: "suggest",
  "suggest-unsafe": "suggest · unsafe",
  planned: "fix planned",
};
