<script setup lang="ts">
import rules from "@data/rules.json" with { type: "json" };
import type { Rule } from "../types/rules";
import { useRuleFilters } from "../composables/useRuleFilters";

const ruleList = rules as Rule[];
const { filtered } = useRuleFilters(ruleList);
</script>

<template>
  <div class="explorer">
    <div class="result-bar" aria-live="polite">
      Showing {{ filtered.length }} of {{ ruleList.length }} rules
    </div>
  </div>
</template>

<style scoped>
.explorer {
  margin-top: 1rem;
}

.result-bar {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 1rem 0;
}
</style>
