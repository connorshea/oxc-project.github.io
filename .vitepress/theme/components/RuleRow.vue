<script setup lang="ts">
import type { Category, Rule } from "../types/rules";
import { FIX_LABEL, fixVariant } from "./utils/fixVariant";

const props = defineProps<{ rule: Rule }>();

const PLUGIN_DISPLAY: Record<string, string> = {
  jsx_a11y: "jsx-a11y",
  react_perf: "react-perf",
};

const CATEGORY_DOT: Record<Category, string> = {
  correctness: "#E24B4A",
  suspicious: "#BA7517",
  perf: "#639922",
  restriction: "#888780",
  pedantic: "#7F77DD",
  style: "#378ADD",
  nursery: "#A05195",
};

const variant = fixVariant(props.rule.fix);
const variantClass =
  variant === "auto"
    ? "chip-safe"
    : variant === "auto-unsafe" || variant === "suggest-unsafe"
      ? "chip-unsafe"
      : variant === "suggest"
        ? "chip-info"
        : variant === "planned"
          ? "chip-muted"
          : "";
const fixLabel = variant ? FIX_LABEL[variant] : null;
const pluginDisplay = PLUGIN_DISPLAY[props.rule.scope] ?? props.rule.scope;
const href = `/docs/guide/usage/linter/rules/${props.rule.scope}/${props.rule.value}`;
</script>

<template>
  <div class="row">
    <div class="primary">
      <a :href="href" class="rule-name">{{ pluginDisplay }}/{{ rule.value }}</a>
    </div>
    <div class="meta">
      <span class="chip">
        <span class="dot" :style="{ background: CATEGORY_DOT[rule.category] }" />
        {{ rule.category }}
      </span>
      <span v-if="fixLabel" class="chip" :class="variantClass">{{ fixLabel }}</span>
      <span v-if="rule.default" class="chip chip-info">default</span>
      <span v-if="rule.type_aware" class="chip chip-muted">type-aware</span>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  padding: 10px 0;
  align-items: center;
}

.rule-name {
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  word-break: break-word;
}

.rule-name:hover {
  text-decoration: underline;
}

.meta {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 6px;
  white-space: nowrap;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.chip-safe {
  background: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
  border-color: transparent;
}

.chip-unsafe {
  background: var(--vp-c-yellow-soft);
  color: var(--vp-c-yellow-1);
  border-color: transparent;
}

.chip-info {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: transparent;
}

.chip-muted {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  border-color: transparent;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
</style>
