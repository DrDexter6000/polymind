# Phrase 1: Plugin 核心 - TDD Plan

> **Phrase**: 1  
> **名称**: Plugin 核心  
> **目标**: 实现 `before_model_resolve` hook，建立路由决策引擎  
> **预计周期**: 2周  
> **前置依赖**: Phrase 0 (基础奠基)

---

## 📋 Phrase 1 总览

| Batch | 名称 | Tasks | 预计工时 |
|-------|------|-------|----------|
| **Batch 001** | Plugin骨架 | 3 | 6h |
| **Batch 002** | Hook注册 | 3 | 8h |
| **Batch 003** | 场景识别 | 3 | 8h |
| **Batch 004** | 模型选择 | 4 | 10h |

---

## Batch 001: Plugin骨架

### Batch 目的

建立 OpenClaw Plugin 标准结构。

### Batch 目标

- [ ] 创建 plugin/index.ts 入口
- [ ] 创建 plugin/manifest.json
- [ ] 创建基础 Plugin 类

### Batch Guiderails

**必须做**:
- 遵循 OpenClaw Plugin API 规范
- 使用官方 `before_model_resolve` hook
- 正确导出 Plugin 类型

**不应该做**:
- ❌ 不要在 plugin 代码中直接操作文件系统
- ❌ 不要在 plugin 中使用 `require()`
- ❌ 不要在 plugin 中使用第三方 HTTP 库（用 fetch）

### Tasks

#### Task 001: 创建 Plugin 入口

**目的**: 建立 Plugin 标准入口文件

**操作指南**:
```typescript
// src/plugin/index.ts
import type { OpenClawPlugin, PluginContext } from 'openclaw';

export interface PolyMindPluginOptions {
  enabled?: boolean;
  debug?: boolean;
}

export const plugin: OpenClawPlugin<PolyMindPluginOptions> = {
  id: 'polymind',
  name: 'PolyMind',
  version: '0.1.0',
  
  async onLoad(context: PluginContext, options: PolyMindPluginOptions) {
    // 初始化逻辑
    console.log('[PolyMind] Plugin loaded');
  },
  
  async onUnload() {
    // 清理逻辑
    console.log('[PolyMind] Plugin unloaded');
  }
};

export default plugin;
```

**验收标准**:
- [ ] `src/plugin/index.ts` 存在
- [ ] 正确导出 `plugin` 对象
- [ ] 可被 TypeScript 编译

---

#### Task 002: 创建 manifest.json

**目的**: 定义 Plugin 元数据

**操作指南**:
```json
// src/plugin/manifest.json
{
  "id": "polymind",
  "name": "PolyMind",
  "version": "0.1.0",
  "description": "Intelligent LLM router and subagent dispatcher",
  "author": "DrDexter6000",
  "license": "MIT",
  "hooks": [
    {
      "name": "before_model_resolve",
      "handler": "src/plugin/hooks/beforeModelResolve"
    }
  ],
  "permissions": []
}
```

**验收标准**:
- [ ] manifest.json 存在
- [ ] hooks 正确声明

---

#### Task 003: 创建基础 Plugin 类

**目的**: 建立可扩展的 Plugin 类结构

**操作指南**:
```typescript
// src/plugin/PolyMindPlugin.ts
import type { OpenClawPlugin, PluginContext } from 'openclaw';
import { SceneClassifier } from './router/SceneClassifier';
import { ModelSelector } from './router/ModelSelector';

export class PolyMindPlugin {
  private enabled: boolean;
  private debug: boolean;
  private sceneClassifier: SceneClassifier;
  private modelSelector: ModelSelector;

  constructor(options: { enabled?: boolean; debug?: boolean } = {}) {
    this.enabled = options.enabled ?? true;
    this.debug = options.debug ?? false;
    this.sceneClassifier = new SceneClassifier();
    this.modelSelector = new ModelSelector();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getSceneClassifier(): SceneClassifier {
    return this.sceneClassifier;
  }

  getModelSelector(): ModelSelector {
    return this.modelSelector;
  }
}
```

