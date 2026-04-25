import type { FixVariant, RawFix } from "../../types/rules";

// Map every concrete fix kind to its semantic UI bucket.
// `_fix_or_suggestion` kinds expose both an auto-fix and a suggestion,
// so they get their own `mixed` bucket rather than collapsing into "auto".
const VARIANT: Record<Exclude<RawFix, "none">, FixVariant> = {
  pending: "planned",
  fixable_fix: "auto",
  conditional_fix: "auto",
  fixable_suggestion: "suggest",
  conditional_suggestion: "suggest",
  fixable_safe_fix_or_suggestion: "mixed",
  conditional_safe_fix_or_suggestion: "mixed",
  fixable_dangerous_fix: "auto-unsafe",
  conditional_dangerous_fix: "auto-unsafe",
  fixable_dangerous_suggestion: "suggest-unsafe",
  conditional_dangerous_suggestion: "suggest-unsafe",
  fixable_dangerous_fix_or_suggestion: "mixed-unsafe",
  conditional_dangerous_fix_or_suggestion: "mixed-unsafe",
};

export const fixVariant = (fix: RawFix): FixVariant | null => {
  return fix === "none" ? null : VARIANT[fix];
};

export const FIX_LABEL: Record<FixVariant, string> = {
  auto: "auto-fix",
  "auto-unsafe": "auto-fix · unsafe",
  suggest: "suggestion",
  "suggest-unsafe": "suggestion · unsafe",
  mixed: "auto-fix + suggestion",
  "mixed-unsafe": "auto-fix + suggestion · unsafe",
  planned: "fix planned",
};
