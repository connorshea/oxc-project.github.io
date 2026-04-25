<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import rules from "@data/rules.json" with { type: "json" };
import type { Category, Rule } from "../types/rules";
import { useRuleFilters, type TypeAwareMode } from "../composables/useRuleFilters";
import { fixVariant } from "./utils/fixVariant";
import { CATEGORY_DOT, displayPlugin } from "./utils/ruleUi";
import RuleRow from "./RuleRow.vue";

const ruleList = rules as Rule[];
const { state, filtered, toggleScope, toggleCategory, reset } = useRuleFilters(ruleList);
const validScopes = new Set(ruleList.map((r) => r.scope));

// `pending` rules map to the "planned" variant — the fix isn't actually
// available yet, so they're excluded from both the headline stat and the
// "Has fix" filter to match user expectations.
const hasAvailableFix = (r: Rule) => {
  const v = fixVariant(r.fix);
  return v !== null && v !== "planned";
};

const stats = computed(() => {
  const total = ruleList.length;
  const defaultCount = ruleList.filter((r) => r.default).length;
  const fixableCount = ruleList.filter(hasAvailableFix).length;
  return { total, defaultCount, fixableCount };
});

const pluginChips = computed(() => {
  const counts = new Map<string, number>();
  for (const r of ruleList) counts.set(r.scope, (counts.get(r.scope) ?? 0) + 1);
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, count]) => ({ id, label: displayPlugin(id), count }));
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

const categoryChips = computed(() => {
  const counts = new Map<Category, number>();
  for (const r of ruleList) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  return CATEGORY_ORDER.filter((id) => counts.has(id)).map((id) => ({
    id,
    count: counts.get(id) ?? 0,
  }));
});

// Sync filter state to and from the URL so people can bookmark or
// share a filtered view. Both directions live in onMounted because
// `window` doesn't exist during SSR; the initial render reflects
// default state and is hydrated to the URL state on mount.
const VALID_CATEGORIES = new Set<Category>(CATEGORY_ORDER);

const splitParam = (raw: string | null): string[] =>
  raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

onMounted(() => {
  const params = new URLSearchParams(window.location.search);

  const q = params.get("q");
  if (q) state.query = q;

  for (const id of splitParam(params.get("scope"))) {
    if (validScopes.has(id)) toggleScope(id);
  }
  for (const id of splitParam(params.get("category"))) {
    if (VALID_CATEGORIES.has(id as Category)) toggleCategory(id as Category);
  }

  if (params.get("default") === "true") state.defaultOnly = true;
  if (params.get("fix") === "true") state.fixOnly = true;
  const ta = params.get("type_aware");
  if (ta === "only" || ta === "exclude") state.typeAware = ta;

  watch(
    () => [
      state.query,
      [...state.scopes].sort().join(","),
      [...state.categories].sort().join(","),
      state.defaultOnly,
      state.fixOnly,
      state.typeAware,
    ],
    ([query, scopes, categories, defaultOnly, fixOnly, typeAware]) => {
      const next = new URLSearchParams(window.location.search);

      const setOrDelete = (key: string, value: string | boolean) => {
        if (value === true) next.set(key, "true");
        else if (typeof value === "string" && value) next.set(key, value);
        else next.delete(key);
      };

      setOrDelete("q", query as string);
      setOrDelete("scope", scopes as string);
      setOrDelete("category", categories as string);
      setOrDelete("default", defaultOnly as boolean);
      setOrDelete("fix", fixOnly as boolean);
      // "include" is the default and stays absent from the URL.
      setOrDelete(
        "type_aware",
        (typeAware as TypeAwareMode) === "include" ? "" : (typeAware as string),
      );

      const search = next.toString();
      const url = window.location.pathname + (search ? `?${search}` : "") + window.location.hash;
      window.history.replaceState(null, "", url);
    },
  );
});

const TYPE_AWARE_OPTIONS: { value: TypeAwareMode; label: string }[] = [
  { value: "include", label: "Include" },
  { value: "only", label: "Only" },
  { value: "exclude", label: "Exclude" },
];
</script>

<template>
  <div class="explorer">
    <ul class="stats">
      <li>Total number of rules: {{ stats.total }}</li>
      <li>Rules turned on by default: {{ stats.defaultCount }}</li>
      <li>Rules with fixes available: {{ stats.fixableCount }}</li>
    </ul>

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
        :class="{ active: state.scopes.has(p.id) }"
        :aria-pressed="state.scopes.has(p.id)"
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
      <fieldset class="segmented">
        <legend>Type-aware</legend>
        <div class="segment-track" role="presentation">
          <label
            v-for="opt in TYPE_AWARE_OPTIONS"
            :key="opt.value"
            class="segment"
            :class="{ active: state.typeAware === opt.value }"
          >
            <input v-model="state.typeAware" type="radio" name="type-aware" :value="opt.value" />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </fieldset>
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

.stats {
  margin: 0 0 1.25rem;
  padding-left: 1.25rem;
  font-size: 14px;
  color: var(--vp-c-text-1);
  font-variant-numeric: tabular-nums;
}

.stats li {
  margin: 0.15rem 0;
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

.segmented {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  margin: 0;
  padding: 0;
  /* Override Chrome's default min-inline-size for fieldsets so the
     control sits flush in the toggle row instead of stretching. */
  min-inline-size: auto;
}

.segmented legend {
  float: none;
  font-size: 13px;
  color: var(--vp-c-text-1);
  padding: 0;
}

.segment-track {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.segment {
  display: inline-flex;
  align-items: center;
  font-size: 12.5px;
  padding: 3px 10px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition:
    background-color 0.12s,
    color 0.12s;
}

.segment + .segment {
  border-left: 1px solid var(--vp-c-divider);
}

.segment:hover:not(.active) {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.segment.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.segment:focus-within {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}

.segment input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
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
