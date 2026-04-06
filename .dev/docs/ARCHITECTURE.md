# PolyMind — Technical Architecture (Stage 1)

> **Status**: v3.0 (2026-04)
> **Scope**: 仅覆盖 Stage 1（场景路由 + 复杂度感知），Stage 2/3/4 架构在交付时补充

---

## 1. 系统概览

```
用户消息 (每轮独立触发)
    │
    ▼
OpenClaw Core ──── before_model_resolve hook ────► PolyMind Plugin
    │                                                    │
    │                                          ┌─────────┴──────────┐
    │                                          │ContinuationDetector│
    │                                          │ 极短 follow-up 最小继承 │
    │                                          └─────────┬──────────┘
    │                                                    │
    │                                          ┌─────────┴──────────┐
    │                                          │  SceneClassifier   │
    │                                          │  场景: coding /    │
    │                                          │  reasoning /       │
    │                                          │  writing / fast    │
    │                                          └─────────┬──────────┘
    │                                                    │
    │                                          ┌─────────┴──────────┐
    │                                          │ ComplexityEstimator│
    │                                          │  复杂度: high /    │
    │                                          │  medium / low      │
    │                                          └─────────┬──────────┘
    │                                                    │
    │                                          ┌─────────┴──────────┐
    │                                          │  RouteResolver     │
    │                                          │  (scene, complexity)│
    │                                          │  → 查路由表        │
    │                                          │  → primary+fallback│
    │                                          └─────────┬──────────┘
    │                                                    │
    │◄──── { modelOverride, providerOverride } ──────────┘
    │
    ▼
调用目标模型
```

**关键特征**: 默认每轮消息独立触发完整路由链路（Turn-level），不缓存 session 级状态；仅对高置信度极短 continuation 做最小继承。

## 2. 模块划分

### 2.1 Contract + Plugin 层 (`src/contract/`, `src/plugin/`)

**职责**: 注册 hook，协调场景识别、复杂度评估和路由决策

```
src/contract/
└── openclaw.ts                # 本地 Host contract / mock types

src/plugin/
├── index.ts                   # Plugin 入口，注册 before_model_resolve
├── continuation-detector.ts   # continuation / follow-up 检测
├── types.ts                   # 核心类型定义
├── scene-classifier.ts        # 场景识别引擎
├── complexity-estimator.ts    # 复杂度评估引擎
└── route-resolver.ts          # 路由决策引擎
```

**Plugin 入口** (`index.ts`):
- 仅通过 `src/contract/openclaw.ts` 接触宿主 API，避免未稳定的 OpenClaw 假设泄漏到业务模块
- 注册 `before_model_resolve` hook
- 从 openclaw.json 读取 `polymind` 配置
- 调用 ContinuationDetector → SceneClassifier → ComplexityEstimator → RouteResolver → 返回结果

**ContinuationDetector** (`continuation-detector.ts`):
- 输入: 当前消息文本 + 宿主可提供的最小上一轮上下文
- 输出: continuation 命中结果（是否继承上一轮 scene、是否降级为 low complexity）
- 实现: 高置信度短 follow-up 规则，不引入持久 session memory

**场景识别** (`scene-classifier.ts`):
- 输入: 用户消息文本
- 输出: `Scene` (`coding | reasoning | writing | fast`) 或 `null`
- 实现: 关键词 + 启发式规则（中英文），不调用 LLM
- 无法分类时返回 `null`

**复杂度评估** (`complexity-estimator.ts`):
- 输入: 用户消息文本 + 场景类型
- 输出: `Complexity` (`high | medium | low`)
- 实现: 基于消息长度、结构特征、上下文依赖度
- fast 场景跳过评估（直接跳到 RouteResolver，不分复杂度）
- 无法评估时默认 `medium`

**路由决策** (`route-resolver.ts`):
- 输入: `Scene` + `Complexity` + 路由配置
- 输出: `RouteResult` 或 `null`
- 逻辑: 查 `routes[scene][complexity]` → 复杂度回退 → primary → fallback 链
- 全部不可用时返回 `null`

### 2.2 Skill 层 (`src/skill/`)

**职责**: 处理 `/polymind` 用户命令

```
src/skill/
├── index.ts                 # 命令路由
├── setup.ts                 # /polymind setup — Onboarding
├── status.ts                # /polymind status — 状态查询
└── config.ts                # /polymind config — 配置修改
```

（Skill 层逻辑同前，此处不重复。详见 [phase-2-skill.md](./phase-2-skill.md)）

## 3. 数据流

### 3.1 Hook 执行路径（每轮消息触发）

