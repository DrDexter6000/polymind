# PolyMind

> OpenClaw 智能模型路由 — 让对的模型做对的事

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 什么是 PolyMind？

PolyMind 是 OpenClaw 的模型路由 Skill。它在你对话时自动识别任务场景（写代码、做研究、快速回复……），把请求路由到最合适的 LLM，不需要你手动切换模型。

**核心价值**：你配置一次，之后每次对话自动选最优模型。免费，开源，MIT。

### 它解决什么问题？

OpenClaw 支持接入多个 LLM Provider，但用户需要手动选择模型。PolyMind 把这个决策自动化：

```
用户消息 → 场景识别 + 复杂度评估 → 路由到最优模型 → 正常对话
```

例如：重构认证模块（coding.high）自动路由到 Claude Opus 4.6，简单分析（reasoning.low）用 GLM-5.1，快速确认用 MiniMax-M2.7。**默认每轮消息独立路由**，同一对话中可以自动切换模型；但对极短 continuation / follow-up（如“继续”“再试一次”），会优先继承上一轮的场景上下文，避免把真正的编码任务误降为 fast。如果 primary 不可用，沿 fallback 链降级，对话不中断。

---

## 快速开始

### 安装

```bash
# 通过 ClawHub
clawhub install polymind

# 或手动
git clone https://github.com/DrDexter6000/polymind.git ~/.openclaw/workspace/skills/polymind
```

### 初始化配置

```bash
/polymind setup
```

PolyMind 会扫描你已安装的模型，结合场景匹配推荐最优配置，确认后一键启用。

### 日常使用

安装后无需额外操作。PolyMind 通过 `before_model_resolve` Hook 自动工作：

```bash
# 查看当前路由状态
/polymind status

# 调整配置
/polymind config
```

---

## 工作原理

PolyMind 注册为 OpenClaw Plugin，拦截模型解析阶段。**默认每轮消息都独立路由**（Turn-level），同一对话内可以自动切换模型；对高置信度的极短 continuation 则走最小继承逻辑：

```
1. 用户发送消息
2. OpenClaw 触发 before_model_resolve hook
3. PolyMind 三段式分析:
   ├─ ContinuationDetector: 检测极短 follow-up 是否继承上一轮 scene
   ├─ SceneClassifier: 判定场景 (coding / reasoning / writing / fast)
   └─ ComplexityEstimator: 评估复杂度 (high / medium / low)
4. 组合 (scene + complexity) → 查路由表 → 返回 { modelOverride, providerOverride }
5. OpenClaw 使用路由结果调用模型
```

### Turn-level 路由

PolyMind 不是传统意义上的 session 级路由器。在同一对话中，大多数消息都重新判断；只有高置信度的短 continuation 会临时继承上一轮 scene：

```
用户: 帮我分析这个架构的问题          → reasoning.high → Gemini 3.1 Pro
用户: 好，帮我重构这个函数            → coding.high   → Claude Opus 4.6
用户: 写个 commit message            → writing.low   → GLM-5-Turbo
用户: ok                             → fast          → MiniMax-M2.7
```

同一对话四轮消息，四次路由，四个模型。用户无感，体验最优。

### 最小 continuation 继承

纯 Turn-level 路由在真实多轮任务中有一个典型误判：

```text
用户: 帮我重构这个认证模块        → coding.high
用户: 继续                        → 如果完全独立分类，容易误掉到 fast
```

Stage 1 会加入一个**最小 continuation detector**：

- 只处理高置信度、极短的 follow-up（如“继续”“再试一次”“按这个改”）
- continuation 默认继承上一轮的 `scene`
- continuation 默认将 `complexity` 视为 `low`，而不是盲目继承上一轮的 `high`
- “好的 / ok / thanks” 这类确认消息仍然走 `fast`

### 场景 + 复杂度 二维路由

| 场景 | 触发特征 | 路由策略 |
|------|---------|---------|
| **Coding** | 代码生成、调试、重构 | 代码能力最强的模型 |
| **Reasoning** | 分析、规划、复杂推理 | 推理能力最强的模型 |
| **Writing** | 文档、邮件、内容创作 | 写作能力最优的模型 |
| **Fast** | 简短问答、确认、闲聊 | 响应速度最快的模型 |

传统路由器只看场景，PolyMind 同时评估**复杂度**。"帮我写个 hello world" 和 "帮我重构整个认证模块" 都是 coding，但不需要用同一个模型 — 前者用轻量模型就够了，后者才值得上顶级模型。

**复杂度信号**（本地评估，不调用 LLM）：
- **high**: 消息长（>100 tokens）、含代码块、引用多文件、多步骤请求
- **low**: 消息短、单步骤、轻量 follow-up 类（"改一下变量名"、"换个方式"）
- **medium**: 其余情况

> 注：高置信度 continuation 会在复杂度评估之前单独处理，不与普通 `low` 信号混为一谈。

### 配置结构

每个场景支持按复杂度分级路由。高复杂度用顶级模型，低复杂度用轻量模型，**一个月能省几十美元而不损失体验**。

