---
name: polymind
description: "Multi-agent harness for OpenClaw - intelligent task orchestration with adaptive learning"
version: 0.1.0
author: Master Dexter & Agent Research Division 🦐
license: MIT
parent: AGENTS.md
---

# PolyMind Skill

> **Intelligent Agent Orchestration for OpenClaw**

---

## 🎯 Quick Reference

| Command | Description |
|---------|-------------|
| `/omo plan <goal>` | Enter strategic planning mode |
| `/omo work` | Execute current plan |
| `/omo status` | Check active agents & tasks |
| `/omo agent <type>` | Switch to specific agent |
| `/omo pause` | Pause background tasks |
| `/omo resume` | Resume paused tasks |

---

## 🏗️ Architecture

PolyMind integrates with OpenClaw via **Plugin + Skill hybrid**:

```
┌────────────────────────────────────────────┐
│  OpenClaw Core                             │
│  ├── Plugin: before_model_resolve hook     │
│  │   └── Model routing per agent type      │
│  ├── Skill: Command handlers               │
│  │   └── /omo plan, /omo work, etc.       │
│  └── sessions_spawn                        │
│      └── SubAgent execution               │
└────────────────────────────────────────────┘
```

---

## 📋 Tool Usage

### When to Trigger PolyMind

| Scenario | Trigger |
|----------|---------|
| Complex multi-step task | `/omo plan: <description>` |
| Research + coding combination | Auto-trigger on complexity score |
| Need specific agent mode | `/omo agent <artisan\|scholar\|scribe>` |
| Check task progress | `/omo status` |
| Background task management | `/omo pause` / `/omo resume` |

### Complexity Auto-Detection

PolyMind automatically suggests `/omo plan` when:
- Task description > 100 tokens
- Multiple capability keywords detected
- User history shows similar tasks used planning

---

## 🎭 Agent Types

### Conductor Agents (Meta)

| Agent | Purpose | Trigger |
|-------|---------|---------|
| **Maestro** | Strategic planning, goal decomposition | `/omo plan` |
| **Oracle** | Plan validation, risk assessment | Before execution |
| **Dispatcher** | Route to specialists, load balance | Every task |

### Specialist Agents (Workers)

| Agent | Purpose | Model Preference |
|-------|---------|------------------|
| **Artisan** | Code generation, debugging | Coding-optimized |
| **Scholar** | Research, analysis | Reasoning |
| **Scribe** | Writing, documentation | Balanced |
| **Envoy** | Communication, notifications | Fast + TTS |
| **Warden** | Security, monitoring | Conservative |

---

## ⚙️ Configuration

### Minimal Config

```json
{
  "omo": {
    "enabled": true,
    "defaultAgent": "dispatcher",
    "autoPlanThreshold": 0.7
  }
}
```

### Full Config

```json
{
  "omo": {
    "enabled": true,
    "defaultAgent": "dispatcher",
    "autoPlanThreshold": 0.7,
    "agentModels": {
      "maestro": {
        "primary": "zhipu/GLM-5.1",
        "fallbacks": ["modelstudio/kimi-k2.5"]
      },
      "artisan": {
        "primary": "modelstudio/kimi-k2.5",
        "fallbacks": ["zhipu/GLM-5-Turbo"]
      },
      "scholar": {
        "primary": "zhipu/GLM-5.1",
        "fallbacks": ["modelstudio/kimi-k2.5"]
      },
      "envoy": {
        "primary": "minimax/MiniMax-M2.7-highspeed",
        "fallbacks": []
      },
      "warden": {
        "primary": "modelstudio/kimi-k2.5",
        "fallbacks": ["zhipu/GLM-5-Turbo"]
      }
    },
    "memory": {
      "enabled": true,
      "learningThreshold": 3
    },
    "autonomous": {
      "enabled": false,
      "cronSchedule": "0 9 * * *"
    }
  }
}
```

---

## 🔄 Execution Flow

```
User: /omo plan: Build a personal website

PolyMind:
1. Dispatcher analyzes intent → complexity HIGH
2. Maestro creates plan:
   - Research: current frameworks
   - Design: wireframe suggestions  
   - Code: implement chosen framework
   - Deploy: hosting setup
3. Oracle validates plan (risks: hosting cost, domain)
4. Dispatcher spawns parallel subagents:
   - Scholar: research
   - Artisan: prototype
5. Scribe aggregates results
6. User receives: plan + research + code
```

---

## 📊 State Management

| State | Location | Persistence |
|-------|----------|-------------|
| Task Queue | `.memory/omo/queue.json` | File-based |
| Active Sessions | OpenClaw API | Ephemeral |
| User Preferences | `memory/users/{id}/omo-preferences.md` | Long-term |
| Learning Patterns | `memory/topics/polymind/patterns/` | Long-term |

---

## 🚧 Current Status

**Version**: 0.1.0 (Design Phase)

**Implemented**: ❌ Not yet
**In Progress**: 📋 Architecture & planning
**Planned**: 
- [ ] Phase 1 MVP (4 weeks)
- [ ] Phase 2 Full suite (4 weeks)  
- [ ] Phase 3 Learning layer (4 weeks)

---

## 🔗 References

- [PRD](./PRD.md) - Product Requirements Document
- [README](./README.md) - User-facing documentation
- [Architecture](./docs/ARCHITECTURE.md) - Technical design
- oh-my-openagent: [GitHub](https://github.com/code-yeongyu/oh-my-openagent)

---

*PolyMind: Bringing the power of agent teams to OpenClaw* 🦐