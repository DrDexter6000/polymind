# PolyMind — Product Requirements Document

> **Status**: v3.0 (2026-04)
> **SSOT**: 产品定义以 [README.md](../../README.md) 为准，本文档补充 README 未覆盖的需求细节

---

## 1. 产品定位

PolyMind 是 OpenClaw 平台的模型路由 Skill。核心命题：

**用户接入了多个 LLM Provider，但每次对话都要手动选模型。PolyMind 把这个决策自动化 — 而且比人选得更省钱。**

### 核心差异化

在 2026 年的 Agent 生态中，基础的场景路由即将成为平台标配。PolyMind 的差异化在于：

1. **Turn-level 路由** — 每轮消息独立路由，不是 session 级。同一对话内自动切换模型
2. **Cost-aware** — 不只选"最好的"，而是选"这条消息值得用的最好的"。复杂任务上顶级模型，简单确认用轻量模型
3. **可进化** — 从隐式用户行为中学习，不需要用户显式反馈

### 目标用户

- OpenClaw 用户，已配置 2+ 个 LLM Provider
- 不想在每次对话前手动切换模型
- 在意 token 成本，希望自动优化花费

### 不是什么

- 不是 Agent 编排框架（Stage 4 会演进到此，但 Stage 1 不是）
- 不是 LLM 评测平台（不维护静态模型排名）
- 不是付费产品（MIT，永远免费）

---

## 2. 核心功能需求（Stage 1）

### FR-001: 场景识别引擎 (SceneClassifier)

**优先级**: P0

分析用户消息，判定任务场景类型。**默认每轮消息都独立触发**，不缓存 session 级场景；但对高置信度 continuation，可短路继承上一轮 scene。

| 场景 | 识别信号 |
|------|---------|
| `coding` | 代码块、技术关键词（debug, refactor, implement）、文件路径引用 |
| `reasoning` | 分析请求、比较、规划、"为什么"类提问 |
| `writing` | 写作请求、邮件、文档、翻译、总结 |
| `fast` | 短消息（<20 tokens）、确认类、闲聊；不包括高置信度 continuation |

**验收标准**:
- 对标注测试集的场景分类准确率 > 85%
- 分类延迟 < 50ms（本地规则引擎，不调用 LLM）
- 无法分类时 fallback 到用户默认模型，不阻塞对话
- continuation 检测仅作用于高置信度短 follow-up；不得演化为持久 session memory

### FR-002: 复杂度评估引擎 (ComplexityEstimator)

**优先级**: P0

分析用户消息的复杂度级别，决定该用什么"级别"的模型。这是 cost-aware 路由的核心。

| 复杂度 | 评估信号 | 路由效果 |
|--------|---------|---------|
| `high` | 消息长（>100 tokens）、含代码块、引用多文件、多步骤请求 | 路由到顶级模型 |
| `medium` | 中等长度、单步骤但有技术含量 | 路由到平衡模型 |
| `low` | 短消息、轻量 follow-up（"改一下变量名"、"换个方式"）、单步骤简单操作 | 路由到轻量/经济模型 |

**验收标准**:
- 评估延迟 < 10ms（纯规则，比场景分类更简单）
- 无法评估时默认 `medium`
- fast 场景跳过复杂度评估（fast 本身就是轻量场景）
- 高置信度 continuation 在复杂度评估之前处理；默认继承上一轮 `scene`，并将复杂度视为 `low`

### FR-003: 路由决策引擎 (RouteResolver)

**优先级**: P0

根据 (scene + complexity) 查询路由表，返回目标模型。

**输入**: 场景类型 + 复杂度级别 + 用户路由配置
**输出**: `{ modelOverride: string, providerOverride?: string }`

**查找逻辑**:
1. 查 `routes[scene][complexity]`
2. 如果该复杂度未配置 → 向上回退（low → medium → high）
3. 找到 RouteConfig → 尝试 primary
4. Primary 不可用 → 按序尝试 fallbacks
5. 全部失败 → 返回 null，使用 OpenClaw 默认
6. 记录 fallback 事件供 Stage 3 分析

**Continuation 逻辑**:
- 若 message 被识别为高置信度 continuation，则优先继承上一轮 `scene`
- continuation 默认使用 `low` complexity 查询路由表，而不是直接复用上一轮 `high`
- 若宿主未提供最小上一轮上下文，则安全降级为普通 Turn-level 分类

### FR-004: Onboarding 配置引导

**优先级**: P0

`/polymind setup` 触发，引导用户完成首次配置。

