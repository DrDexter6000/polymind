# PolyMind 🧠

> **智能 LLM 路由器 + 可进化 SubAgent 分配器**  
> OpenClaw 的模型路由基础设施

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw Plugin](https://img.shields.io/badge/OpenClaw-Plugin-blue)](https://openclaw.ai)

---

## 🙏 致敬

**PolyMind 深受 [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) 启发** (48k+ ⭐)

作为 oh-my-openagent 的深度用户，我一直想把它的理念带到 OpenClaw。但 OpenClaw 是**24/7 自主数字员工平台**，不是终端配对编程工具。

**PolyMind 不是源码移植**，而是：
- 基于 oh-my-openagent 的架构理念，为 OpenClaw 全新实现
- 专注于**模型路由 + 任务分配 + 记忆进化**
- 加入 Harness Framework 等新理念

---

## 🎯 PolyMind 是什么？

**四阶段演进路线**:

```
Stage 1: LLM 智能路由      ← 现在从这里开始
Stage 2: SubAgent 路由分配
Stage 3: 记忆进化
Stage 4: Harness 完全形态
```

### Stage 1: LLM 智能路由 (基础) ✅

> **免费版 ClawRouter，零费用路由**

```json
{
  "polymind": {
    "artisan": "modelstudio/kimi-k2.5",
    "maestro": "zhipu/GLM-5.1",
    "envoy": "minimax/MiniMax-M2.7-highspeed"
  }
}
```

- 场景识别 → 自动路由最优模型
- Fallback 链保证可用性
- 通过 `before_model_resolve` Hook 实现

### Stage 2: SubAgent 路由分配 (进阶)

> **不同任务分配不同模型**

```bash
/omo artisan   → kimi-k2.5 (代码专家)
/omo scholar   → GLM-5.1 (研究分析)
/omo plan      → Maestro 规划 → 多模型协作
```

### Stage 3: 记忆进化 (高级)

> **越用越懂你**

- 记录路由决策效果
- 用户纠正反馈捕获
- 自动调整推荐

### Stage 4: Harness 完全形态 (终极)

> **全自动编排**

```
目标 → 自动规划 → 智能路由 → 执行 → 学习 → 进化
```

---

## ✨ 核心特性

| 特性 | 说明 | 阶段 |
|------|------|------|
| **智能路由** | 基于场景自动选模型 | Stage 1 |
| **多模型支持** | 6 大 Agent 角色专属配置 | Stage 1 |
| **私有记忆** | 隔离存储，不碰 ClawMemory | Stage 3 |
| **Onboarding** | 智能配置推荐 | Stage 1 |
| **官方排名** | LLM_RANKING.md 参考 | Stage 1 |
| **用户排名** | 基于体验的个性化调整 | Stage 3 |
| **Harness** | 多智能体编排 | Stage 4 |

---

## 🚀 快速开始

### 1. 安装

```bash
# 克隆仓库
git clone https://github.com/DrDexter6000/polymind.git
cd polymind

# 或通过 ClawHub (待上线)
clawhub install polymind
```

### 2. Onboarding 配置

```bash
# 启动引导
/polymind setup

# PolyMind 会:
# 1. 扫描您已安装的模型
# 2. 基于官方排名推荐
# 3. 采访您的体验偏好
# 4. 生成最优配置
```

### 3. 使用

```bash
# 智能路由 (自动)
直接对话，PolyMind 自动选模型

# 手动指定
/omo artisan   # 切换到代码专家模式
/omo scholar   # 切换到研究模式
/omo status    # 查看当前状态
```

---

## 🏗️ 架构

```
┌─────────────────────────────────────────────────────────────┐
│  OpenClaw                                                    │
│  ├── Plugin: before_model_resolve hook                      │
│  │   └── PolyMind 拦截模型解析                              │
│  ├── Skill: /polymind, /omo 命令                           │
│  └── sessions_spawn: SubAgent 执行                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PolyMind 数据 (隔离!)                                       │
│  ├── .polymind/ (PolyMind 私有)                           │
│  │   ├── config.json                                       │
│  │   ├── routing/                                          │
│  │   └── preferences/                                       │
│  └── memory/ (ClawMemory) ❌ 绝对不碰                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎭 6 大 Agent 角色

| Agent | 职责 | 推荐模型 |
|-------|------|---------|
| **Maestro** | 战略规划 | GLM-5.1 > kimi-k2.5 |
| **Oracle** | 计划审查 | kimi-k2.5 > GLM-5.1 |
| **Artisan** | 代码专家 | kimi-k2.5 > GLM-5-Turbo |
| **Scholar** | 研究分析 | GLM-5.1 > kimi-k2.5 |
| **Scribe** | 内容写作 | GLM-5-Turbo > qwen3.6 |
| **Envoy** | 通信联络 | MiniMax-M2.7 > GLM-5-Turbo |

---

## 📊 Onboarding 流程

```
[1] 扫描模型      → 读取 openclaw.json
[2] 官方匹配      → 查询 LLM_RANKING.md
[3] 用户采访      → 性价比/速度排名
[4] 综合推荐      → 0.6×官方 + 0.4×用户
[5] 写入配置      → 启用 PolyMind
```

---

## 💡 设计原则

### 为什么免费？

> "连 oh-my-openagent 都不收费，我有什么资格收费？"
> — PolyMind Creator

PolyMind 永远免费，不设付费墙。

### 为什么隔离记忆？

PolyMind 有**独立的私有记忆** (`.polymind/`)，绝不触碰用户的 ClawMemory 全局记忆体系。

### 与 ClawRouter 的区别？

| | ClawRouter | PolyMind |
|--|------------|----------|
| 费用 | 收费 | 免费 |
| 路由 | 模型路由 | 模型路由 + SubAgent |
| 进化 | 无 | 有 |
| Harness | 无 | Stage 4 有 |

---

## 📁 项目结构

```
polymind/
├── README.md           # 本文件
├── SKILL.md            # Skill 规范
├── ARCHITECTURE.md     # 架构文档
├── LLM_RANKING.md      # 官方 LLM 排名
├── onboarding.md       # Onboarding 流程
├── src/
│   ├── plugin/         # Plugin 实现
│   ├── skill/          # Skill 命令
│   └── onboard/        # Onboarding 逻辑
└── .polymind/          # 私有数据 (gitignore)
```

---

## 🛠️ 开发

### Roadmap

- [x] Stage 0: 架构设计 & PRD ✅
- [ ] Stage 1: MVP (路由 + Onboarding)
- [ ] Stage 2: SubAgent 路由
- [ ] Stage 3: 记忆进化
- [ ] Stage 4: Harness 完全形态

### 贡献

欢迎提交 Issue 和 PR！

---

## 📚 文档

- [Architecture](./ARCHITECTURE.md) - 详细系统设计
- [LLM Ranking](./LLM_RANKING.md) - 官方模型排名
- [Onboarding](./onboarding.md) - 配置引导流程
- [SKILL.md](./SKILL.md) - Skill 规范

---

## 🔗 相关项目

| 项目 | 平台 | 关系 |
|------|------|------|
| [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) | OpenCode | 🙏 灵感来源 |
| [ClawRouter](https://github.com/BlockRunAI/ClawRouter) | OpenClaw | 竞品 (收费) |
| [OpenClaw](https://openclaw.ai) | — | 宿主平台 |

---

## 📄 License

MIT License

---

## 🦐

*PolyMind: 让每个 OpenClaw 用户都能享受智能模型路由*