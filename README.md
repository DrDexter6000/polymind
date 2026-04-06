# PolyMind 🧠

> **The Multi-Agent Harness for OpenClaw** — Intelligent task orchestration with adaptive learning

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-Plugin-blue)](https://openclaw.ai)

---

## 🙏 Acknowledgment

**PolyMind is deeply inspired by [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)** (48k+ ⭐), the dominant agent harness for OpenCode.

As a long-time user of oh-my-openagent, I was impressed by its elegant architecture and philosophy of "agent teams for intelligent coding." However, OpenClaw is fundamentally different from OpenCode — it's a **24/7 autonomous digital employee platform**, not a terminal pair-programmer.

**PolyMind is NOT a source port.** It is:
- An **adaptation** of oh-my-openagent's architecture philosophy for OpenClaw's unique characteristics
- A **ground-up implementation** leveraging OpenClaw's native APIs
- An **extension** adding new capabilities like long-term memory evolution and the Harness Framework

If you use OpenCode, go use oh-my-openagent — it's excellent. If you use OpenClaw, welcome to PolyMind.

---

## 🎯 What is PolyMind?

PolyMind brings **intelligent multi-agent orchestration** to OpenClaw:

```
┌────────────────────────────────────────────────────────────────┐
│  Your Request → Dispatcher → Specialist Agents → Results       │
│                                                                │
│  • Maestro (Strategic Planning)                               │
│  • Artisan (Code Generation)                                  │
│  • Scholar (Research & Analysis)                              │
│  • Scribe (Content Creation)                                  │
│  • Envoy (Communication)                                      │
│  • Warden (Security & Monitoring)                             │
└────────────────────────────────────────────────────────────────┘
```

### Key Differences from oh-my-openagent

| Aspect | oh-my-openagent (OpenCode) | PolyMind (OpenClaw) |
|--------|---------------------------|---------------------|
| **Platform** | Terminal-based | Multi-channel (Web/IM/Voice) |
| **Session** | Ephemeral | Persistent |
| **Operation** | Human-paired | Fully autonomous capable |
| **Memory** | Repository context | Long-term user learning |
| **Framework** | Task-level routing | **Harness Framework** (goal-level) |

---

## ✨ Features

### Core Capabilities

- **🎭 Multi-Agent Dispatch**: 6 specialized agents for different task types
- **🧠 Intelligent Routing**: Automatic model selection per agent via `before_model_resolve`
- **📚 Memory Evolution**: Learns your preferences from interactions
- **⏰ Autonomous Mode**: Self-triggered planning and execution
- **🔄 Parallel Execution**: Multiple subagents working simultaneously

### The Harness Framework

PolyMind introduces the **Harness Framework** — a goal-level orchestration system:

```bash
# Strategic planning mode
/omo plan: Build a personal website

# Execute current plan  
/omo work

# Check all active agents
/omo status

# Switch to specific agent mode
/omo agent artisan
```

---

## 🚀 Quick Start

### Installation

```bash
# Via ClawHub (when available)
clawhub install polymind

# Or manual install
git clone https://github.com/yourusername/polymind.git
cd polymind && npm install
```

### Configuration

Add to your `openclaw.json`:

```json
{
  "plugins": [
    {
      "id": "polymind",
      "path": "./skills/polymind"
    }
  ],
  "omo": {
    "agentModels": {
      "maestro": {
        "primary": "zhipu/GLM-5.1",
        "fallbacks": ["modelstudio/kimi-k2.5"]
      },
      "artisan": {
        "primary": "modelstudio/kimi-k2.5"
      }
    }
  }
}
```

### First Task

```
/omo plan: Research the latest AI agent frameworks and create a comparison report

PolyMind will:
1. Maestro breaks down the goal into subtasks
2. Oracle validates the plan
3. Scholar researches current frameworks
4. Scribe writes the comparison
5. Results aggregated and delivered
```

---

## 🏗️ Architecture

```
User Input
    │
    ▼
┌─────────────────────────────────────────┐
│  Intent Classification (Dispatcher)    │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
┌──────────────┐   ┌──────────────┐
│   Maestro    │   │ Direct Route │
│   (Plan)     │   │ (Simple)     │
└──────┬───────┘   └──────┬───────┘
       │                  │
       └────────┬─────────┘
                ▼
    ┌───────────────────────────┐
    │  Specialist Agent Pool    │
    │  • Artisan (Code)         │
    │  • Scholar (Research)     │
    │  • Scribe (Writing)       │
    │  • Envoy (Communication)  │
    │  • Warden (Security)      │
    └───────────┬───────────────┘
                │
                ▼
    ┌───────────────────────────┐
    │  OpenClaw sessions_spawn  │
    │  (Isolated subagents)     │
    └───────────────────────────┘
```

---

## 🎭 Agent Personas

| Agent | Role | Best For | Model Preference |
|-------|------|----------|------------------|
| **Maestro** | Strategic Planner | Complex multi-step goals | Reasoning models |
| **Oracle** | Plan Validator | Risk assessment, validation | Conservative models |
| **Dispatcher** | Task Router | Intent classification | Fast models |
| **Artisan** | Code Specialist | Programming, debugging | Coding-optimized |
| **Scholar** | Researcher | Web search, analysis | Balanced reasoning |
| **Scribe** | Content Writer | Documentation, drafts | Creative models |
| **Envoy** | Communicator | Notifications, summaries | Fast + TTS |
| **Warden** | Security Ops | Audits, monitoring | Conservative |

---

## 💡 Philosophy

### Why Free?

> "连 oh-my-openagent 都不收费，我有什么资格收费？"
> 
> — PolyMind Creator

We believe agent orchestration infrastructure should be:
- **Accessible**: No paywalls, no feature restrictions
- **Open**: Community-driven development
- **Evolving**: Learning from every user interaction

If PolyMind brings value to your workflow, consider [buying us a coffee ☕](https://buymeacoffee.com/polymind) (purely optional).

### Not ClawRouter

We respect ClawRouter's technical implementation, but we don't agree with:
- Pay-per-use routing fees
- Closed-source premium features
- Centralized control

PolyMind routes using **your own** model configurations. No middleman fees.

---

## 🛠️ Development

### Roadmap

- [x] Phase 0: Architecture design & PRD
- [ ] Phase 1: MVP (3 agents + basic orchestration)
- [ ] Phase 2: Full 8-agent suite
- [ ] Phase 3: Learning layer + autonomous mode
- [ ] Phase 4: Multi-channel coordination

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md).

Areas we need help:
- Additional specialist agents
- Memory system improvements
- Multi-channel adapters
- Documentation translations

---

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design & data flow
- [Agent API](./docs/AGENTS.md) - Creating custom agents
- [Configuration](./docs/CONFIG.md) - Full configuration reference
- [Changelog](./CHANGELOG.md) - Version history

---

## 🔗 Related Projects

| Project | Platform | Relationship |
|---------|----------|--------------|
| [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) | OpenCode | 🙏 Inspiration & philosophy |
| [ClawRouter](https://github.com/BlockRunAI/ClawRouter) | OpenClaw | Alternative (paid) routing |
| [OpenClaw](https://openclaw.ai) | — | Host platform |

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 🦐 Creator's Note

As a long-time oh-my-openagent user, I missed having similar orchestration power when I switched to OpenClaw. PolyMind is my attempt to