```json
{
  "polymind": {
    "modelHints": {
      "claude-opus": { "scenes": ["coding", "reasoning"], "tier": 1 },
      "my-custom-model": { "scenes": ["writing"], "tier": 2 }
    },
    "routes": {
      "coding": {
        "high":   { "primary": "anthropic/claude-opus-4-6",        "fallbacks": ["openai/gpt-5.4-codex", "modelstudio/kimi-k2.5"] },
        "medium": { "primary": "anthropic/claude-sonnet-4-6",      "fallbacks": ["modelstudio/kimi-k2.5", "zhipu/GLM-5-Turbo"] },
        "low":    { "primary": "modelstudio/kimi-k2.5",            "fallbacks": ["zhipu/GLM-5-Turbo"] }
      },
      "reasoning": {
        "high":   { "primary": "google/gemini-3.1-pro",            "fallbacks": ["anthropic/claude-opus-4-6", "zhipu/GLM-5.1"] },
        "medium": { "primary": "anthropic/claude-sonnet-4-6",      "fallbacks": ["zhipu/GLM-5.1", "modelstudio/kimi-k2.5"] },
        "low":    { "primary": "zhipu/GLM-5.1",                    "fallbacks": ["modelstudio/kimi-k2.5"] }
      },
      "writing": {
        "high":   { "primary": "anthropic/claude-sonnet-4-6",      "fallbacks": ["openai/gpt-5.4", "zhipu/GLM-5-Turbo"] },
        "low":    { "primary": "zhipu/GLM-5-Turbo",                "fallbacks": ["bailian/qwen3.6-plus"] }
      },
      "fast": {
        "primary": "minimax/MiniMax-M2.7-highspeed",
        "fallbacks": ["google/gemini-3.1-flash", "zhipu/GLM-5-Turbo"]
      }
    }
  }
}
```

**设计思路**：
- 前端放国际顶级模型保证质量上限，尾部放国产模型兜底可用性和成本
- fast 场景不分复杂度（本身就是轻量场景）
- writing 场景简化为 high/low 两级（medium 合入 high）
- 用户通过 `/polymind setup` 根据自己的 Provider 生成个性化配置
- `modelHints` 允许用户覆盖 / 补充内置的模型能力种子，不需要等 PolyMind 更新才支持新模型

---

## 演进路线

PolyMind 分阶段交付，每个阶段独立可用，同时为下一阶段预留扩展接口：

| 阶段 | 目标 | 状态 |
|------|------|------|
| **Stage 1** | 场景路由 — Turn-level 场景识别 + continuation-aware 最小继承 + 复杂度感知路由 | 开发中 |
| **Stage 2** | 深度路由 — SubAgent 角色路由 + Prompt 适配 | 规划中 |
| **Stage 3** | 路由进化 — 隐式质量信号 + 模型组合管理 | 规划中 |
| **Stage 4** | 生态闭环 — Harness 编排 + 社区路由智慧 | 远期愿景 |

### 远期愿景

Stage 1 解决"选对模型"，但 PolyMind 的终极目标是**让 OpenClaw 成为自主进化的数字员工团队**：

- **Stage 2** 引入 Agent 角色（Artisan/Scholar/Scribe/Envoy...），不同子任务由不同角色承接，每个角色绑定最优模型。同时探索 **Prompt Adaptation** — 路由时自动适配目标模型偏好的提示词格式（如 Claude 偏好 XML 结构，GPT 偏好 Markdown），提升跨模型输出质量
- **Stage 3** 引入 `.polymind/` 持久化记忆，通过**隐式质量信号**（用户是否重试、是否手动切换模型、对话轮次是否异常）自动调优路由权重，无需用户显式反馈。同时提供 **Model Portfolio** 视角 — 展示用户的模型依赖集中度、单点故障风险、月度成本分布，推荐多样化方案
- **Stage 4** 实现目标级编排 + **Community Routing Intelligence**：聚合所有 PolyMind 用户的匿名路由效果数据，生成社区驱动的活排名（"coding 场景中 Opus 4.6 首次满意率 94%"），替代静态模型排名

Stage 1 的设计会为这些远期目标预留扩展点（参见 [ROADMAP.md](.dev/docs/ROADMAP.md)）。

---

## 技术架构

```
OpenClaw
├── Plugin: before_model_resolve hook (默认每轮触发)
│   └── PolyMind 路由决策引擎
│       ├── ContinuationDetector (极短 follow-up 最小继承)
│       ├── SceneClassifier (场景识别)
│       └── ComplexityEstimator (复杂度评估)
├── Contract: local OpenClaw host contract
│   └── 本地 mock / adapter 类型层，等待官方类型稳定
├── Skill: /polymind 命令
│   └── setup, status, config
└── (Stage 2+) sessions_spawn modelOverride
    └── SubAgent 级角色路由 + Prompt Adaptation
```

### 关键设计决策

- **Turn-level + 最小 continuation 继承**：默认每轮独立路由；只有极短、高置信度 follow-up 继承上一轮上下文
- **场景 + 复杂度 二维路由**：场景决定"用什么类型的模型"，复杂度决定"用什么级别的模型"。Cost-aware 的核心
- **Plugin + Skill 混合**：模型路由必须通过 Plugin hook 实现，用户交互通过 Skill 实现
- **配置写入 openclaw.json**：路由配置作为 `polymind` 字段写入用户主配置，不引入额外配置文件
- **本地 Host Contract 层**：在官方 OpenClaw 类型未稳定前，先用仓库内 contract 层开发和测试，避免 `any`

---

## 项目结构

```
polymind/
├── README.md          # 本文件（项目 SSOT）
├── SKILL.md           # OpenClaw Skill manifest
├── src/
│   ├── plugin/        # Plugin 实现（hook + 路由引擎）
│   ├── contract/      # OpenClaw host contract / mock interfaces
│   └── skill/         # Skill 实现（命令处理）
└── .dev/
    └── docs/          # 开发文档（PRD、架构、路线图）
```

---

## 致敬

PolyMind 的理念受 [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) 启发。但 OpenClaw 是 24/7 自主数字员工平台，和 OpenCode 的终端配对编程模式有本质区别，因此 PolyMind 是面向 OpenClaw 场景的全新设计。

---

## License

MIT
