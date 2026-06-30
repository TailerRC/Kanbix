---
name: openspec-archive-change
description: Archive a completed change. Use when the user wants to finalize and archive a change after implementation.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.5.0"
---

Archive a completed change.

1. Run `openspec list --json` to select the change.
2. Run `openspec status --change "<name>" --json`.
3. Check task completion in tasks file.
4. Run `openspec archive <name>`.
5. Show summary.

See `.opencode/skills/openspec-archive-change/SKILL.md` for full reference.
