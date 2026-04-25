import { computed, reactive, ref } from "vue";
import type { Category, Rule } from "../types/rules";
import { fixVariant } from "../components/utils/fixVariant";
import { displayPlugin } from "../components/utils/ruleUi";

export interface FilterState {
  query: string;
  scopes: Set<string>;
  categories: Set<Category>;
  defaultOnly: boolean;
  fixOnly: boolean;
  typeAwareOnly: boolean;
}

export function useRuleFilters(rules: Rule[]) {
  const state = reactive<FilterState>({
    query: "",
    scopes: new Set<string>(),
    categories: new Set<Category>(),
    defaultOnly: false,
    fixOnly: false,
    typeAwareOnly: false,
  });

  // `scopes` and `categories` live on a reactive object, but Set mutations
  // don't always trigger downstream computeds when accessed via destructuring;
  // keep a bumped revision to force re-evaluation when callers mutate them.
  const revision = ref(0);
  const bump = () => {
    revision.value += 1;
  };

  const filtered = computed(() => {
    void revision.value;
    const q = state.query.trim().toLowerCase();

    return rules.filter((r) => {
      if (state.scopes.size && !state.scopes.has(r.scope)) return false;
      if (state.categories.size && !state.categories.has(r.category)) return false;
      if (state.defaultOnly && !r.default) return false;

      if (state.fixOnly) {
        const v = fixVariant(r.fix);
        if (v === null || v === "planned") return false;
      }
      if (state.typeAwareOnly && !r.type_aware) return false;

      if (q) {
        return (
          r.value.toLowerCase().includes(q) ||
          r.scope.toLowerCase().includes(q) ||
          displayPlugin(r.scope).toLowerCase().includes(q)
        );
      }
      return true;
    });
  });

  const toggleCategory = (id: Category) => {
    if (state.categories.has(id)) state.categories.delete(id);
    else state.categories.add(id);
    bump();
  };

  const toggleScope = (id: string) => {
    if (state.scopes.has(id)) state.scopes.delete(id);
    else state.scopes.add(id);
    bump();
  };

  const reset = () => {
    state.query = "";
    state.scopes.clear();
    state.categories.clear();
    state.defaultOnly = false;
    state.fixOnly = false;
    state.typeAwareOnly = false;
    bump();
  };

  return { state, filtered, toggleCategory, toggleScope, reset };
}
