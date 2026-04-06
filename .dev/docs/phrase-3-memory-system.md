# Phrase 3: 记忆系统 - TDD Plan

> **Phrase**: 3  
> **名称**: 记忆系统  
> **目标**: 实现 `.polymind/` 私有存储，建立进化机制  
> **预计周期**: 2周  
> **前置依赖**: Phrase 2 (Skill接口)

---

## 📋 Phrase 3 总览

| Batch | 名称 | Tasks | 预计工时 |
|-------|------|-------|----------|
| **Batch 001** | 存储层 | 3 | 6h |
| **Batch 002** | 路由记录 | 3 | 8h |
| **Batch 003** | 用户偏好 | 3 | 6h |
| **Batch 004** | 进化引擎 | 4 | 10h |

---

## Batch 001: 存储层

### Batch 目的

建立 PolyMind 私有存储基础设施，与 ClawMemory 完全隔离。

### Batch 目标

- [ ] 创建存储目录结构
- [ ] 实现 JSON 存储引擎
- [ ] 实现读写锁

### Batch Guiderails

**必须做**:
- 所有数据存在 `.polymind/` 目录
- 不触碰 `memory/` 或 `users/` 目录
- 使用 JSON 文件存储

**不应该做**:
- ❌ 不要使用数据库（SQLite/Redis）
- ❌ 不要存储敏感信息（API keys）
- ❌ 不要在内存中缓存大量数据

### Tasks

#### Task 001: 创建目录结构

**目的**: 建立标准化的目录结构

**操作指南**:
```typescript
// src/memory/directories.ts
import path from 'path';
import fs from 'fs/promises';

const BASE_DIR = '.polymind';

export const DIRS = {
  ROOT: BASE_DIR,
  ROUTING: `${BASE_DIR}/routing`,
  PREFERENCES: `${BASE_DIR}/preferences`,
  PERFORMANCE: `${BASE_DIR}/performance`,
  LOGS: `${BASE_DIR}/logs`
} as const;

export async function ensureDirectories(): Promise<void> {
  for (const dir of Object.values(DIRS)) {
    await fs.mkdir(dir, { recursive: true });
  }
}
```

**验收标准**:
- [ ] 目录创建成功
- [ ] 目录结构正确

---

#### Task 002: 实现 JSON 存储引擎

**目的**: 提供简单的 KV 存储接口

**操作指南**:
```typescript
// src/memory/Storage.ts
import fs from 'fs/promises';
import path from 'path';

export class Storage {
  async read<T>(filename: string, defaultValue: T): Promise<T> {
    const filepath = path.join(DIRS.ROOT, filename);
    try {
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }
  
  async write<T>(filename: string, data: T): Promise<void> {
    const filepath = path.join(DIRS.ROOT, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  }
  
  async update<T>(
    filename: string,
    updater: (current: T) => T,
    defaultValue: T
  ): Promise<T> {
    const current = await this.read<T>(filename, defaultValue);
    const updated = updater(current);
    await this.write(filename, updated);
    return updated;
  }
}
```

**验收标准**:
- [ ] 读写正常
- [ ] 原子写入

---

#### Task 003: 实现读写锁

**目的**: 防止并发写入冲突

**操作指南**:
```typescript
// src/memory/Lock.ts
import fs from 'fs/promises';

export class ReadWriteLock {
  private locks = new Map<string, Promise<void>>();
  
  async acquireWrite(key: string): Promise<() => void> {
    // 等待现有锁释放
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }
    
    // 创建新锁
    let release: () => void;
    const lockPromise = new Promise<void>(resolve => {
      release = resolve;
    });
    this.locks.set(key, lockPromise);
    
    return () => {
      this.locks.delete(key);
      release!();
    };
  }
  
  async withWrite<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const release = await this.acquireWrite(key);
    try {
      return await fn();
    } finally {
      release();
    }
  }
}
```

**验收标准**:
- [ ] 并发安全
- [ ] 无死锁

---

### Batch 001 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 001 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] src/memory/directories.ts
- [ ] src/memory/Storage.ts
- [ ] src/memory/Lock.ts