**流程**:
1. 读取 openclaw.json，提取已配置的 Provider 和模型列表
2. 合并内置 capability seed 与 `polymind.modelHints`
3. 按场景 + 复杂度匹配最优模型（基于模型能力 + 成本标签）
4. 向用户展示推荐配置，允许调整
5. 确认后写入 openclaw.json 的 `polymind` 字段

**约束**:
- 只推荐用户已配置的模型，不推荐未安装的
- 如果用户模型少于 3 个，自动简化为不分复杂度的平面路由
- 配置写入前备份当前 openclaw.json
- setup 的模型能力判断以内置 capability seed 为起点，但允许用户在 `polymind.modelHints` 中覆盖 / 补充

### FR-005: 状态查询

**优先级**: P1

`/polymind status` 展示当前路由状态。

**输出内容**:
- 当前路由表（场景 × 复杂度矩阵）
- PolyMind 是否启用
- 最近的 fallback 事件（如有）

### FR-006: 配置修改

**优先级**: P1

`/polymind config` 允许用户修改路由配置。

**支持操作**:
- 修改某个场景某复杂度的 primary 模型
- 增删 fallback 模型
- 启用 / 禁用复杂度分级（退化为平面路由）
- 启用 / 禁用 PolyMind

---

## 3. 非功能需求

| 需求 | 指标 |
|------|------|
| **延迟** | 场景分类 + 复杂度评估 + 路由决策 合计 < 60ms |
| **可靠性** | 任何环节失败都静默降级到默认模型，不中断对话 |
| **侵入性** | 仅通过 `before_model_resolve` hook 介入，不修改消息内容 |
| **数据** | Stage 1 不持久化任何数据（配置除外），不写 .polymind/ 目录 |
| **成本** | 路由过程本身零 token 消耗（全部本地规则） |
| **Host API 风险控制** | 在官方 OpenClaw 类型未稳定前，使用仓库内 local contract 层开发与测试 |

---

## 4. 阶段边界

本 PRD 覆盖 **Stage 1（场景路由 + 复杂度感知）** 的完整需求。

Stage 2/3/4 的需求将在各自前置阶段交付后作为独立 PRD 增量定义。

---

## 5. 产品演进方向

以下方向已纳入 [ROADMAP.md](./ROADMAP.md)，不在 Stage 1 实现，但 Stage 1 的接口设计需为它们预留空间。

### 5.1 Prompt Adaptation（Stage 2）

路由时不仅选模型，还自动适配提示词格式。不同模型对相同 prompt 响应质量差异大，往往不是能力差，而是格式不匹配。

| 模型 | 偏好格式 |
|------|---------|
| Claude | XML 结构化指令, `<thinking>` 标签 |
| GPT | Markdown 格式, system prompt 分离 |
| Gemini | 简洁直接, few-shot 示例 |

**预留接口**: RouteResult 可扩展 `messageTransform?: (msg) => msg` 字段。

### 5.2 隐式质量信号（Stage 3）

不依赖用户显式反馈，从行为模式推断路由质量：

| 隐式信号 | 含义 |
|---------|------|
| 用户接受输出并继续 | 路由正确 |
| 用户重新措辞提问 | 可能路由不当 |
| 用户手动切换模型 | 路由不满意 |
| 对话轮次异常多 | 模型能力不足 |

**预留接口**: Plugin 入口可扩展 `after_model_resolve` hook 用于采集行为数据。

### 5.3 Model Portfolio 管理（Stage 3）

借鉴金融投资组合理论，帮用户管理模型组合风险：

- 模型依赖集中度分析（单一 Provider 占比过高 = 单点风险）
- 月度 token 成本分布可视化
- 自动推荐多样化方案

**预留接口**: `/polymind status` 可扩展 portfolio 视图。

### 5.4 Community Routing Intelligence（Stage 4）

聚合匿名化路由效果数据，生成社区驱动的活排名：

```
"基于 1200 名 PolyMind 用户的数据:
 coding.high 场景 → Opus 4.6 首次满意率 94%, GPT-5.4 Codex 89%"
```

替代静态 LLM 排名，数据实时、场景化、社区驱动。

**前提**: opt-in 匿名上报，不涉及消息内容，只有路由决策 + 满意度信号。

---

## 6. 开源策略

- License: MIT
- 所有功能完全开放，不设付费墙
- 接受社区贡献（Issue / PR）
- Stage 4 的社区数据聚合服务如需服务器成本，通过自主打赏（Buy Me a Coffee / 爱发电）覆盖
