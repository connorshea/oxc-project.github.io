<script setup lang="ts">
import { computed } from "vue";
import rules from "@data/rules.json" with { type: "json" };
import type { Category, Rule } from "../types/rules";
import { useRuleFilters } from "../composables/useRuleFilters";
import { fixVariant } from "./utils/fixVariant";

const ruleList = rules as Rule[];
const { state, filtered, toggleScope, toggleCategory } = useRuleFilters(ruleList);

const stats = computed(() => {
  const total = ruleList.length;
  const defaultCount = ruleList.filter((r) => r.default).length;
  const fixableCount = ruleList.filter((r) => fixVariant(r.fix) !== null).length;
  const pluginCount = new Set(ruleList.map((r) => r.scope)).size;
  return { total, defaultCount, fixableCount, pluginCount };
});

const PLUGIN_DISPLAY: Record<string, string> = {
  jsx_a11y: "jsx-a11y",
  react_perf: "react-perf",
};

const pluginChips = computed(() => {
  const counts = new Map<string, number>();
  for (const r of ruleList) counts.set(r.scope, (counts.get(r.scope) ?? 0) + 1);
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, count]) => ({ id, label: PLUGIN_DISPLAY[id] ?? id, count }));
});

const CATEGORY_ORDER: Category[] = [
  "correctness",
  "suspicious",
  "perf",
  "restriction",
  "pedantic",
  "style",
  "nursery",
];

const CATEGORY_DOT: Record<Category, string> = {
  correctness: "#E24B4A",
  suspicious: "#BA7517",
  perf: "#639922",
  restriction: "#888780",
  pedantic: "#7F77DD",
  style: "#378ADD",
  nursery: "#A05195",
};

const categoryChips = computed(() => {
  const counts = new Map<Category, number>();
  for (const r of ruleList) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  return CATEGORY_ORDER.filter((id) => counts.has(id)).map((id) => ({
    id,
    count: counts.get(id) ?? 0,
  }));
});
</script>

<template>
  <div class="explorer">
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">total rules</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.defaultCount }}</div>
        <div class="stat-label">on by default</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.fixableCount }}</div>
        <div class="stat-label">with fixes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.pluginCount }}</div>
        <div class="stat-label">plugins</div>
      </div>
    </div>

    <div class="search">
      <input
        v-model="state.query"
        type="search"
        placeholder="Search rules by name or plugin…"
        aria-label="Search rules"
      />
    </div>

    <fieldset class="chip-group">
      <legend>Plugin</legend>
      <button
        v-for="p in pluginChips"
        :key="p.id"
        type="button"
        class="chip chip-button"
        :class="{ active: state.scope === p.id }"
        :aria-pressed="state.scope === p.id"
        @click="toggleScope(p.id)"
      >
        {{ p.label }}
        <span class="chip-count">{{ p.count }}</span>
      </button>
    </fieldset>

    <fieldset class="chip-group">
      <legend>Category</legend>
      <button
        v-for="c in categoryChips"
        :key="c.id"
        type="button"
        class="chip chip-button"
        :class="{ active: state.categories.has(c.id) }"
        :aria-pressed="state.categories.has(c.id)"
        @click="toggleCategory(c.id)"
      >
        <span class="dot" :style="{ background: CATEGORY_DOT[c.id] }" />
        {{ c.id }}
        <span class="chip-count">{{ c.count }}</span>
      </button>
    </fieldset>

    <div class="result-bar" aria-live="polite">
      Showing {{ filtered.length }} of {{ ruleList.length }} rules
    </div>
  </div>
</template>

<style scoped>
.explorer {
  margin-top: 1rem;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 1.25rem;
}

.stat-card {
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.stat-value {
  font-size: 26px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-1);
  line-height: 1.1;
}

.stat-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.search {
  margin-bottom: 0.75rem;
}

.search input {
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.search input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.chip-group {
  border: none;
  padding: 0;
  margin: 0 0 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.chip-group legend {
  width: 70px;
  flex: 0 0 70px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.chip-button {
  cursor: pointer;
  font-family: inherit;
  transition:
    background-color 0.12s,
    border-color 0.12s,
    color 0.12s;
}

.chip-button:hover {
  border-color: var(--vp-c-brand-2);
}

.chip-button.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.chip-button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.chip-count {
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.chip-button.active .chip-count {
  color: var(--vp-c-brand-1);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.result-bar {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0.5rem 0 1rem;
}
</style>