### 验证命令
```bash
# 检查目录创建
ls -la .polymind/

# 测试并发
npm test -- --testPathPattern=Storage
```
```

---

## Batch 002: 路由记录

### Batch 目的

实现路由决策的记录和查询功能。

### Batch 目标

- [ ] 记录每次路由决策
- [ ] 实现决策查询
- [ ] 实现决策统计

### Batch Guiderails

**必须做**:
- 记录: 时间戳、场景、选择的模型、用户反馈
- 保留最近 30 天记录
- 支持按场景查询

**不应该做**:
- ❌ 不要记录消息内容
- ❌ 不要记录用户身份信息
- ❌ 不要记录 API 响应内容

### Tasks

#### Task 001: 定义决策数据结构

**目的**: 建立路由决策的标准化数据结构

**操作指南**:
```typescript
// src/memory/types/RoutingDecision.ts
export interface RoutingDecision {
  id: string;
  timestamp: string;       // ISO 8601
  scene: SceneType;        // coding/reasoning/writing
  requestedModel?: string;  // 用户请求的模型
  selectedModel: string;
  selectedProvider: string;
  fallbackUsed: boolean;
  userFeedback?: 'accepted' | 'changed' | 'rejected';
  latencyMs: number;
  success: boolean;
}

export interface RoutingStats {
  totalDecisions: number;
  byScene: Record<SceneType, number>;
  byModel: Record<string, number>;
  averageLatencyMs: number;
  fallbackRate: number;
}
```

**验收标准**:
- [ ] 数据结构完整
- [ ] 可序列化

---

#### Task 002: 实现决策存储

**目的**: 记录每次路由决策

**操作指南**:
```typescript
// src/memory/RoutingLog.ts
import { Storage } from './Storage';
import { DIRS } from './directories';
import type { RoutingDecision, RoutingStats } from './types/RoutingDecision';

export class RoutingLog {
  constructor(private storage: Storage) {}
  
  async record(decision: Omit<RoutingDecision, 'id'>): Promise<void> {
    const decisions = await this.storage.read<RoutingDecision[]>(
      `${DIRS.ROUTING}/decisions.json`,
      []
    );
    
    decisions.push({
      ...decision,
      id: generateId()
    });
    
    // 保留 30 天
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    
    const filtered = decisions.filter(
      d => new Date(d.timestamp) > cutoff
    );
    
    await this.storage.write(`${DIRS.ROUTING}/decisions.json`, filtered);
  }
  
