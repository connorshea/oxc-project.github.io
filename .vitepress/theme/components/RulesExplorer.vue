<script setup lang="ts">
import { computed } from "vue";
import rules from "@data/rules.json" with { type: "json" };
import type { Category, Rule } from "../types/rules";
import { useRuleFilters } from "../composables/useRuleFilters";
import { fixVariant } from "./utils/fixVariant";
import RuleRow from "./RuleRow.vue";

const ruleList = rules as Rule[];
const { state, filtered, toggleScope, toggleCategory, reset } = useRuleFilters(ruleList);

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
        <span class="chip-count" aria-hidden="true">{{ p.count }}</span>
        <span class="sr-only">{{ p.count }} rules</span>
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
        <span class="dot" aria-hidden="true" :style="{ background: CATEGORY_DOT[c.id] }" />
        {{ c.id }}
        <span class="chip-count" aria-hidden="true">{{ c.count }}</span>
        <span class="sr-only">{{ c.count }} rules</span>
      </button>
    </fieldset>

    <div class="toggle-row">
      <label class="toggle">
        <input v-model="state.defaultOnly" type="checkbox" />
        On by default
      </label>
      <label class="toggle">
        <input v-model="state.fixOnly" type="checkbox" />
        Has fix
      </label>
      <label class="toggle">
        <input v-model="state.hideUnsafe" type="checkbox" />
        Hide unsafe fixes
      </label>
      <label class="toggle">
        <input v-model="state.typeAwareOnly" type="checkbox" />
        Type-aware only
      </label>
      <button type="button" class="reset" @click="reset">Reset</button>
    </div>

    <div class="result-bar" aria-live="polite">
      Showing {{ filtered.length }} of {{ ruleList.length }} rules
    </div>

    <p v-if="filtered.length === 0" class="empty" role="status">
      No rules match the current filters.
    </p>
    <ul v-else class="rule-list" role="list">
      <li v-for="r in filtered" :key="`${r.scope}/${r.value}`">
        <RuleRow :rule="r" />
      </li>
    </ul>
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

.toggle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin: 0.25rem 0 0.75rem;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.toggle input {
  cursor: pointer;
  accent-color: var(--vp-c-brand-1);
}

.reset {
  margin-left: auto;
  font-size: 12.5px;
  padding: 4px 10px;
  background: transparent;
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
}

.reset:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
}

.reset:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.result-bar {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0.5rem 0 0.5rem;
}

.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid var(--vp-c-divider);
}

.rule-list > li {
  margin: 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.rule-list > li:last-child {
  border-bottom: none;
}

.empty {
  padding: 2rem 0;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 14px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.dark .stat-card,
.dark .toggle-row {
  background: var(--vp-c-bg-alt);
}

@media (prefers-reduced-motion: reduce) {
  .chip-button,
  .search input,
  .reset {
    transition: none;
  }
}
</style>
