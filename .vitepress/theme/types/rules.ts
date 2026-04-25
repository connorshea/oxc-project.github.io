// Raw fix kinds emitted by the website crate. Kept verbatim from rules.json
// so the manifest is the single source of truth.
export type RawFix =
  | "none"
  | "pending"
  | "fixable_fix"
  | "conditional_fix"
  | "fixable_suggestion"
  | "conditional_suggestion"
  | "fixable_dangerous_fix"
  | "conditional_dangerous_fix"
  | "fixable_dangerous_suggestion"
  | "conditional_dangerous_suggestion"
  | "fixable_safe_fix_or_suggestion"
  | "conditional_safe_fix_or_suggestion"
  | "fixable_dangerous_fix_or_suggestion"
  | "conditional_dangerous_fix_or_suggestion";

// Coarser semantic grouping used by the UI to colour fix chips.
export type FixVariant = "auto" | "auto-unsafe" | "suggest" | "suggest-unsafe" | "planned";

export type Category =
  | "correctness"
  | "suspicious"
  | "perf"
  | "restriction"
  | "pedantic"
  | "style"
  | "nursery";

export interface Rule {
  scope: string;
  value: string;
  category: Category;
  type_aware: boolean;
  fix: RawFix;
  default: boolean;
  docs_url: string;
  version: string;
}
