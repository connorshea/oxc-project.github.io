---
title: Linter
outline: deep
---

# Linter

## Contributing New Rules

See the [adding rules](./linter/adding-rules.md) guide for how to add new rules to Oxlint.

## Development

Create a `./test.ts` and then

```bash
just watch "cargo run --bin oxlint -- test.ts"
```

Or test and filter against the rule:

```bash
just watch "cargo test -p oxc_linter -- rule-name"
```

### Snapshot Testing

[`cargo insta`](https://insta.rs/docs) is used for snapshot testing.

After running `cargo test -p oxc_linter` and the line `Tester::new(RULE::NAME, pass, fail).test_and_snapshot()` is called, a new `rule.snap.new` file will be generated.

Use `cargo insta accept` to accept all snapshot changes.

## Rule Category

- **correctness** - code that is outright wrong or useless
- **suspicious** - code that is most likely wrong or useless
- **pedantic** - lints which are rather strict or have occasional false positives
- **perf** - code that can be written to run faster
- **style** - code that should be written in a more idiomatic way
- **restriction** - lints should be considered on a case-by-case basis before enabling.
- **nursery** - new lints that are still under development
