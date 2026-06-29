---
name: openspec-propose
description: Propose a new change with all artifacts generated in one step.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.5.0"
---

Propose a new change - create the change and generate all artifacts in one step.

## Step 0 — MUST: Load sdd-docs and read docs/
Before creating any artifact, load the `sdd-docs` skill. Identify the module from the change name, then read:
- `docs/README.md`
- `docs/contratos/moduloN_*.md` (the relevant contract)
- `docs/reglas_negocio.md`
- `docs/matriz_roles_permisos.md`
- Any relevant ADRs from `docs/adr/`

All artifacts must be based on these docs.

## Steps
1. Run `openspec new change "<name>"`.
2. Run `openspec status --change "<name>" --json`.
3. Loop through artifacts in dependency order: get instructions with `openspec instructions <artifact-id> --change "<name>" --json`, read dependencies, write artifact.
4. Continue until all `applyRequires` artifacts are done.
5. Show final status with `openspec status --change "<name>"`.

See `.opencode/skills/openspec-propose/SKILL.md` for full reference.
