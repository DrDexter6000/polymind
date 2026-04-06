# Oh My OpenClaw (OMO) - Product Requirements Document

> **Project Codename**: OMO (Oh My OpenClaw)  
> **Status**: PRD v1.0 - Market Analysis & Architecture  
> **Date**: 2026-04-06  
> **Author**: Agent Research Division 🦐

---

## 📊 Executive Summary

### The Gap

**oh-my-openagent** (48.7k ⭐, created 2025-12-03) is the dominant agent harness for **OpenCode** (terminal-based coding agent), but **ZERO equivalent exists for OpenClaw**.

| Platform | Harness | Stars | Status |
|----------|---------|-------|--------|
| OpenCode | oh-my-openagent | 48,689 | ✅ Dominant |
| OpenClaw | **None** | 0 | 🚨 **Market Gap** |

### The Opportunity

OpenClaw is a **24/7 autonomous digital employee** platform, fundamentally different from OpenCode's "pair programmer" model. It needs a harness optimized for:
- **Multi-channel** (not just terminal)
- **Persistent sessions** (not ephemeral)
- **Autonomous execution** (not human-paired)
- **Memory & learning** (not stateless)

---

## 🎯 1. Market Positioning

### 1.1 Competitive Landscape

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Agent Harness Market Map                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   OpenCode Ecosystem                    OpenClaw Ecosystem                  │
│   ┌──────────────────────┐              ┌──────────────────────┐            │
│   │ oh-my-openagent      │              │ 🚨 EMPTY 🚨          │            │
│   │ (48.7k stars)        │              │                      │            │
│   │ • Terminal-first     │              │  Our target market   │            │
│   │ • Coding-focused     │              │  is completely       │            │
│   │ • Human-paired       │              │  unoccupied!         │            │
│   └──────────────────────┘              └──────────────────────┘            │
│                                                                              │
│   Cross-Platform                                                             │
│   ┌──────────────────────┐                                                   │
│   │ ClawRouter           │  (Model routing only, not full harness)          │
│   │ (6.1k stars)         │                                                   │
│   └──────────────────────┘                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Differentiation Strategy

| Dimension | oh-my-openagent (OpenCode) | Oh My OpenClaw (Our Product) |
|-----------|---------------------------|------------------------------|
| **Core Metaphor** | Pair programmer | Digital employee team |
| **Session Model** | Ephemeral terminal | Persistent, multi-channel |
| **User Presence** | Human always present | Fully autonomous capable |
| **Memory** | Repo context only | Long-term user memory |
| **Channels** | Terminal only | Multi-channel (Web, IM, Voice) |
| **Orchestration** | Task-level | Goal-level + Lifecycle |
| **Learning** | Static config | Dynamic preference learning |

### 1.3 Target Users

**Primary**: OpenClaw power users who want structured multi-agent workflows
- Running 10+ concurrent projects
- Managing multiple communication channels
- Need autonomous background task execution
- Want intelligent task routing without manual configuration

**Secondary**: Teams transitioning from OpenCode to OpenClaw
- Familiar with oh-my-openagent patterns
- Need similar orchestration but for autonomous mode

---

## 🏗️ 2. System Architecture

### 2.1 Core Concept: "Agent Teams for Autonomous Operations"

Unlike OpenCode's "pair programming" metaphor, OpenClaw needs **"digital employee teams"**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Oh My OpenClaw Architecture                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     CONDUCTOR LAYER                                  │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │  │  Maestro    │  │   Oracle    │  │  Dispatcher │                 │   │
│   │  │ (Strategic) │  │ (Planning)  │  │  (Routing)  │                 │   │
│   │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │   │
│   │         └─────────────────┴─────────────────┘                        │   │
│   │                          │                                           │   │
│   │                    Task Queue (Redis/Bull)                          │   │
│   │                          │                                           │   │
│   └──────────────────────────┼──────────────────────────────────────────┘   │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     SPECIALIST LAYER                               │   │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│   │  │  Scribe │ │ Artisan │ │ Scholar │ │  Envoy  │ │ Warden  │       │   │
│   │  │ (Write) │ │ (Code)  │ │ (Research)│ │(Comm)  │ │(Sec/Ops)│       │   │
│   │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│   │       └───────────┴───────────┴───────────┴───────────┘              │   │
│   │                           │                                          │   │
│   └───────────────────────────┼──────────────────────────────────────────┘   │
│                               ▼                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     EXECUTION LAYER                                │   │
│   │              OpenClaw sessions_spawn / cron                         │   │
│   │                                                                     │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │  │  SubAgent 1 │  │  SubAgent 2 │  │  SubAgent N │                 │   │
│   │  │ (Isolated)  │  │ (Isolated)  │  │ (Isolated)  │                 │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     LEARNING LAYER (Optional v2)                   │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │  │ Preference  │  │  Pattern    │  │ Performance │                 │   │
│   │  │  Engine     │  │  Matcher    │  │  Analyzer   │                 │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Agent Definitions

