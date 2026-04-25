import type { Category } from "../../types/rules";

// Display names for plugin scopes whose canonical name differs from the
// id used in rules.json (kebab-case vs snake_case).
export const PLUGIN_DISPLAY: Record<string, string> = {
  jsx_a11y: "jsx-a11y",
  react_perf: "react-perf",
};

// Map a raw scope id to the display string users see.
export const displayPlugin = (scope: string): string => PLUGIN_DISPLAY[scope] ?? scope;

// Canonical category dot colours, kept in one place so RulesExplorer
// chips and RuleRow badges never drift.
export const CATEGORY_DOT: Record<Category, string> = {
  correctness: "#E24B4A",
  suspicious: "#BA7517",
  perf: "#639922",
  restriction: "#888780",
  pedantic: "#7F77DD",
  style: "#378ADD",
  nursery: "#A05195",
};
