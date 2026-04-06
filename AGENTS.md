# AGENTS.md — PolyMind

## Project Status

**Documentation-only** as of 2026-04. All 4 implementation phases are pending (Phase 0–3).
No `src/`, `package.json`, `tsconfig.json`, or any executable code exists yet.

## What This Is

OpenClaw Skill for automatic per-turn LLM routing. Classifies each user message by scene (coding/reasoning/writing/fast) + complexity (high/medium/low) and routes to the optimal model via `before_model_resolve` plugin hook.

## Source of Truth

- **Product definition**: `README.md` (the SSOT — all other docs defer to it)
- **Requirements detail**: `.dev/docs/PRD.md`
- **Architecture**: `.dev/docs/ARCHITECTURE.md`
- **Implementation plans**: `.dev/docs/phase-{0,1,2,3}-*.md` (TDD-style with red/green test specs)
- **Roadmap**: `.dev/docs/ROADMAP.md`
- **Skill manifest**: `SKILL.md`

## Architecture (Planned)

```
src/
├── contract/         # Local OpenClaw host contract until official types exist
│   └── openclaw.ts           # Plugin/skill host interfaces + test doubles
├── plugin/           # before_model_resolve hook + routing engine
│   ├── index.ts              # Plugin entry, registers hook
│   ├── continuation-detector.ts # High-confidence short follow-up detection
│   ├── types.ts              # Scene, Complexity, RouteConfig, PolyMindConfig, RouteResult
│   ├── scene-classifier.ts   # Keyword + heuristic rules (CN + EN), no LLM calls
│   ├── complexity-estimator.ts  # Message length + structure signals, <10ms
│   └── route-resolver.ts     # (scene, complexity) → route table lookup + fallback
└── skill/            # /polymind user commands
    ├── index.ts      # Subcommand router
    ├── model-hints.ts # Built-in capability seed + user override merge
    ├── setup.ts      # Onboarding — scan models, recommend config
    ├── status.ts     # Show routing table
    └── config.ts     # Modify routing config
```

Plugin and Skill layers are strictly isolated — Skill never imports from Plugin.

## Key Constraints

- **Zero runtime dependencies** (Stage 1 target)
- **Zero LLM token cost** for routing — all classification is local rules
- **Default turn-level routing** — no persistent session cache; only high-confidence short continuations may inherit prior scene/complexity heuristically
- **Total routing latency < 60ms** (classify + estimate + resolve)
- **Config lives in `openclaw.json` under `polymind` key** — no separate config files
- **No `.polymind/` directory in Stage 1** — persistence comes in Stage 3
- **No `any` type** — enforced by ESLint rule `@typescript-eslint/no-explicit-any: error`
- Routing failure → return `null` silently → OpenClaw uses default model. Never throw, never block.
- Setup-time model capability mapping starts with a built-in seed, but user `polymind.modelHints` overrides it.

## Dev Commands (After Phase 0)

```bash
npm run build    # tsc
npm test         # vitest run
npm run lint     # eslint src/
```

## Implementation Order

Phase 0 (scaffold) → Phase 1 (plugin core) → Phase 2 (skill commands) → Phase 3 (integration + release).
Each phase doc in `.dev/docs/` has exact tasks, test cases, and acceptance criteria.
Executing agents **must** fill in the execution report template at the bottom of each phase doc.

## Gotchas for Agents

- `SceneRouteConfig` supports **both** flat (`RouteConfig`) and tiered (`Record<Complexity, RouteConfig>`) formats. RouteResolver must detect and handle both.
- Complexity fallback order: `low → medium → high` (if requested tier is missing, try next tier up).
- `fast` scene skips complexity estimation entirely — goes straight to RouteResolver.
- Continuation detection is **not** full session memory. It only handles high-confidence, very short follow-up messages and should prefer inheriting `scene` while defaulting `complexity` to `low`.
- `"provider/model"` string must be split into `{ modelOverride, providerOverride }`. Handle missing provider (no `/`).
- Model capability tags use **fuzzy matching** against model names (e.g., `'claude-opus'` matches `'claude-opus-4-6'`), but user `modelHints` must override built-ins.
- The OpenClaw Plugin/Skill API (`context.registerHook`, `hookContext.getConfig`, etc.) has no published type definitions yet. Create and use `src/contract/openclaw.ts`; do not leak host-specific guesses across the codebase.

## Testing

- Framework: **vitest** (lightweight, native TS)
- Phase 1 requires **38+ unit tests** across 4 test files (14 classifier + 10 estimator + 8 resolver + 6 plugin entry)
- Phase 2 adds **18+ tests** across 4 skill test files
- Phase 3 adds **6 integration tests** in `src/integration.test.ts`
- Coverage target: plugin/ > 90%, skill/ > 85%