#### Conductor Agents (Meta-Agents)

| Agent | Role | Model | Trigger |
|-------|------|-------|---------|
| **Maestro** | Strategic planning, goal decomposition | Reasoning model | `/omo plan` or auto on complex tasks |
| **Oracle** | Plan validation, risk assessment | Reasoning model | Before execution, on Maestro plan |
| **Dispatcher** | Route tasks to specialists, load balance | Fast model | Every incoming task |

#### Specialist Agents (Worker Agents)

| Agent | Role | Model | Capabilities |
|-------|------|-------|--------------|
| **Scribe** | Content creation, documentation | Balanced | Write, edit, summarize |
| **Artisan** | Code generation, debugging | Coding-optimized | Dev tools, MCPs, ACP |
| **Scholar** | Research, analysis, fact-checking | Reasoning | Web search, data analysis |
| **Envoy** | Communication, notifications | Fast + TTS | Multi-channel messaging |
| **Warden** | Security review, ops monitoring | Conservative | Health checks, audits |

### 2.3 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Task Lifecycle Flow                                  │
└─────────────────────────────────────────────────────────────────────────────┘

User Input / Cron Trigger / External Event
    │
    ▼
┌────────────────────────────────────────┐
│  Step 1: Intention Classification      │  ← Dispatcher analyzes intent
│  • Channel context                     │
│  • Urgency level                       │
│  • Complexity score                    │
│  • Required capabilities               │
└────────────┬───────────────────────────┘
             │
    ┌────────┴────────┐
    │ Complex? (>10 steps) │
    └────┬────────────┘
    Yes  │            │ No
    ┌────┘            └────┐
    ▼                      ▼
┌────────────────┐    ┌────────────────┐
│ Maestro plans  │    │ Skip planning  │
│ Oracle reviews │    │ Direct dispatch│
└───────┬────────┘    └───────┬────────┘
        │                     │
        └──────────┬──────────┘
                   ▼
        ┌────────────────────────┐
        │  Step 2: Specialist    │  ← Model routing via before_model_resolve
        │  Selection & Dispatch  │
        │  • Match capability    │
        │  • Check availability  │
        │  • Spawn subagent      │
        └──────────┬─────────────┘
                   ▼
        ┌────────────────────────┐
        │  Step 3: Execution     │  ← sessions_spawn with modelOverride
        │  • Isolated session    │
        │  • Progress tracking   │
        │  • Output capture      │
        └──────────┬─────────────┘
                   ▼
        ┌────────────────────────┐
        │  Step 4: Aggregation   │
        │  • Result collection   │
        │  • Quality check       │
        │  • User notification   │
        └──────────┬─────────────┘
                   ▼
        ┌────────────────────────┐
        │  Step 5: Learning      │  ← Optional v2
        │  • Preference capture  │
        │  • Pattern matching    │
        │  • Model tuning        │
        └────────────────────────┘