**验收标准**:
- [ ] PolyMindPlugin 类存在
- [ ] 包含 sceneClassifier 和 modelSelector
- [ ] 可实例化

---

### Batch 001 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 001 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] src/plugin/index.ts
- [ ] src/plugin/manifest.json
- [ ] src/plugin/PolyMindPlugin.ts

### 问题记录
[如有]

### 验证命令
```bash
npm run build
```
```

---

## Batch 002: Hook注册

### Batch 目的

实现 `before_model_resolve` hook，建立路由拦截能力。

### Batch 目标

- [ ] 创建 beforeModelResolve handler
- [ ] 实现 hook 注册逻辑
- [ ] 实现基础拦截能力

### Batch Guiderails

**必须做**:
- hook 必须返回 `{ modelOverride?, providerOverride? }`
- hook 必须在 pre-session 阶段执行（无 messages）
- hook 必须处理异常，避免崩溃 OpenClaw

**不应该做**:
- ❌ 不要在 hook 中等待用户输入
- ❌ 不要在 hook 中使用 long-blocking 操作
- ❌ 不要在 hook 中抛出未捕获异常

### Tasks

#### Task 001: 创建 Hook Handler 骨架

**目的**: 建立 hook handler 标准结构

**操作指南**:
```typescript
// src/plugin/hooks/beforeModelResolve.ts
import type { BeforeModelResolveHook, ModelResolveContext } from 'openclaw';

export const beforeModelResolve: BeforeModelResolveHook = async (
  context: ModelResolveContext
): Promise<{ modelOverride?: string; providerOverride?: string }> => {
  try {
    // 1. 读取上下文
    const { session, userMessage, currentModel } = context;
    
    // 2. 判断是否启用
    if (!isPolyMindEnabled(session)) {
      return {};
    }
    
    // 3. 返回空，让 OpenClaw 使用默认模型
    return {};
  } catch (error) {
    console.error('[PolyMind] Hook error:', error);
    return {}; // 出错时降级
  }
};

function isPolyMindEnabled(session: any): boolean {
  // TODO: 读取 session 配置
  return true;
}
```

**验收标准**:
- [ ] handler 存在且可编译
- [ ] 正确处理异常
- [ ] 返回标准格式

---

#### Task 002: 实现配置读取

**目的**: 从 session 配置中读取 PolyMind 设置

**操作指南**:
```typescript
// 在 beforeModelResolve.ts 中添加
function readPolyMindConfig(session: any): PolyMindConfig | null {
  // 读取 openclaw.json 中的 polymind 配置
  // 通过 session.config 或环境变量
}
```

**验收标准**:
- [ ] 可读取配置
- [ ] 配置缺失时使用默认值

---

#### Task 003: 测试 Hook 集成

**目的**: 验证 hook 可被 OpenClaw 调用

**操作指南**:
```bash
# 构建项目
npm run build

# 检查 dist/ 输出
ls -la dist/plugin/
```

**验收标准**:
- [ ] hook 代码被正确编译到 dist/
- [ ] manifest.json 被复制到 dist/

---

### Batch 002 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 002 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] src/plugin/hooks/beforeModelResolve.ts
- [ ] hook 注册逻辑

### 问题记录
[如有]

### 验证命令
```bash
# 在 OpenClaw 中加载插件测试
openclaw plugin load ./dist
```
```

---

## Batch 003: 场景识别

### Batch 目的

实现 `SceneClassifier`，根据用户输入判断场景类型。

### Batch 目标

- [ ] 建立场景类型定义
- [ ] 实现关键词匹配
- [ ] 实现语义分类

### Batch Guiderails

**必须做**:
- 支持: coding, reasoning, writing, fast, multimodal
- 使用 LLM_RANKING.md 中的场景定义
- 场景分类必须有明确边界

**不应该做**:
- ❌ 不要在分类中使用 hard-coded 模型名
- ❌ 不要忽略 ambiguous 情况
- ❌ 不要在分类中使用昂贵的 LLM 调用

### Tasks

#### Task 001: 定义场景类型

**目的**: 建立标准化的场景类型系统

