<script setup lang="ts">
import type { Rule } from "../types/rules";
import { FIX_LABEL, fixVariant } from "./utils/fixVariant";
import { CATEGORY_DOT, displayPlugin } from "./utils/ruleUi";

const props = defineProps<{ rule: Rule }>();

// Match the Alert banners on the per-rule page: every fix kind shares
// the "info" alert, so every fix chip uses the info variant. The text
// label (e.g. "auto-fix · unsafe") still distinguishes the kind.
const variant = fixVariant(props.rule.fix);
const fixLabel = variant ? FIX_LABEL[variant] : null;
const pluginDisplay = displayPlugin(props.rule.scope);
const href = `/docs/guide/usage/linter/rules/${props.rule.scope}/${props.rule.value}`;
</script>

<template>
  <div class="row">
    <div class="primary">
      <a :href="href" class="rule-name">{{ pluginDisplay }}/{{ rule.value }}</a>
      <p class="rule-desc">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </p>
    </div>
    <div class="meta">
      <span class="chip">
        <span class="dot" aria-hidden="true" :style="{ background: CATEGORY_DOT[rule.category] }" />
        {{ rule.category }}
      </span>
      <span v-if="fixLabel" class="chip chip-info">{{ fixLabel }}</span>
      <span v-if="rule.default" class="chip chip-success">default</span>
      <span v-if="rule.type_aware" class="chip chip-info">type-aware</span>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  padding: 12px 0;
  align-items: start;
}

.primary {
  min-width: 0;
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

.rule-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 3px 0 0;
  line-height: 1.5;
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

/* Mirror the colours used by Alert.vue on individual rule pages so a
 * "default" badge matches the success banner and a "fix" or
 * "type-aware" badge matches the info banner. */
.chip-success {
  background: #e5f0e5;
  border-color: #b7e1a1;
  color: #2c662d;
}

.chip-info {
  background: #f0f4f9;
  border-color: #a1c0e1;
  color: #2c4d66;
}

:global(.dark) .chip-success {
  background: #2c662d;
  border-color: #b7e1a1;
  color: #f0f9eb;
}

:global(.dark) .chip-info {
  background: #2c4d66;
  border-color: #a1c0e1;
  color: #f0f4f9;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
</style>