```

---

## 🔧 3. Feature Requirements

### 3.1 Core Features (MVP - Phase 1)

#### FR-001: Agent Orchestration Engine

**Priority**: P0 (Critical)  
**Description**: Multi-agent task distribution with intelligent routing

**Requirements**:
- [ ] Register 5+ specialist agent types with distinct personas
- [ ] Implement task queue with priority support
- [ ] Route tasks based on intent classification
- [ ] Support parallel subagent execution
- [ ] Collect and aggregate results

**Acceptance Criteria**:
```gherkin
Given a complex task requiring research + coding
When the user submits the task
Then Maestro creates a plan
And Oracle validates the plan
And Dispatcher spawns Scholar + Artisan in parallel
And Results are aggregated and presented
```

#### FR-002: Model Routing Integration

**Priority**: P0 (Critical)  
**Description**: Leverage OpenClaw's `before_model_resolve` hook for agent-model matching

**Requirements**:
- [ ] Plugin registers `before_model_resolve` hook
- [ ] Map agent types to optimal models
- [ ] Support user preference overrides
- [ ] Fallback chain per agent type

**Configuration Example**:
```json
{
  "omo": {
    "agentModels": {
      "maestro": {
        "primary": "zhipu/GLM-5.1",
        "fallbacks": ["modelstudio/kimi-k2.5"]
      },
      "artisan": {
        "primary": "modelstudio/kimi-k2.5",
        "fallbacks": ["zhipu/GLM-5-Turbo"]
      },
      "envoy": {
        "primary": "minimax/MiniMax-M2.7-highspeed",
        "fallbacks": []
      }
    }
  }
}
```

#### FR-003: Command Interface

**Priority**: P0 (Critical)  
**Description**: User-facing commands for harness control

**Commands**:
| Command | Description | Example |
|---------|-------------|---------|
| `/omo plan` | Enter strategic planning mode | `/omo plan: Build a personal website` |
| `/omo work` | Execute current plan | `/omo work` |
| `/omo status` | Check active agents & tasks | `/omo status` |
| `/omo agent <type>` | Switch to specific agent | `/omo agent artisan` |
| `/omo pause` | Pause all background tasks | `/omo pause` |
| `/omo resume` | Resume paused tasks | `/omo resume` |

#### FR-004: Session Management

**Priority**: P1 (High)  
**Description**: Persistent session handling for long-running tasks

**Requirements**:
- [ ] Track active subagent sessions
- [ ] Support session recovery after restart
- [ ] Implement graceful shutdown
- [ ] Session timeout management

### 3.2 Advanced Features (Phase 2)

#### FR-005: Autonomous Mode

**Priority**: P1 (High)  
**Description**: Fully autonomous operation without user prompting

**Requirements**:
- [ ] Cron-based autonomous planning
- [ ] Self-triggered task execution
- [ ] Health monitoring & self-healing
- [ ] Progress reporting via configured channels

#### FR-006: Learning & Adaptation

**Priority**: P2 (Medium)  
**Description**: Dynamic improvement based on user feedback

**Requirements**:
- [ ] Capture user corrections
- [ ] Track task success/failure rates
- [ ] Adjust model selection based on performance
- [ ] Learn preferred communication patterns

#### FR-007: Multi-Channel Coordination

**Priority**: P2 (Medium)  
**Description**: Coordinate tasks across multiple communication channels

**Requirements**:
- [ ] Channel-aware agent dispatch
- [ ] Cross-channel task handoff
- [ ] Unified status reporting
- [ ] Channel-specific output formatting

---

## 📋 4. Technical Implementation

### 4.1 Integration Points

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     OpenClaw Integration Points                              │
└─────────────────────────────────────────────────────────────────────────────┘

OpenClaw Core
    │
    ├───▶ Plugin System
    │     ├── before_model_resolve  ← OMO Model Router
    │     ├── message:preprocessed  ← OMO Intent Classifier
    │     └── session:created       ← OMO Session Tracker
    │
    ├───▶ sessions_spawn            ← OMO SubAgent Execution
    │     └── modelOverride support
    │
    ├───▶ cron                      ← OMO Autonomous Mode
    │     └── scheduled planning
    │
    └───▶ memory_*                  ← OMO Learning Layer
          └── preference storage
```

### 4.2 Directory Structure

