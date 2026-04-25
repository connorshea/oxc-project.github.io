<script setup lang="ts">
import { computed } from "vue";
import rules from "@data/rules.json" with { type: "json" };
import type { Rule } from "../types/rules";
import { useRuleFilters } from "../composables/useRuleFilters";
import { fixVariant } from "./utils/fixVariant";

const ruleList = rules as Rule[];
const { state, filtered } = useRuleFilters(ruleList);

const stats = computed(() => {
  const total = ruleList.length;
  const defaultCount = ruleList.filter((r) => r.default).length;
  const fixableCount = ruleList.filter((r) => fixVariant(r.fix) !== null).length;
  const pluginCount = new Set(ruleList.map((r) => r.scope)).size;
  return { total, defaultCount, fixableCount, pluginCount };
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

.result-bar {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0.5rem 0 1rem;
}
</style>