**操作指南**:
```typescript
// src/plugin/router/SceneType.ts
export enum SceneType {
  CODING = 'coding',
  REASONING = 'reasoning',
  WRITING = 'writing',
  FAST = 'fast',
  MULTIMODAL = 'multimodal',
  GENERAL = 'general'
}

export interface SceneScore {
  type: SceneType;
  confidence: number; // 0-1
}

export const SCENE_KEYWORDS: Record<SceneType, string[]> = {
  [SceneType.CODING]: [
    'code', 'function', 'class', 'debug', 'refactor',
    'implement', 'api', 'database', 'bug', 'error'
  ],
  [SceneType.REASONING]: [
    'analyze', 'think', 'reason', 'explain', 'compare',
    'evaluate', 'strategy', 'plan', 'research'
  ],
  [SceneType.WRITING]: [
    'write', 'article', 'blog', 'document', 'story',
    'email', 'draft', 'edit', 'summarize'
  ],
  [SceneType.FAST]: [
    'quick', 'simple', 'short', 'one-line', 'quick question'
  ],
  [SceneType.MULTIMODAL]: [
    'image', 'picture', 'photo', 'chart', 'diagram', 'screenshot'
  ],
  [SceneType.GENERAL]: []
};
```

**验收标准**:
- [ ] SceneType 枚举完整
- [ ] 关键词列表合理

---

#### Task 002: 实现 SceneClassifier

**目的**: 根据用户输入分类场景

**操作指南**:
```typescript
// src/plugin/router/SceneClassifier.ts
import { SceneType, SceneScore } from './SceneType';

export class SceneClassifier {
  classify(userMessage: string): SceneScore {
    const text = userMessage.toLowerCase();
    const scores: SceneScore[] = [];
    
    for (const [type, keywords] of Object.entries(SCENE_KEYWORDS)) {
      const score = this.calculateScore(text, keywords);
      if (score > 0) {
        scores.push({ type: type as SceneType, confidence: score });
      }
    }
    
    // 返回最高分
    scores.sort((a, b) => b.confidence - a.confidence);
    return scores[0] || { type: SceneType.GENERAL, confidence: 0 };
  }
  
  private calculateScore(text: string, keywords: string[]): number {
    const matches = keywords.filter(k => text.includes(k));
    return matches.length / keywords.length;
  }
}
```

**验收标准**:
- [ ] 可正确分类已知场景
- [ ] 未分类输入返回 GENERAL

---

#### Task 003: 添加 Agent 上下文感知

**目的**: 根据当前 Agent 角色调整场景

**操作指南**:
```typescript
// 在 SceneClassifier 中添加
classifyWithAgent(userMessage: string, agentType?: string): SceneScore {
  const baseScore = this.classify(userMessage);
  
  // 如果是特定 Agent 类型，优先使用该类型
  if (agentType === 'artisan') {
    return { type: SceneType.CODING, confidence: 0.9 };
  }
  
  return baseScore;
}
```

**验收标准**:
- [ ] Agent 类型影响分类
- [ ] 不破坏原有分类逻辑

---

### Batch 003 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 003 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] src/plugin/router/SceneType.ts
- [ ] src/plugin/router/SceneClassifier.ts

### 测试案例
- [ ] "帮我写个函数" → coding
- [ ] "分析这个问题" → reasoning
- [ ] "写篇文章" → writing

### 验证命令
```bash
npm test -- --testPathPattern=SceneClassifier
```
```

---

## Batch 004: 模型选择

### Batch 目的

实现 `ModelSelector`，根据场景选择最优模型。

### Batch 目标

- [ ] 实现基础模型选择
- [ ] 实现 Fallback 链
- [ ] 实现配置读取

### Batch Guiderails

**必须做**:
- 必须尊重 LLM_RANKING.md 的官方排名
- Fallback 链必须完整
- 配置必须支持用户覆盖

**不应该做**:
- ❌ 不要硬编码模型列表
- ❌ 不要忽略配置中的用户偏好
- ❌ 不要选择未安装的模型

### Tasks

#### Task 001: 创建 ModelSelector 骨架

**目的**: 建立模型选择器标准结构

**操作指南**:
```typescript
// src/plugin/router/ModelSelector.ts
import { SceneType } from './SceneType';
import type { ModelOverride } from '../types';