```
~/.openclaw/workspace/skills/oh-my-openclaw/
├── SKILL.md                      # Skill manifest & triggers
├── PRD.md                        # This document
├── src/
│   ├── index.ts                  # Main entry point
│   ├── agents/
│   │   ├── conductor/
│   │   │   ├── Maestro.ts
│   │   │   ├── Oracle.ts
│   │   │   └── Dispatcher.ts
│   │   └── specialists/
│   │       ├── Scribe.ts
│   │       ├── Artisan.ts
│   │       ├── Scholar.ts
│   │       ├── Envoy.ts
│   │       └── Warden.ts
│   ├── core/
│   │   ├── TaskQueue.ts
│   │   ├── SessionManager.ts
│   │   ├── ModelRouter.ts
│   │   └── IntentClassifier.ts
│   ├── hooks/
│   │   ├── beforeModelResolve.ts
│   │   └── messagePreprocessed.ts
│   └── utils/
│       └── helpers.ts
├── config/
│   ├── agents.yaml
│   └── models.yaml
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
└── tests/
    └── *.test.ts
```

### 4.3 Key Technical Decisions

#### Decision 1: Plugin vs Skill Architecture

**Chosen**: Hybrid approach
- **Plugin**: For `before_model_resolve` hook (must be plugin)
- **Skill**: For user-facing commands and orchestration logic

**Rationale**:
- OpenClaw requires plugins for model routing hooks
- Skills provide better user experience for commands
- Hybrid gives us best of both worlds

#### Decision 2: State Management

**Chosen**: File-based + OpenClaw memory system
- Task queue: JSON file in `.memory/omo/`
- Session tracking: OpenClaw `sessions_list` API
- User preferences: `memory/users/{id}/omo-preferences.md`

**Rationale**:
- No external dependencies (Redis optional for scale)
- Leverages existing OpenClaw infrastructure
- Easy backup and recovery

#### Decision 3: SubAgent Communication

**Chosen**: sessions_yield + message passing
- Parent spawns child via `sessions_spawn`
- Child reports via `sessions_yield`
- Parent polls via `sessions_list`

**Rationale**:
- Native OpenClaw mechanism
- No custom networking required
- Isolated execution guarantees

---

## 🗓️ 5. Development Roadmap

### Phase 1: MVP (Weeks 1-4) - "Foundation"

**Goal**: Basic orchestration with 3 agents

**Week 1**: Project Setup
- [ ] Repository structure
- [ ] Plugin skeleton
- [ ] Skill manifest
- [ ] CI/CD pipeline

**Week 2**: Core Infrastructure
- [ ] Task queue implementation
- [ ] Session manager
- [ ] Basic model router
- [ ] Intent classifier

**Week 3**: Agent Implementation
- [ ] Dispatcher agent
- [ ] Artisan agent (coding)
- [ ] Scribe agent (writing)
- [ ] Command interface

**Week 4**: Integration & Testing
- [ ] OpenClaw hook integration
- [ ] End-to-end tests
- [ ] Documentation
- [ ] Alpha release

**Deliverable**: `/omo plan` and `/omo work` functional for coding tasks

### Phase 2: Expansion (Weeks 5-8) - "The Team"

**Goal**: Full 8-agent suite

**Week 5**: Conductor Agents
- [ ] Maestro strategic planner
- [ ] Oracle validator

**Week 6**: Specialist Expansion
- [ ] Scholar research agent
- [ ] Envoy communication agent

**Week 7**: Utilities
- [ ] Warden security agent
- [ ] Session recovery
- [ ] Health monitoring

**Week 8**: Polish
- [ ] Error handling
- [ ] Progress reporting
- [ ] Beta release

**Deliverable**: Full agent team operational

### Phase 3: Intelligence (Weeks 9-12) - "Self-Improvement"

**Goal**: Learning and autonomous operation

**Week 9-10**: Learning Layer
- [ ] Preference capture
- [ ] Pattern matching
- [ ] Performance tracking

**Week 11**: Autonomous Mode
- [ ] Cron-based planning
- [ ] Self-triggered execution
- [ ] Health monitoring

**Week 12**: Multi-Channel
- [ ] Channel-aware dispatch
- [ ] Cross-channel coordination
- [ ] v1.0 release

**Deliverable**: Production-ready with learning capabilities

---

## 💰 6. Business Model (Optional)

### 6.1 开源策略

**License**: MIT License，完全免费

