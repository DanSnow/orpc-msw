<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Version Control

This project uses **jj (Jujutsu)** instead of git for version control.

Common commands:
- `jj status` - Show working copy changes
- `jj log` - Show commit history
- `jj commit -m "message"` - Commit working copy with message and start new change
- `jj new` - Create a new change on top of the current one
- `jj squash` - Squash changes into parent commit