  async getStats(): Promise<RoutingStats> {
    // 计算统计
  }
}
```

**验收标准**:
- [ ] 决策被正确存储
- [ ] 30 天自动清理

---

#### Task 003: 实现决策查询

**目的**: 支持分析和调试

**操作指南**:
```typescript
// 在 RoutingLog 中添加
async query(options: {
  scene?: SceneType;
  model?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<RoutingDecision[]> {
  // 查询逻辑
}

async getModelPerformance(): Promise<Record<string, {
  count: number;
  fallbackRate: number;
  averageLatency: number;
}>> {
  // 模型表现统计
}
```

**验收标准**:
- [ ] 可按场景查询
- [ ] 可按模型统计

---

### Batch 002 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 002 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] RoutingDecision 类型
- [ ] RoutingLog 类
- [ ] 决策查询接口

### 验证命令
```bash
npm test -- --testPathPattern=RoutingLog
```
```

---

## Batch 003: 用户偏好

### Batch 目的

实现用户偏好的存储和更新机制。

### Batch 目标

- [ ] 存储性价比排名
- [ ] 存储速度排名
- [ ] 实现偏好更新

### Batch Guiderails

**必须做**:
- 用户主动更新偏好
- 记录偏好更新时间
- 支持偏好导入/导出

**不应该做**:
- ❌ 不要自动推断用户偏好
- ❌ 不要在后台偷偷更新偏好
- ❌ 不要共享偏好数据

### Tasks

#### Task 001: 定义偏好结构

**目的**: 标准化用户偏好数据

**操作指南**:
```typescript
// src/memory/types/UserPreferences.ts
export interface UserPreferences {
  costRanking: string[];      // 性价比从高到低
  speedRanking: string[];     // 速度从快到慢
  preferredAgents: string[];   // 常使用的 Agent
  specialRequirements: {
    chineseSupport?: boolean;
    multimodalSupport?: boolean;
    codingFocus?: boolean;
  };
  updatedAt: string;          // ISO 8601
  updatedBy: 'user' | 'system';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  costRanking: [],
  speedRanking: [],
  preferredAgents: [],
  specialRequirements: {},
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};
```

**验收标准**:
- [ ] 结构完整
- [ ] 有默认值

---

#### Task 002: 实现偏好存储

**目的**: 存储用户偏好

**操作指南**:
```typescript
// src/memory/PreferenceStore.ts
export class PreferenceStore {
  async get(): Promise<UserPreferences> {
    return this.storage.read<UserPreferences>(
      `${DIRS.PREFERENCES}/user.json`,
      DEFAULT_PREFERENCES
    );
  }
  
  async update(
    updates: Partial<UserPreferences>,
    source: 'user' | 'system' = 'user'
  ): Promise<void> {
    const current = await this.get();
    const updated: UserPreferences = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: source
    };
    await this.storage.write(
      `${DIRS.PREFERENCES}/user.json`,
      updated
    );
  }
  
  async export(): Promise<string> {
    const prefs = await this.get();
    return JSON.stringify(prefs);
  }
  
  async import(json: string): Promise<void> {
    const prefs = JSON.parse(json) as UserPreferences;
    await this.update(prefs, 'user');
  }
}
```

**验收标准**:
- [ ] 读写正常
- [ ] 导入/导出正常

---

#### Task 003: 实现偏好整合

**目的**: 在路由时考虑用户偏好

**操作指南**:
```typescript
// 在 ModelSelector 中添加偏好感知
import { PreferenceStore } from '../memory/PreferenceStore';

class PreferenceAwareSelector {
  constructor(
    private baseSelector: ModelSelector,
    private preferenceStore: PreferenceStore
  ) {}
  
  async select(
    scene: SceneType,
    agentType?: string
  ): Promise<ModelOverride> {
    const prefs = await this.preferenceStore.get();
    
    // 将用户排名转换为权重
    const userWeights = this.buildUserWeights(prefs);
    
    // 结合官方排名和用户偏好
    return this.baseSelector.selectWithWeights(scene, agentType, userWeights);
  }
}
```

**验收标准**:
- [ ] 偏好影响选择
- [ ] 不破坏原有逻辑

---

### Batch 003 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 003 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] UserPreferences 类型
- [ ] PreferenceStore 类
- [ ] 偏好整合

### 验证命令
```bash
npm test -- --testPathPattern=Preference
```
```

---

## Batch 004: 进化引擎

### Batch 目的

实现自动学习和进化机制。

### Batch 目标

- [ ] 实现用户反馈捕获
- [ ] 实现模式识别
- [ ] 实现自动调整
- [ ] 实现进化日志

### Batch Guiderails

**必须做**:
- 用户反馈触发学习
- 记录所有进化事件
- 支持关闭自动进化

**不应该做**:
- ❌ 不要自动大幅修改配置
- ❌ 不要在未确认情况下保存更改
- ❌ 不要基于少量数据做结论

### Tasks

#### Task 001: 实现反馈捕获

**目的**: 捕获用户对路由决策的反馈

**操作指南**:
```typescript
// src/memory/FeedbackCollector.ts
export class FeedbackCollector {
  async capture(
    decisionId: string,
    feedback: 'accepted' | 'changed' | 'rejected',
    changedTo?: string
  ): Promise<void> {
    // 1. 更新决策记录
    await this.routingLog.updateFeedback(decisionId, feedback, changedTo);
    
    // 2. 记录到进化日志
    await this.evolutionLog.record({
      type: 'user_feedback',
      decisionId,
      feedback,
      changedTo,
      timestamp: new Date().toISOString()
    });
    
    // 3. 如果反馈是 changed，触发学习
    if (feedback === 'changed' && changedTo) {
      await this.learnFromChange(decisionId, changedTo);
    }
  }
}
```

**验收标准**:
- [ ] 反馈被正确记录
- [ ] 反馈触发学习

---

#### Task 002: 实现模式识别

**目的**: 从历史数据中发现模式

**操作指南**:
```typescript
// src/memory/PatternRecognizer.ts
export class PatternRecognizer {
  async recognizePatterns(): Promise<Pattern[]> {
    const decisions = await this.routingLog.getRecent(1000);
    const patterns: Pattern[] = [];
    
    // 1. 发现高频 fallback 模式
    const fallbackPatterns = this.findFallbackPatterns(decisions);
    patterns.push(...fallbackPatterns);
    
    // 2. 发现场景-模型偏好
    const scenePreferences = this.findScenePreferences(decisions);
    patterns.push(...scenePreferences);
    
    // 3. 发现性能问题
    const performanceIssues = this.findPerformanceIssues(decisions);
    patterns.push(...performanceIssues);
    
    return patterns;
  }
  
  private findFallbackPatterns(decisions: RoutingDecision[]): Pattern[] {
    // 识别哪些模型经常被 fallback
    // 如果某模型在 70%+ 的情况下都是 fallback，
    // 说明该模型可能存在问题
  }
  
  private findScenePreferences(decisions: RoutingDecision[]): Pattern[] {
    // 识别用户对特定场景的模型偏好
    // 如果用户在 coding 场景经常拒绝 kimi-k2.5
    // 说明可能需要在 coding 场景降低 kimi-k2.5 的优先级
  }
}
```

**验收标准**:
- [ ] 可识别 fallback 模式
- [ ] 可识别场景偏好

---

#### Task 003: 实现自动调整

**目的**: 基于学习结果调整推荐

**操作指南**:
```typescript
// src/memory/EvolutionEngine.ts
export class EvolutionEngine {
  async evolve(): Promise<EvolutionResult> {
    const patterns = await this.patternRecognizer.recognizePatterns();
    const suggestions: Suggestion[] = [];
    
    for (const pattern of patterns) {
      if (pattern.confidence > 0.8) {
        const suggestion = this.generateSuggestion(pattern);
        suggestions.push(suggestion);
      }
    }
    
    // 返回建议，等待用户确认
    return {
      patterns,
      suggestions,
      timestamp: new Date().toISOString()
    };
  }
  
  async applySuggestion(suggestion: Suggestion): Promise<void> {
    // 应用建议前必须用户确认
    const confirmed = await this.askUserConfirmation(suggestion);
    if (confirmed) {
      await this.configurator.applySuggestion(suggestion);
      await this.evolutionLog.record({
        type: 'suggestion_applied',
        suggestion,
        timestamp: new Date().toISOString()
      });
    }
  }
}
```

**验收标准**:
- [ ] 生成合理的建议
- [ ] 需要用户确认

---

#### Task 004: 实现进化日志

**目的**: 记录所有进化事件

**操作指南**:
```typescript
// src/memory/EvolutionLog.ts
export interface EvolutionEvent {
  id: string;
  type: 'user_feedback' | 'pattern_identified' | 'suggestion_generated' | 'suggestion_applied';
  timestamp: string;
  data: Record<string, unknown>;
}

export class EvolutionLog {
  async record(event: Omit<EvolutionEvent, 'id'>): Promise<void> {
    const events = await this.storage.read<EvolutionEvent[]>(
      `${DIRS.LOGS}/evolution.json`,
      []
    );
    
    events.push({
      ...event,
      id: generateId()
    });
    
    // 保留 90 天
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    
    const filtered = events.filter(
      e => new Date(e.timestamp) > cutoff
    );
    
    await this.storage.write(`${DIRS.LOGS}/evolution.json`, filtered);
  }
  
  async getTimeline(limit = 50): Promise<EvolutionEvent[]> {
    const events = await this.storage.read<EvolutionEvent[]>(
      `${DIRS.LOGS}/evolution.json`,
      []
    );
    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}
```

**验收标准**:
- [ ] 事件被记录
- [ ] 90 天自动清理

---

### Batch 004 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 004 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] FeedbackCollector
- [ ] PatternRecognizer
- [ ] EvolutionEngine
- [ ] EvolutionLog

### 验证命令
```bash
npm test -- --testPathPattern=Evolution
```
```

---

## 📊 Phrase 3 总结

### 完成标准

所有 Batch 执行成功，且:
- [ ] 数据隔离正确
- [ ] 路由记录功能完整
- [ ] 偏好存储功能完整
- [ ] 进化引擎可工作

### 执行记录

| Batch | 执行日期 | 执行人 | 结果 |
|-------|---------|--------|------|
| Batch 001 | | | |
| Batch 002 | | | |
| Batch 003 | | | |
| Batch 004 | | | |

### Phrase 3 最终状态

**状态**: 📋 待开始 → 🔄 进行中 → ✅ 完成

**完成日期**: 

---

*Phrase 3 - 记忆系统 - TDD Plan v1.0*