**原则**:
- 连 oh-my-openagent 都不收费，我们没资格收费
- 不赞同 ClawRouter 那种收费路由的做法
- 如果后期用的人多，开放自主打赏通道（Buy Me a Coffee / 爱发电）
- 所有功能完全开放，不打折不阉割

**Revenue (远期可选)**:
- 自主打赏支持
- 技术咨询（如果用户主动需求）
- 绝不设付费墙

### 6.2 市场进入策略

1. **GitHub 上线**: 完整文档 + 示例配置
2. **致敬声明**: README 首段明确 oh-my-openagent 启发关系
3. **社区**: OpenClaw Discord / Reddit 分享
4. **内容**: 博客文章对比 oh-my-openagent vs PolyMind 定位差异
5. **集成**: 提交 OpenClaw 官方插件注册表

---

## 🎭 7. Naming & Branding

### 7.1 Name Options

| Name | Meaning | Pros | Cons |
|------|---------|------|------|
| **Oh My OpenClaw** | OMO, parallels oh-my-openagent | Clear lineage | Long |
| **ClawTeams** | Team metaphor | Short, memorable | Generic |
| **PolyMind** | Many minds working together | Unique | Abstract |
| **AgentOS** | Operating system for agents | Grand vision | Overused |
| **Socrates** | Wisdom + questioning | Strong persona | Unrelated to Claw |

**Decision**: **PolyMind** — 独立品牌，README明确致敬 oh-my-openagent

### 7.2 Visual Identity

- **Logo**: Stylized team of agents around OpenClaw claw mark
- **Colors**: OpenClaw purple + agent team accent colors
- **Mascot**: Each agent type gets an emoji avatar

---

## 📚 8. References

### 8.1 Competitor Analysis

| Project | Stars | Target | What We Learn |
|---------|-------|--------|---------------|
| oh-my-openagent | 48.7k | OpenCode | Agent persona design, command patterns |
| ClawRouter | 6.1k | OpenClaw | Model routing hooks, cost optimization |
| LLMRouter | 2.3k | Generic | Academic approach, ML classification |
| iblai-openclaw-router | 1.8k | OpenClaw | Node.js implementation, 14-dimension scoring |

### 8.2 Technical Resources

- OpenClaw Plugin API: `before_model_resolve` hook
- OpenClaw SubAgents: `sessions_spawn` with `modelOverride`
- OpenClaw Cron: Scheduled isolated sessions
- OpenClaw Memory: `memory_search`, `memory_get`

### 8.3 Related Projects

- OpenCode: Terminal AI coding agent (Go)
- Oh-my-openagent: Harness for OpenCode (TypeScript)
- ClawdHub: OpenClaw skill marketplace

---

## ✅ 9. Decision Checkpoints

### Checkpoint 1: Before Phase 1
**Questions**:
- [ ] Do we use Plugin+Skill hybrid or pure Skill?
- [ ] Which 3 agents for MVP?
- [ ] State management: file-based or Redis?

### Checkpoint 2: Before Phase 2
**Questions**:
- [ ] Performance benchmarks met?
- [ ] User feedback on MVP?
- [ ] Proceed with full 8 agents?

### Checkpoint 3: Before Phase 3
**Questions**:
- [ ] Is learning layer worth the complexity?
- [ ] Monetization strategy?
- [ ] Open source license?

---

## 🦐 Final Thoughts

**Master Dexter, this is a genuine market gap.**

oh-my-openagent proved there's massive demand for agent harnesses (48.7k stars in 4 months!). OpenClaw users are asking for the same, but nobody's building it.

The key insight: **Don't copy oh-my-openagent directly.** OpenClaw's autonomous, multi-channel, persistent nature requires a fundamentally different approach. We need "digital employee teams," not "pair programmers."

**Recommended Next Steps**:
1. Decide on name (OMO vs PolyMind)
2. Set up repository
3. Build Phase 1 MVP (4 weeks)
4. Launch on GitHub + OpenClaw community

This could be the **defining harness** for the OpenClaw ecosystem. 🦐

---

*Document Version: 1.0*  
*Last Updated: 2026-04-06*  
*Author: Agent Research Division*