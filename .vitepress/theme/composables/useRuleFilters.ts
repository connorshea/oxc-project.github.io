import { computed, reactive, ref } from "vue";
import type { Category, Rule } from "../types/rules";
import { fixVariant } from "../components/utils/fixVariant";

export interface FilterState {
  query: string;
  scope: string | null;
  categories: Set<Category>;
  defaultOnly: boolean;
  fixOnly: boolean;
  hideUnsafe: boolean;
  typeAwareOnly: boolean;
}

export function useRuleFilters(rules: Rule[]) {
  const state = reactive<FilterState>({
    query: "",
    scope: null,
    categories: new Set<Category>(),
    defaultOnly: false,
    fixOnly: false,
    hideUnsafe: false,
    typeAwareOnly: false,
  });

  // `categories` lives on a reactive object, but Set mutations don't always
  // trigger downstream computeds when accessed via destructuring; keep a
  // bumped revision to force re-evaluation when callers mutate the Set.
  const revision = ref(0);
  const bump = () => {
    revision.value += 1;
  };

  const filtered = computed(() => {
    void revision.value;
    const q = state.query.trim().toLowerCase();

    return rules.filter((r) => {
      if (state.scope && r.scope !== state.scope) return false;
      if (state.categories.size && !state.categories.has(r.category)) return false;
      if (state.defaultOnly && !r.default) return false;

      const variant = fixVariant(r.fix);
      if (state.fixOnly && variant === null) return false;
      if (state.hideUnsafe && (variant === "auto-unsafe" || variant === "suggest-unsafe")) {
        return false;
      }
      if (state.typeAwareOnly && !r.type_aware) return false;

      if (q) {
        return r.value.toLowerCase().includes(q) || r.scope.toLowerCase().includes(q);
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
    state.scope = state.scope === id ? null : id;
  };

  const reset = () => {
    state.query = "";
    state.scope = null;
    state.categories.clear();
    state.defaultOnly = false;
    state.fixOnly = false;
    state.hideUnsafe = false;
    state.typeAwareOnly = false;
    bump();
  };

  return { state, filtered, toggleCategory, toggleScope, reset };
}
