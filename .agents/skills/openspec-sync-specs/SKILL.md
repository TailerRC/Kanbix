---
name: openspec-sync-specs
description: Sync delta specs from a change to main specs.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.5.0"
---

Sync delta specs from a change to main specs.

1. Run `openspec list --json` to select the change.
2. Run `openspec status --change "<name>" --json`.
3. Find delta specs from `artifactPaths.specs.existingOutputPaths`.
4. For each delta spec: read it, read the main spec at `openspec/specs/<capability>/spec.md`, apply changes (add/modify/remove/rename).
5. Show summary.

See `.opencode/skills/openspec-sync-specs/SKILL.md` for full reference.
