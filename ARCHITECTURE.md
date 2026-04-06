---
title: PolyMind Architecture v1.0
description: OpenClaw plugin for intelligent model routing based on task type
version: 1.0.0
status: planned
---

# 🧠 PolyMind Architecture v1.0

## 核心定位

| 属性 | 说明 |
|------|------|
| **类型** | Hook-only Plugin（纯钩子插件，不注册 Provider） |
| **功能** | 根据消息内容自动拦截并切换最优模型 |
| **入口 Hook** | `before_model_resolve`（模型解析前，无 messages） |
| **辅助 Hook** | `before_prompt_build`（有 messages，可注入上下文） |

---

## 执行流程图

```
用户消息
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│              🔗 before_model_resolve                    │
│         （session 加载前，messages 不可用）               │
│                                                         │
│   1. 读取当前 session 上下文                            │
│   2. 调用 ScenarioDetector                              │
│   3. 查表 → 返回 { modelOverride }                      │
│   4. Gateway 用指定模型执行推理                         │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│              🔗 before_prompt_build                     │
│         （session 加载后，messages 可用）               │
│                                                         │
│   可选：注入场景提示词、优化 Prompt                     │
└─────────────────────────────────────────────────────────┘
    │
    ▼
      Agent 推理（使用被选中的模型）
```

---

## 目录结构

```
~/.openclaw/extensions/polymind/
├── openclaw.plugin.json       ← 插件清单
├── package.json               ← npm 包配置
├── index.ts                   ← 插件入口（register）
├── src/
│   ├── router/
│   │   ├── scenario-detector.ts    ← 场景检测引擎
│   │   └── model-selector.ts       ← 模型选择器
│   ├── config/
│   │   └── routing-rules.ts        ← 路由规则表
│   ├── memory/
│   │   └── user-preferences.ts     ← 用户偏好学习
│   └── utils/
│       └── logger.ts
```

---

## 关键设计

### 1. 场景检测（ScenarioDetector）

| 场景 | 关键词示例 | 模型 |
|------|-----------|------|
| `coding` | python, javascript, 代码, 编程, bug | `modelstudio/kimi-k2.5` |
| `reasoning` | 推理, 数学, 证明, 逻辑分析 | `zhipu/GLM-5.1` |
| `academic` | 论文, 文献, 研究, 学术 | `zhipu/GLM-5-Turbo` |
| `creative` | 创作, 写诗, 故事, 创意 | `bailian/qwen3.6-plus` |
| `default` | 其他 | `zhipu/GLM-5-Turbo`（主模型） |

### 2. Hook 时序

```
before_model_resolve (第一次拦截)
  ├─ session 未加载，messages 不可用
  ├─ 返回 { modelOverride } 直接切换模型
  └─ 优点：零延迟，用户无感知

before_prompt_build (第二次拦截)
  ├─ session 已加载，messages 可用
  ├─ 可注入 prependContext（场景提示词）
  └─ 优点：可做更精准的语义判断
```

### 3. 模型选择策略

```
输入: "帮我用 Python 写个快速排序"
  │
  ├─ 关键词扫描 → "python" + "排序" → 命中 coding
  │
  └─ → 返回 modelOverride = "modelstudio/kimi-k2.5"
        （coding 场景专用模型）

输入: "分析一下这篇文章的论点结构"
  │
  ├─ 关键词扫描 → "分析" + 无代码
  ├─ 语义增强 → 判断为 reasoning
  │
  └─ → 返回 modelOverride = "zhipu/GLM-5.1"
```

---

## 实现文件清单

| 文件 | 作用 |
|------|------|
| `openclaw.plugin.json` | 声明 `id: "polymind"`，注册 `before_model_resolve` |
| `index.ts` | 入口，调用 `api.registerHook` |
| `scenario-detector.ts` | 关键词 + 正则 + 未来可扩展 ML 分类器 |
| `model-selector.ts` | 查表返回模型 |
| `routing-rules.ts` | 场景→模型映射表（可热更新） |

---

## 相对于 2026-03-13 版本的差异

| 项目 | 3月版本 | 新版本 |
|------|--------|--------|
| 拦截点 | `message:preprocessed`（位置偏后） | **`before_model_resolve`**（模型层，最早） |
| 模型切换 | 依赖 `/model` 命令（异步） | **直接返回 `modelOverride`**（同步，零延迟） |
| 上下文 | 无 messages | 有 session/messages |
| 可靠性 | webchat 渠道不触发 | 所有渠道均触发 |

---

## 技术参考

### 关键 Hook 文档

- `before_model_resolve`: 运行 pre-session，无 `messages`，用于确定性覆盖 provider/model
- `before_prompt_build`: 运行 after session load，可注入 `prependContext`, `systemPrompt` 等

### SDK 方法

```typescript
api.registerHook(events: string[], handler: HookHandler, opts?: { priority?: number })
```

### 返回值格式

```typescript
{ modelOverride?: string, providerOverride?: string }
```

---

## Roadmap

| 阶段 | 内容 |
|------|------|
| v1.0 | 基础关键字路由，5 大场景 |
| v1.1 | 用户偏好学习（从 .learnings/ 读取） |
| v1.2 | 语义向量分类（非关键字） |
| v1.3 | 性能反馈闭环（根据模型响应质量调整） |

