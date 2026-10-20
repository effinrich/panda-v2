---
# Paths Claude may edit (globs). Empty means anywhere. Set this per task, e.g. ['packages/native/**'].
scope: []
# Paths Claude must not edit. Both hold inline CSS output snapshots; lift per task only with explicit approval.
forbid:
  - 'crates/pandacss_stylesheet/tests/**'
  - 'sandbox/codegen/__tests__/**'
# Commands that must pass before finishing or committing. Empty means the typecheck, lint and test scripts from package.json.
checks: []
---
