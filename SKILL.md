---
name: polymind
description: "Intelligent LLM router for OpenClaw - turn-level scene + complexity aware model routing with fallback chains"
version: 0.1.0
author: DrDexter6000
license: MIT
---

# PolyMind

## Commands

| Command | Description |
|---------|-------------|
| `/polymind setup` | Scan installed models, recommend optimal routing config, write to openclaw.json |
| `/polymind status` | Show routing table (scene x complexity matrix), active state, fallback events |
| `/polymind config` | Edit routing config (models, scene mappings, complexity tiers, enable/disable) |

## Plugin Hooks

| Hook | Purpose |
|------|---------|
| `before_model_resolve` | Default turn-level routing; short high-confidence continuations may inherit prior scene before returning `{ modelOverride, providerOverride }` |

## Routing Dimensions

### Scene (what type of task)

| Scene | Trigger | Strategy |
|-------|---------|----------|
| `coding` | Code generation, debugging, refactoring | Best coding model |
| `reasoning` | Analysis, planning, complex reasoning | Best reasoning model |
| `writing` | Docs, emails, content creation | Best writing model |
| `fast` | Short Q&A, confirmations, chat | Fastest model |

### Complexity (what tier of model)

| Complexity | Trigger | Effect |
|------------|---------|--------|
| `high` | Long message, code blocks, multi-file, multi-step | Route to top-tier model |
| `medium` | Default | Route to balanced model |
| `low` | Short, follow-up, single-step | Route to lightweight model |

## Configuration

Config lives in `openclaw.json` under the `polymind` key. Supports both flat and tiered formats:

```json
{
  "polymind": {
    "enabled": true,
    "modelHints": {
      "claude-opus": { "scenes": ["coding", "reasoning"], "tier": 1 }
    },
    "routes": {
      "<scene>": {
        "high":   { "primary": "<provider/model>", "fallbacks": ["..."] },
        "medium": { "primary": "<provider/model>", "fallbacks": ["..."] },
        "low":    { "primary": "<provider/model>", "fallbacks": ["..."] }
      },
      "fast": {
        "primary": "<provider/model>",
        "fallbacks": ["..."]
      }
    }
  }
}
```

Flat format (no complexity tiers) is also supported for simpler setups.

`modelHints` is optional. It overrides or extends the built-in setup-time capability seed used by `/polymind setup`.

## Dependencies

- OpenClaw Plugin API: `before_model_resolve` hook
- OpenClaw Skill API: command registration