---

## 竞品调研 (2026-04-06)

### 现有解决方案概览

| 项目 | 类型 | 核心机制 | 特点 | 状态 |
|------|------|----------|------|------|
| **ClawRouter** (BlockRunAI) | OpenClaw Plugin | `before_model_resolve` + 15维评分 | 最成熟，Agent原生，加密货币支付 | ✅ 活跃 |
| **LLMRouter** (UIUC) | 独立代理 | OpenAI兼容API服务器 | 学术项目，16+路由策略，ComfyUI界面 | ✅ 活跃 |
| **iblai-openclaw-router** | Node.js代理 | 14维加权评分器 | 成本优化，本地运行 | ✅ 活跃 |
| **OpenClaw #7482** | Feature Request | Regex规则配置 | 官方特性请求，讨论中 | ⏳ 未实现 |
| **OpenClaw #6421** | Feature Request | 双层路由架构 | 官方特性请求，讨论中 | ⏳ 未实现 |
| **Manifest** | OpenClaw Plugin | 成本路由 | Reddit提及，开源 | ✅ 可用 |

---

### 详细分析

#### 1. ClawRouter (BlockRunAI) ⭐ 最强竞品

**GitHub**: `BlockRunAI/ClawRouter`

**核心机制**:
- 拦截点: `before_model_resolve`
- 评分维度: 15维（token数、代码存在、推理标记、技术术语、创意标记、问题复杂度等）
- 路由策略: 基于sigmoid置信度的加权评分

**亮点**:
- 41+模型支持
- <1ms路由延迟
- Agent原生设计（无需API key，钱包签名认证）
- USDC支付 via x402协议
- 本地运行，MIT协议

**与PolyMind差异**:
- ClawRouter侧重**成本优化**（选最便宜的能用的模型）
- PolyMind侧重**能力匹配**（选最适合场景的专业模型）

---

#### 2. LLMRouter (UIUC) 

**GitHub**: `ulab-uiuc/LLMRouter`

**核心机制**:
- OpenAI兼容API服务器（FastAPI）
- 16+路由策略：KNN、SVM、MLP、矩阵分解、Elo评分、图路由、BERT路由等
- 可选检索增强路由记忆（Contriever）

**亮点**:
- 学术级ML路由
- ComfyUI可视化界面
- 多轮/单轮/Agentic/个性化路由器

**与PolyMind差异**:
- LLMRouter是**外部代理**，需额外部署
- PolyMind是**OpenClaw原生插件**，零部署

---

#### 3. iblai-openclaw-router

**GitHub**: `iblai/iblai-openclaw-router`

**核心机制**:
- Node.js本地代理（端口8402）
- 14维加权评分
- 三层路由: LIGHT (Haiku) → MEDIUM (Sonnet) → HEAVY (Opus)

**亮点**:
- 成本节省70%+
- 零依赖
- 安装简单（一行bash）

**与PolyMind差异**:
- iblai是**Anthropic专用**
- PolyMind是**供应商无关**，支持任意模型

---

#### 4. OpenClaw官方Feature Request

**Issue #7482**: [Feature]: Intelligent Model Routing
- 提议在配置中增加 `modelRouting` 字段
- Regex-based规则匹配
- 场景：code_tasks → 代码模型，web_search → 快速模型，simple_queries → 最便宜模型

**Issue #6421**: Two-Tier Model Routing
- 提议双层路由架构
- 第一层：Router Model（轻量模型判断任务复杂度）
- 第二层：Primary Model（重模型处理复杂任务）

**Issue #11504**: [Feature Request] Add before_model_select plugin hook
- 提议增加模型选择前hook（已实现为 `before_model_resolve`）

---

#### 5. MCP相关

**调研结果**: 未发现直接为OpenClaw开发的MCP模型路由服务。

现有MCP路由多为：
- 工具路由（选择哪个MCP服务器）
- 而非模型路由（选择哪个LLM）

---

### PolyMind定位

基于调研，PolyMind的差异化定位：

| 维度 | ClawRouter | LLMRouter | iblai | PolyMind (本方案) |
|------|-----------|-----------|-------|------------------|
| 部署方式 | OpenClaw插件 | 独立服务器 | 本地代理 | **OpenClaw插件** ✅ |
| 路由依据 | 成本+能力 | ML分类 | 成本 | **场景匹配** |
| 配置难度 | 中 | 高 | 低 | **低** |
| 中文优化 | 未知 | 未知 | 未知 | **原生支持** |
| 可解释性 | 黑盒评分 | ML模型 | 加权评分 | **规则透明** |
| 用户学习 | 无 | 无 | 无 | **支持偏好学习** |

**核心价值主张**:
> "不是选最便宜的，而是选最懂你的"

---

### 技术借鉴

可从竞品学习的技术点：

1. **ClawRouter**: `before_model_resolve` 最佳实践，15维评分器设计
2. **LLMRouter**: 语义向量分类器（v1.2可引入）
3. **iblai**: 成本统计与反馈闭环（v1.3可引入）

---

*Architecture created: 2026-04-06*
*Target Gateway Version: >=2026.3.24-beta.2*
*Research updated: 2026-04-06*