```
before_model_resolve(message, context)
    │
    ├─ 1. 检查 polymind.enabled === true，否则返回 null
    │
    ├─ 2. ContinuationDetector.detect(message.content, context)
    │     → continuation? 继承上一轮 scene, complexity='low'
    │
    ├─ 3. continuation 未命中时 → SceneClassifier.classify(message.content)
    │     → Scene | null
    │
    ├─ 4. scene === null ? 返回 null（不覆盖）
    │
    ├─ 5. scene === 'fast' ?
    │     → 跳过复杂度评估，直接查 routes.fast
    │     → continuation 命中: complexity = 'low'
    │     → 否则: ComplexityEstimator.estimate(message.content, scene)
    │     → Complexity
    │
    ├─ 6. RouteResolver.resolve(scene, complexity, config.routes)
    │     → 查 routes[scene][complexity]
    │     → 复杂度回退: low→medium→high (如果配置中某级别缺失)
    │     → 解析 primary "provider/model"
    │     → { modelOverride, providerOverride } | null
    │
    └─ 7. 返回结果给 OpenClaw
```

### 3.2 核心类型定义

```typescript
type Scene = 'coding' | 'reasoning' | 'writing' | 'fast';
type Complexity = 'high' | 'medium' | 'low';

interface RouteConfig {
  primary: string;           // "provider/model"
  fallbacks: string[];
}

// 场景路由配置：支持按复杂度分级，也支持平面配置
type SceneRouteConfig =
  | RouteConfig                              // 平面配置 (不分复杂度)
  | Partial<Record<Complexity, RouteConfig>>; // 分级配置

interface PolyMindConfig {
  enabled: boolean;
  modelHints?: Record<string, ModelHint>;
  routes: Partial<Record<Scene, SceneRouteConfig>>;
}

interface ModelHint {
  scenes: Scene[];
  tier: 1 | 2 | 3;
}

interface RouteResult {
  modelOverride: string;
  providerOverride?: string;
}

// --- Stage 2+ 预留 ---
// interface RouteResult {
//   modelOverride: string;
//   providerOverride?: string;
//   messageTransform?: (msg: string) => string;  // Prompt Adaptation
// }
```

**配置兼容性**: `SceneRouteConfig` 同时支持平面和分级两种格式。RouteResolver 负责检测格式并正确处理。这保证了：
- 模型少的用户可以用简单的平面配置
- 模型多的用户可以用分级配置精细控制成本

## 4. 关键设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 路由粒度 | Turn-level + 最小 continuation 继承 | 避免“继续”这类 follow-up 被错误打到 fast，同时不引入持久 session 状态 |
| 二维路由 | 场景 × 复杂度 | 场景决定"用什么类型"，复杂度决定"用什么级别"，cost-aware 的核心 |
| 复杂度评估 | 本地规则 | < 10ms 延迟，零 token 消耗 |
| 场景分类 | 本地规则引擎 | < 50ms 延迟，不消耗 token |
| 配置存储 | openclaw.json | 不引入额外文件 |
| 配置格式 | 平面 + 分级兼容 | 降低入门门槛，高级用户可精细控制 |
| Stage 1 不写 .polymind/ | 无持久化 | 降低复杂度，Stage 3 引入持久化时再建目录 |
| Host API 适配 | Local contract layer | 官方类型未稳定时降低耦合和猜测范围 |
| 模型能力标签 | built-in seed + user override | 新模型无需等版本更新即可被 setup 正确识别 |

## 5. 边界与约束

- Plugin hook 必须同步返回（或在 OpenClaw 允许的超时内异步返回）
- 不修改用户消息内容，仅覆盖模型选择（Prompt Adaptation 在 Stage 2 引入）
- 不依赖任何第三方 npm 包（Stage 1 目标零运行时依赖）
- 不访问网络，不调用外部 API
- 场景分类 + 复杂度评估 + 路由决策 合计 < 60ms

## 6. 为远期目标预留的扩展点

| 扩展点 | Stage 1 做法 | 未来演进 |
|--------|-------------|---------|
| **RouteResult** | `{ modelOverride, providerOverride }` | Stage 2 新增 `messageTransform` 实现 Prompt Adaptation |
| **路由配置** | `routes: Record<Scene, SceneRouteConfig>` | Stage 2 新增 `agentRoutes: Record<Role, SceneRouteConfig>` |
| **分类器** | 关键词 + 启发式规则 | Stage 3 可替换为 ML 分类器或 LLM-as-judge，接口不变 |
| **路由决策** | 静态查表 | Stage 3 注入历史权重 + 隐式信号评分 |
| **持久化** | 不写任何文件 | Stage 3 引入 `.polymind/` 存储决策日志、隐式信号、portfolio 数据 |
| **Plugin hook** | 仅注册 `before_model_resolve` | Stage 2 注册 `session:created`；Stage 3 注册 `after_model_resolve` |
| **数据上报** | 无 | Stage 4 opt-in 匿名路由效果上报用于 Community Intelligence |
| **Host types** | 本地 contract / mock layer | 官方 `@types` 或平台内置类型稳定后替换 |
| **Model hints** | built-in capability seed + user `modelHints` override | Stage 2+ 提供更友好的交互式管理 |
