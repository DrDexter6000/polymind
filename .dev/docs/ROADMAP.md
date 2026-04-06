# PolyMind — Development Roadmap

> **Status**: v3.0 (2026-04)
> **SSOT**: 演进路线概览见 [README.md](../../README.md)，本文档补充实施细节

---

## Stage 总览

| Stage | 目标 | 核心创新 | 状态 |
|-------|------|---------|------|
| **Stage 1** | 场景路由 | Turn-level 路由 + continuation-aware 最小继承 + 复杂度感知 (Cost-aware) | 待开发 |
| **Stage 2** | 深度路由 | SubAgent 角色路由 + Prompt Adaptation | 规划中 |
| **Stage 3** | 路由进化 | 隐式质量信号 + Model Portfolio 管理 | 规划中 |
| **Stage 4** | 生态闭环 | Harness 编排 + Community Routing Intelligence | 远期愿景 |

---

## Stage 1: 场景路由 + 复杂度感知（当前阶段）

Stage 1 的核心差异化：不只是"选对模型"，而是 **Turn-level 的 cost-aware 路由**。默认每轮独立判断场景 + 复杂度；对极短高置信度 continuation 只做最小继承，避免误判到 fast。高复杂度任务上顶级模型，低复杂度任务用轻量模型。

### Phase 0: 项目脚手架

**目标**: 建立可构建、可测试的项目骨架

**交付物**:
- package.json + tsconfig.json
- 目录结构 (src/contract/, src/plugin/, src/skill/)
- ESLint + 测试框架
- .gitignore

**完成标准**: `npm run build` 和 `npm test` 可执行（空通过）

**详细计划**: [phase-0-scaffold.md](./phase-0-scaffold.md)

---

### Phase 1: Plugin 核心（场景识别 + 复杂度评估 + 路由决策）

**目标**: 实现 `before_model_resolve` hook 的完整路由链路

**交付物**:
- SceneClassifier（场景识别）
- ContinuationDetector（极短 follow-up 最小继承）
- ComplexityEstimator（复杂度评估）
- RouteResolver（二维路由决策 + 复杂度回退 + fallback 链）
- Plugin 入口 + hook 注册
- 单元测试覆盖所有分支

**完成标准**: 给定消息和路由配置，能正确返回 (scene, complexity) 对应的 `{ modelOverride }` 或 `null`

**详细计划**: [phase-1-plugin.md](./phase-1-plugin.md)

---

### Phase 2: Skill 命令（setup + status + config）

**目标**: 用户可通过 `/polymind` 命令完成配置和查询

**交付物**:
- `/polymind setup` — Onboarding（感知模型数量，自动选择平面/分级配置）
- `/polymind setup` — Onboarding（内置 capability seed + user modelHints override）
- `/polymind status` — 路由状态展示（场景 × 复杂度矩阵）
- `/polymind config` — 配置修改

**完成标准**: 用户可通过命令完成从零配置到正常路由的全流程

**详细计划**: [phase-2-skill.md](./phase-2-skill.md)

---

### Phase 3: 集成测试 + 发布

**目标**: 端到端验证 + Alpha 发布

**交付物**:
- 集成测试（含 turn-level 多轮路由场景）
- README 更新状态
- GitHub Release v0.1.0

**完成标准**: 真实 OpenClaw 环境中全流程可用

**详细计划**: [phase-3-release.md](./phase-3-release.md)

---

## Stage 1 为远期目标预留的扩展点

| 扩展点 | Stage 1 做法 | 未来演进 |
|--------|-------------|---------|
| **RouteResult** | `{ modelOverride, providerOverride }` | Stage 2: +`messageTransform` (Prompt Adaptation) |
| **路由配置** | `routes: Record<Scene, SceneRouteConfig>` | Stage 2: +`agentRoutes: Record<Role, SceneRouteConfig>` |
| **SceneClassifier** | 关键词 + 启发式规则 | Stage 3: 可替换为 ML / LLM-as-judge，接口不变 |
| **RouteResolver** | 静态查表 | Stage 3: 注入历史权重 + 隐式信号评分 |
| **持久化** | 不写任何文件 | Stage 3: `.polymind/` 目录 |
| **Plugin hook** | 仅 `before_model_resolve` | Stage 2: +`session:created`; Stage 3: +`after_model_resolve` |
| **数据上报** | 无 | Stage 4: opt-in 匿名上报 |
| **Host types** | 本地 contract / mock layer | 官方 `@types` 或平台内置类型稳定后替换 |
| **Model hints** | built-in capability seed + user `modelHints` override | Stage 2+: 交互式管理 |

---

## Stage 2: 深度路由（待 Stage 1 交付后定义）

### 2.1 SubAgent 角色路由

- 引入 Agent 角色体系（Artisan 代码 / Scholar 研究 / Scribe 写作 / Envoy 通信 / ...）
- 为 `sessions_spawn` 的子任务提供角色级路由：不同角色绑定不同 SceneRouteConfig
- `/polymind role <name>` 手动切换角色
- 配置扩展: `agentRoutes: Record<Role, SceneRouteConfig>`
- 复用 Stage 1 的 ComplexityEstimator，角色路由同样 cost-aware

### 2.2 Prompt Adaptation

不同模型对相同 prompt 的最佳格式不同。路由时自动适配提示词格式，不改语义，只调结构：