export class ModelSelector {
  private agentConfigs: Map<string, AgentConfig>;
  
  constructor(agentConfigs?: Record<string, AgentConfig>) {
    this.agentConfigs = new Map(Object.entries(agentConfigs || {}));
  }
  
  select(
    scene: SceneType,
    agentType?: string
  ): ModelOverride {
    // 1. 如果指定了 Agent 类型，使用该类型的配置
    // 2. 否则根据场景选择
    // 3. 返回 { modelOverride, providerOverride }
  }
  
  selectWithFallback(
    scene: SceneType,
    agentType?: string
  ): ModelOverride {
    const primary = this.select(scene, agentType);
    const fallback = this.selectFallback(scene, agentType);
    return {
      ...primary,
      fallbackModels: fallback ? [fallback] : []
    };
  }
}
```

**验收标准**:
- [ ] ModelSelector 类存在
- [ ] 可实例化

---

#### Task 002: 实现 Agent 配置

**目的**: 支持 Agent 角色配置

**操作指南**:
```typescript
// src/plugin/types.ts
export interface AgentConfig {
  primary: {
    model: string;
    provider?: string;
  };
  fallbacks: Array<{
    model: string;
    provider?: string;
  }>;
}

export interface ModelOverride {
  modelOverride?: string;
  providerOverride?: string;
  fallbackModels?: ModelOverride[];
}
```

**验收标准**:
- [ ] 类型定义完整
- [ ] 可序列化为 JSON

---

#### Task 003: 实现 Fallback 逻辑

**目的**: 保证模型可用性的 Fallback 链

**操作指南**:
```typescript
// 在 ModelSelector 中添加
selectFallback(
  scene: SceneType,
  agentType?: string
): ModelOverride | null {
  // 1. 读取配置的 fallbacks
  // 2. 按优先级返回
  // 3. 如果没有配置，返回 null
}
```

**验收标准**:
- [ ] Fallback 链完整
- [ ] 避免死循环

---

#### Task 004: 整合 SceneClassifier

**目的**: 端到端场景→模型选择

**操作指南**:
```typescript
// src/plugin/router/Router.ts
import { SceneClassifier } from './SceneClassifier';
import { ModelSelector } from './ModelSelector';

export class Router {
  constructor(
    private classifier: SceneClassifier,
    private selector: ModelSelector
  ) {}
  
  route(
    userMessage: string,
    agentType?: string
  ): ModelOverride {
    // 1. 分类场景
    const scene = this.classifier.classifyWithAgent(userMessage, agentType);
    
    // 2. 选择模型
    return this.selector.selectWithFallback(scene.type, agentType);
  }
}
```

**验收标准**:
- [ ] 端到端可工作
- [ ] 测试覆盖常见场景

---

### Batch 004 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 004 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] src/plugin/router/ModelSelector.ts
- [ ] src/plugin/router/Router.ts
- [ ] 端到端路由

### 测试案例
- [ ] "帮我写个函数" → kimi-k2.5
- [ ] "分析这个问题" → GLM-5.1
- [ ] "快速回答" → MiniMax-M2.7

### 验证命令
```bash
npm test -- --testPathPattern=Router
```
```

---

## 📊 Phrase 1 总结

### 完成标准

所有 Batch 执行成功，且:
- [ ] Plugin 可加载
- [ ] Hook 可被调用
- [ ] 场景分类准确
- [ ] 模型选择正确

### 执行记录

| Batch | 执行日期 | 执行人 | 结果 |
|-------|---------|--------|------|
| Batch 001 | | | |
| Batch 002 | | | |
| Batch 003 | | | |
| Batch 004 | | | |

### Phrase 1 最终状态

**状态**: 📋 待开始 → 🔄 进行中 → ✅ 完成

**完成日期**: 

---

*Phrase 1 - Plugin 核心 - TDD Plan v1.0*