| 目标模型 | 适配策略 |
|---------|---------|
| Claude | 注入 XML 结构标签，长指令用 `<instructions>` 包裹 |
| GPT | 提取 system prompt 独立传递，正文用 Markdown |
| Gemini | 精简上下文，附加 few-shot 示例 |
| 国产模型 | 中文指令优先，减少英文术语 |

**技术实现**: RouteResult 新增 `messageTransform` 字段，由 Plugin 在返回路由结果时附带轻量转换函数。依赖 OpenClaw 平台支持在 hook 返回中传递消息转换。

### 与 Stage 1 的关系

复用 SceneClassifier + ComplexityEstimator + RouteResolver，在其上层叠加角色映射 + prompt 转换。

---

## Stage 3: 路由进化（待 Stage 2 交付后定义）

### 3.1 隐式质量信号采集

99% 的用户不会主动给反馈。Stage 3 通过行为观察推断路由质量：

| 隐式信号 | 含义 | 采集方式 |
|---------|------|---------|
| 用户接受输出并继续下一步 | 路由正确 | 检测后续消息是否为 follow-up 而非 retry |
| 用户重新措辞相同问题 | 路由可能不当 | 语义相似度检测（embedding / 规则） |
| 用户手动切换模型 | 路由不满意 | 捕获 `/polymind config` 后的手动覆盖 |
| 对话轮次异常多 | 模型能力不足 | 统计同场景平均轮次，偏差 > 2σ 标记 |
| fallback 触发频率 | Provider 可靠性 | 统计 fallback 事件 |

**技术实现**: 注册 `after_model_resolve` hook 采集行为数据，写入 `.polymind/signals/`。

### 3.2 动态路由调优

基于隐式信号，自动调整路由权重：

```
初始权重: primary=1.0, fallback[0]=0.8, fallback[1]=0.6
用户行为: primary 被重试 3 次, fallback[0] 被接受 5 次
调优后:  fallback[0] 提升为 primary, 原 primary 降级
```

### 3.3 Model Portfolio 管理

借鉴金融投资组合理论：

- **集中度分析**: 检测单一 Provider 在路由中的占比（>70% = 高风险）
- **月度成本分布**: 按 scene × complexity 统计 token 消耗和费用
- **多样化推荐**: 建议增加特定场景的备选模型，降低单点风险
- **故障模拟**: "如果 Anthropic 限流 1 小时，你的路由会如何降级？"

**用户界面**: `/polymind portfolio` 展示以上分析。

### 3.4 私有记忆存储

```
.polymind/                        # PolyMind 私有，与 ClawMemory 隔离
├── config-history/               # 配置变更历史
├── signals/                      # 隐式质量信号日志
│   ├── routing-decisions.jsonl   # 每次路由决策
│   └── user-behavior.jsonl       # 用户行为信号
├── weights/                      # 动态路由权重
└── portfolio/                    # 组合分析快照
```

### 与 Stage 1 的关系

替换 RouteResolver 的静态查表为动态权重计算。SceneClassifier + ComplexityEstimator 接口不变，但可选替换为更智能的实现。

---

## Stage 4: 生态闭环（远期愿景）

### 4.1 Harness 编排

目标级编排，用户给出高层目标，PolyMind 自动完成全流程：

```
用户: "帮我搭建一个个人博客"

PolyMind:
  1. Maestro (reasoning.high → Gemini 3.1 Pro) 拆解目标为子任务
  2. Oracle (reasoning.medium → Opus 4.6) 审查计划可行性
  3. 并行执行:
     - Scholar (reasoning.high) 调研框架选型
     - Artisan (coding.high → Opus 4.6) 实现代码
     - Scribe (writing.medium) 撰写文档
  4. 汇总结果，交付用户
```

### 4.2 Community Routing Intelligence

当用户规模达到一定量级后，聚合匿名化路由效果数据：

- **匿名上报** (opt-in): 路由决策 + 隐式满意度信号，不含消息内容
- **社区排名**: 按 scene × complexity 生成活排名（每日更新）
- **自动分发**: 新用户的 `/polymind setup` 直接用社区排名作为推荐基准
- **数据主权**: 用户可随时 opt-out，数据本地删除

```
"coding.high 场景社区数据 (N=1200):
  Opus 4.6    → 首次满意率 94%, 平均 1.2 轮完成
  GPT-5.4     → 首次满意率 89%, 平均 1.5 轮完成
  Kimi-K2.5   → 首次满意率 82%, 平均 1.8 轮完成"
```

### 与前置 Stage 的关系

在 Stage 2 的角色体系 + Stage 3 的进化引擎之上，增加编排层 + 社区数据层。

---

## Phase 依赖图

```
Stage 1:
  Phase 0 (脚手架) → Phase 1 (Plugin) → Phase 2 (Skill) → Phase 3 (发布)

Stage 2: (Stage 1 完成后启动)
  角色路由 → Prompt Adaptation → 集成发布

Stage 3: (Stage 2 完成后启动)
  隐式信号采集 → 动态调优 → Portfolio 管理 → 集成发布

Stage 4: (Stage 3 完成后启动)
  Harness 编排 → Community Intelligence → 生态发布
```

---

## 执行追踪

| Phase | 状态 | 开始 | 完成 |
|-------|------|------|------|
| Phase 0 | 待开始 | - | - |
| Phase 1 | 待开始 | - | - |
| Phase 2 | 待开始 | - | - |
| Phase 3 | 待开始 | - | - |
