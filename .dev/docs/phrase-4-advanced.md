# Phrase 4: 高级编排 - TDD Plan

> **Phrase**: 4  
> **名称**: 高级编排  
> **目标**: 实现 Harness Framework，达到完全形态  
> **预计周期**: 3周  
> **前置依赖**: Phrase 3 (记忆系统)

---

## 📋 Phrase 4 总览

| Batch | 名称 | Tasks | 预计工时 |
|-------|------|-------|----------|
| **Batch 001** | Agent注册 | 3 | 8h |
| **Batch 002** | 任务队列 | 3 | 10h |
| **Batch 003** | 编排引擎 | 4 | 12h |
| **Batch 004** | 自动化 | 3 | 8h |

---

## Batch 001: Agent注册

### Batch 目的

实现 6 大 Agent 角色的注册和配置系统。

### Batch 目标

- [ ] 定义 Agent 类型系统
- [ ] 实现 Agent 注册表
- [ ] 实现 Agent 工厂

### Batch Guiderails

**必须做**:
- 6 个 Agent 类型: Maestro, Oracle, Artisan, Scholar, Scribe, Envoy, Warden
- 每个 Agent 有明确的 persona 和职责
- Agent 配置可序列化

**不应该做**:
- ❌ 不要让 Agent 职责重叠
- ❌ 不要硬编码 Agent 行为
- ❌ 不要让 Agent 直接调用其他 Agent

### Tasks

#### Task 001: 定义 Agent 类型

**目的**: 建立标准化的 Agent 类型系统

**操作指南**:
```typescript
// src/agents/types/AgentType.ts
export enum AgentType {
  MAESTRO = 'maestro',
  ORACLE = 'oracle',
  ARTISAN = 'artisan',
  SCHOLAR = 'scholar',
  SCRIBE = 'scribe',
  ENVOY = 'envoy',
  WARDEN = 'warden'
}

export interface AgentDefinition {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  defaultModel?: string;
  prompt?: string;
}

export const AGENT_DEFINITIONS: Record<AgentType, AgentDefinition> = {
  [AgentType.MAESTRO]: {
    type: AgentType.MAESTRO,
    name: 'Maestro',
    description: 'Strategic planner for complex multi-step goals',
    capabilities: ['planning', 'goal-decomposition', 'reasoning'],
    prompt: 'You are Maestro, a strategic planner...'
  },
  [AgentType.ORACLE]: {
    type: AgentType.ORACLE,
    name: 'Oracle',
    description: 'Plan validator and risk assessor',
    capabilities: ['validation', 'risk-assessment', 'verification'],
    prompt: 'You are Oracle, a careful validator...'
  },
  [AgentType.ARTISAN]: {
    type: AgentType.ARTISAN,
    name: 'Artisan',
    description: 'Code generation and debugging specialist',
    capabilities: ['coding', 'debugging', 'refactoring', 'code-review'],
    prompt: 'You are Artisan, a code craftsman...'
  },
  [AgentType.SCHOLAR]: {
    type: AgentType.SCHOLAR,
    name: 'Scholar',
    description: 'Research and analysis specialist',
    capabilities: ['research', 'analysis', 'fact-checking', 'web-search'],
    prompt: 'You are Scholar, a research expert...'
  },
  [AgentType.SCRIBE]: {
    type: AgentType.SCRIBE,
    name: 'Scribe',
    description: 'Content creation and documentation specialist',
    capabilities: ['writing', 'editing', 'summarization', 'documentation'],
    prompt: 'You are Scribe, a skilled writer...'
  },
  [AgentType.ENVOY]: {
    type: AgentType.ENVOY,
    name: 'Envoy',
    description: 'Communication and notification specialist',
    capabilities: ['communication', 'notifications', 'summary', 'tts'],
    prompt: 'You are Envoy, a clear communicator...'
  },
  [AgentType.WARDEN]: {
    type: AgentType.WARDEN,
    name: 'Warden',
    description: 'Security and operations monitoring specialist',
    capabilities: ['security', 'monitoring', 'audit', 'health-check'],
    prompt: 'You are Warden, a vigilant guardian...'
  }
};
```

**验收标准**:
- [ ] 7 个 Agent 定义完整
- [ ] 每个 Agent 有唯一的 capabilities

---

#### Task 002: 实现 Agent 注册表

**目的**: 管理 Agent 的注册和查询

**操作指南**:
```typescript
// src/agents/AgentRegistry.ts
export class AgentRegistry {
  private agents = new Map<AgentType, AgentDefinition>();
  
  constructor() {
    // 注册所有默认 Agent
    for (const [type, definition] of Object.entries(AGENT_DEFINITIONS)) {
      this.register(type as AgentType, definition);
    }
  }
  
  register(type: AgentType, definition: AgentDefinition): void {
    this.agents.set(type, definition);
  }
  
  get(type: AgentType): AgentDefinition | undefined {
    return this.agents.get(type);
  }
  
  getAll(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }
  
  findByCapability(capability: string): AgentDefinition[] {
    return this.getAll().filter(
      agent => agent.capabilities.includes(capability)
    );
  }
}
```

**验收标准**:
- [ ] 可注册/查询 Agent
- [ ] 可按 capability 查找

---

#### Task 003: 实现 Agent 工厂

**目的**: 创建 Agent 实例

**操作指南**:
```typescript
// src/agents/AgentFactory.ts
import type { Agent, AgentConfig } from './types';

export class AgentFactory {
  constructor(
    private registry: AgentRegistry,
    private modelSelector: ModelSelector
  ) {}
  
  create(
    type: AgentType,
    config?: Partial<AgentConfig>
  ): Agent {
    const definition = this.registry.get(type);
    if (!definition) {
      throw new Error(`Unknown agent type: ${type}`);
    }
    
    const model = this.modelSelector.select(
      this.mapTypeToScene(type),
      type
    );
    
    return {
      id: generateId(),
      type,
      name: definition.name,
      capabilities: definition.capabilities,
      model,
      config: {
        maxRetries: 3,
        timeout: 30000,
        ...config
      },
      createdAt: new Date().toISOString()
    };
  }
  
  private mapTypeToScene(type: AgentType): SceneType {
    switch (type) {
      case AgentType.ARTISAN:
        return SceneType.CODING;
      case AgentType.SCHOLAR:
        return SceneType.REASONING;
      case AgentType.SCRIBE:
        return SceneType.WRITING;
      case AgentType.ENVOY:
        return SceneType.FAST;
      default:
        return SceneType.REASONING;
    }
  }
}
```

**验收标准**:
- [ ] 可创建 Agent 实例
- [ ] 每个 Agent 有正确的模型

---

### Batch 001 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 001 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] AgentType 定义
- [ ] AgentRegistry
- [ ] AgentFactory

### 验证命令
```bash
npm test -- --testPathPattern=Agent
```
```

---

## Batch 002: 任务队列

### Batch 目的

实现多任务调度和优先级管理。

### Batch 目标

- [ ] 实现任务队列
- [ ] 实现优先级调度
- [ ] 实现任务状态管理

### Batch Guiderails

**必须做**:
- 支持优先级: P0 > P1 > P2 > P3
- 支持任务状态: pending, running, completed, failed
- 支持任务取消

**不应该做**:
- ❌ 不要让低优先级任务饿死
- ❌ 不要在内存中存储大量任务
- ❌ 不要让任务无限重试

### Tasks

#### Task 001: 定义任务结构

**目的**: 建立标准化的任务数据结构

**操作指南**:
```typescript
// src/queue/types/Task.ts
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  P0_CRITICAL = 0,  // 最高
  P1_HIGH = 1,
  P2_NORMAL = 2,
  P3_LOW = 3
}

export interface Task {
  id: string;
  type: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: AgentType;
  result?: unknown;
  error?: string;
  retries: number;
  maxRetries: number;
}
```

**验收标准**:
- [ ] 任务结构完整
- [ ] 状态机正确

---

#### Task 002: 实现优先级队列

**目的**: 基于优先级的任务调度

**操作指南**:
```typescript
// src/queue/PriorityQueue.ts
export class PriorityQueue {
  private queues = new Map<TaskPriority, Task[]>();
  
  constructor() {
    // 初始化所有优先级的队列
    for (const p of Object.values(TaskPriority)) {
      this.queues.set(p, []);
    }
  }
  
  enqueue(task: Task): void {
    const queue = this.queues.get(task.priority);
    if (!queue) return;
    queue.push(task);
  }
  
  dequeue(): Task | undefined {
    // 按优先级从高到低查找
    for (const [priority, queue] of this.queues) {
      if (queue.length > 0) {
        return queue.shift();
      }
    }
    return undefined;
  }
  
  peek(): Task | undefined {
    for (const [priority, queue] of this.queues) {
      if (queue.length > 0) {
        return queue[0];
      }
    }
    return undefined;
  }
  
  size(): number {
    return Array.from(this.queues.values())
      .reduce((sum, q) => sum + q.length, 0);
  }
}
```

**验收标准**:
- [ ] 优先级正确
- [ ] FIFO 正确

---

#### Task 003: 实现任务管理器

**目的**: 统一管理任务生命周期

**操作指南**:
```typescript
// src/queue/TaskManager.ts
export class TaskManager {
  constructor(
    private queue: PriorityQueue,
    private storage: Storage
  ) {}
  
  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'retries'>): Promise<string> {
    const fullTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retries: 0
    };
    
    this.queue.enqueue(fullTask);
    await this.persistTasks();
    
    return fullTask.id;
  }
  
  async next(): Promise<Task | undefined> {
    const task = this.queue.dequeue();
    if (task) {
      task.status = TaskStatus.RUNNING;
      task.updatedAt = new Date().toISOString();
      await this.persistTasks();
    }
    return task;
  }
  
  async complete(taskId: string, result: unknown): Promise<void> {
    const task = await this.find(taskId);
    if (task) {
      task.status = TaskStatus.COMPLETED;
      task.result = result;
      task.updatedAt = new Date().toISOString();
      await this.persistTasks();
    }
  }
  
  async fail(taskId: string, error: string): Promise<void> {
    const task = await this.find(taskId);
    if (task) {
      task.retries++;
      if (task.retries >= task.maxRetries) {
        task.status = TaskStatus.FAILED;
        task.error = error;
      }
      task.updatedAt = new Date().toISOString();
      await this.persistTasks();
    }
  }
  
  async cancel(taskId: string): Promise<void> {
    const task = await this.find(taskId);
    if (task && task.status === TaskStatus.PENDING) {
      task.status = TaskStatus.CANCELLED;
      task.updatedAt = new Date().toISOString();
      await this.persistTasks();
    }
  }
}
```

**验收标准**:
- [ ] 任务生命周期正确
- [ ] 持久化正确

---

### Batch 002 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 002 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] Task 类型
- [ ] PriorityQueue
- [ ] TaskManager

### 验证命令
```bash
npm test -- --testPathPattern=Task
```
```

---

## Batch 003: 编排引擎

### Batch 目的

实现 Maestro/Oracle 编排逻辑，实现多 Agent 协作。

### Batch 目标

- [ ] 实现 Maestro 规划器
- [ ] 实现 Oracle 审查器
- [ ] 实现多 Agent 协作

### Batch Guiderails

**必须做**:
- Maestro 负责任务分解
- Oracle 负责计划验证
- 多 Agent 协作时保证数据一致性

**不应该做**:
- ❌ 不要让 Agent 之间直接通信
- ❌ 不要让 Agent 访问共享状态
- ❌ 不要让单个 Agent 阻塞整个流程

### Tasks

#### Task 001: 实现 Maestro 规划器

**目的**: 将复杂目标分解为可执行的任务

**操作指南**:
```typescript
// src/orchestration/Maestro.ts
export interface Plan {
  id: string;
  goal: string;
  steps: PlanStep[];
  estimatedDuration: number;
  risks: string[];
}

export interface PlanStep {
  id: string;
  description: string;
  agent: AgentType;
  dependsOn: string[];
  parallelWith: string[];
}

export class MaestroPlanner {
  async plan(goal: string): Promise<Plan> {
    // 1. 分析目标
    const analysis = await this.analyzeGoal(goal);
    
    // 2. 分解步骤
    const steps = await this.decompose(analysis);
    
    // 3. 识别依赖
    const dependencyGraph = this.buildDependencyGraph(steps);
    
    // 4. 识别风险
    const risks = this.identifyRisks(steps);
    
    // 5. 估算时间
    const estimatedDuration = this.estimateDuration(steps);
    
    return {
      id: generateId(),
      goal,
      steps,
      estimatedDuration,
      risks
    };
  }
  
  private async analyzeGoal(goal: string): Promise<GoalAnalysis> {
    // 分析目标类型、复杂度、所需能力
  }
  
  private async decompose(analysis: GoalAnalysis): Promise<PlanStep[]> {
    // 将目标分解为可执行的步骤
  }
}
```

**验收标准**:
- [ ] 可分解简单目标
- [ ] 生成可执行的 Plan

---

#### Task 002: 实现 Oracle 审查器

**目的**: 验证计划的安全性、可行性

**操作指南**:
```typescript
// src/orchestration/Oracle.ts
export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  risks: string[];
  suggestions: string[];
}

export class OracleValidator {
  async validate(plan: Plan): Promise<ValidationResult> {
    const warnings: string[] = [];
    const risks: string[] = [];
    const suggestions: string[] = [];
    
    // 1. 检查步骤完整性
    const completeness = this.checkCompleteness(plan);
    if (!completeness.valid) {
      warnings.push(...completeness.warnings);
    }
    
    // 2. 检查依赖环
    const hasCycle = this.hasDependencyCycle(plan.steps);
    if (hasCycle) {
      risks.push('计划存在依赖环，可能导致死锁');
    }
    
    // 3. 检查资源需求
    const resources = this.checkResourceRequirements(plan);
    if (resources.exceeds) {
      risks.push(`资源需求过高: ${resources.details}`);
    }
    
    // 4. 检查风险
    const riskAssessment = await this.assessRisks(plan);
    risks.push(...riskAssessment);
    
    return {
      valid: risks.filter(r => r.includes('严重')).length === 0,
      warnings,
      risks,
      suggestions
    };
  }
  
  async suggestImprovements(plan: Plan): Promise<string[]> {
    // 基于历史数据提供优化建议
  }
}
```

**验收标准**:
- [ ] 可识别计划问题
- [ ] 给出合理的改进建议

---

#### Task 003: 实现任务执行器

**目的**: 按计划执行任务

**操作指南**:
```typescript
// src/orchestration/TaskExecutor.ts
export class TaskExecutor {
  constructor(
    private taskManager: TaskManager,
    private agentFactory: AgentFactory,
    private sessionManager: SessionManager
  ) {}
  
  async execute(plan: Plan): Promise<ExecutionResult> {
    const results: Map<string, unknown> = new Map();
    const executedSteps = new Set<string>();
    
    // 1. 按依赖顺序执行
    while (executedSteps.size < plan.steps.length) {
      // 找到可以执行的步骤（依赖已满足）
      const readySteps = plan.steps.filter(step => {
        if (executedSteps.has(step.id)) return false;
        return step.dependsOn.every(dep => executedSteps.has(dep));
      });
      
      // 并行执行独立的步骤
      const parallelGroups = this.groupParallelSteps(readySteps);
      
      for (const group of parallelGroups) {
        const promises = group.map(step => this.executeStep(step));
        const groupResults = await Promise.allSettled(promises);
        
        for (const [i, result] of groupResults.entries()) {
          if (result.status === 'fulfilled') {
            results.set(group[i].id, result.value);
            executedSteps.add(group[i].id);
          } else {
            // 处理失败
            throw new Error(`Step ${group[i].id} failed: ${result.reason}`);
          }
        }
      }
    }
    
    return { success: true, results: Object.fromEntries(results) };
  }
  
  private async executeStep(step: PlanStep): Promise<unknown> {
    // 1. 创建 Agent
    const agent = this.agentFactory.create(step.agent);
    
    // 2. 创建任务
    const taskId = await this.taskManager.create({
      type: step.agent,
      description: step.description,
      priority: TaskPriority.P2_NORMAL,
      status: TaskStatus.PENDING,
      assignedAgent: step.agent,
      maxRetries: 3
    });
    
    // 3. 分配给 session
    const session = await this.sessionManager.create(agent, {
      taskId,
      description: step.description
    });
    
    // 4. 执行并返回结果
    return session.execute();
  }
}
```

**验收标准**:
- [ ] 按依赖顺序执行
- [ ] 并行执行独立任务

---

#### Task 004: 实现结果聚合器

**目的**: 汇总多 Agent 执行结果

**操作指南**:
```typescript
// src/orchestration/ResultAggregator.ts
export class ResultAggregator {
  async aggregate(results: Map<string, unknown>): Promise<AggregatedResult> {
    // 1. 按类型分类结果
    const byAgent = this.groupByAgent(results);
    
    // 2. 检测冲突
    const conflicts = this.detectConflicts(byAgent);
    
    // 3. 解决冲突
    const resolved = this.resolveConflicts(conflicts);
    
    // 4. 生成最终报告
    return this.generateReport(byAgent, resolved);
  }
  
  private detectConflicts(results: Map<string, Result[]>): Conflict[] {
    // 检测不同 Agent 结果之间的冲突
  }
  
  private resolveConflicts(conflicts: Conflict[]): Resolution[] {
    // 解决冲突策略
  }
}
```

**验收标准**:
- [ ] 正确聚合结果
- [ ] 正确处理冲突

---

### Batch 003 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 003 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] Maestro
- [ ] Oracle
- [ ] TaskExecutor
- [ ] ResultAggregator

### 验证命令
```bash
npm test -- --testPathPattern=Orchestration
```
```

---

## Batch 004: 自动化

### Batch 目的

实现 Cron 调度和自主运行能力。

### Batch 目标

- [ ] 实现 Cron 调度器
- [ ] 实现健康检查
- [ ] 实现自动恢复

### Batch Guiderails

**必须做**:
- Cron 任务使用 OpenClaw cron 系统
- 健康检查不执行修改操作
- 自动恢复需要用户确认

**不应该做**:
- ❌ 不要在 Cron 中执行大量任务
- ❌ 不要在后台静默修改配置
- ❌ 不要忽略错误

### Tasks

#### Task 001: 实现 Cron 调度器

**目的**: 支持定时任务

**操作指南**:
```typescript
// src/automation/CronScheduler.ts
export interface CronJob {
  id: string;
  name: string;
  schedule: string;  // cron expression
  handler: () => Promise<void>;
  enabled: boolean;
}

export class CronScheduler {
  private jobs = new Map<string, CronJob>();
  
  register(job: Omit<CronJob, 'id'>): string {
    const id = generateId();
    this.jobs.set(id, { ...job, id });
    return id;
  }
  
  async execute(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || !job.enabled) return;
    
    try {
      await job.handler();
    } catch (error) {
      console.error(`Cron job ${job.name} failed:`, error);
      await this.handleFailure(job, error);
    }
  }
  
  private async handleFailure(job: CronJob, error: unknown): Promise<void> {
    // 记录失败
    // 如果连续失败超过阈值，禁用任务
    // 通知用户
  }
}
```

**验收标准**:
- [ ] Cron 任务可注册
- [ ] 失败处理正确

---

#### Task 002: 实现健康检查

**目的**: 定期检查系统状态

**操作指南**:
```typescript
// src/automation/HealthChecker.ts
export interface HealthStatus {
  healthy: boolean;
  checks: {
    plugin: boolean;
    memory: boolean;
    queue: boolean;
    agents: boolean;
  };
  issues: string[];
}

export class HealthChecker {
  async check(): Promise<HealthStatus> {
    const checks = {
      plugin: await this.checkPlugin(),
      memory: await this.checkMemory(),
      queue: await this.checkQueue(),
      agents: await this.checkAgents()
    };
    
    const issues = this.collectIssues(checks);
    
    return {
      healthy: Object.values(checks).every(v => v),
      checks,
      issues
    };
  }
  
  private async checkPlugin(): Promise<boolean> {
    // 检查 Plugin 是否加载
  }
  
  private async checkMemory(): Promise<boolean> {
    // 检查 .polymind/ 目录
  }
  
  private async checkQueue(): Promise<boolean> {
    // 检查任务队列状态
  }
  
  private async checkAgents(): Promise<boolean> {
    // 检查 Agent 可用性
  }
}
```

**验收标准**:
- [ ] 可检查所有组件
- [ ] 正确报告问题

---

#### Task 003: 实现自动恢复

**目的**: 异常情况下的自动处理

**操作指南**:
```typescript
// src/automation/AutoRecovery.ts
export class AutoRecovery {
  async attemptRecovery(error: Error): Promise<RecoveryAction> {
    switch (error.type) {
      case 'PLUGIN_CRASH':
        return this.recoverPlugin();
      case 'MEMORY_FULL':
        return this.cleanupMemory();
      case 'QUEUE_STUCK':
        return this.recoverQueue();
      default:
        return { action: 'notify', requiresApproval: true };
    }
  }
  
  private async recoverPlugin(): Promise<RecoveryAction> {
    // 尝试重新加载 Plugin
    // 如果失败，通知用户
  }
  
  private async cleanupMemory(): Promise<RecoveryAction> {
    // 清理旧的路由记录
    // 归档历史数据
  }
  
  private async recoverQueue(): Promise<RecoveryAction> {
    // 重置卡住的任务
    // 重新入队
  }
}
```

**验收标准**:
- [ ] 可处理常见错误
- [ ] 需要用户确认的操作不自动执行

---

### Batch 004 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 004 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] CronScheduler
- [ ] HealthChecker
- [ ] AutoRecovery

### 验证命令
```bash
# 检查健康状态
npm run health-check
```
```

---

## 📊 Phrase 4 总结

### 完成标准

所有 Batch 执行成功，且:
- [ ] Agent 系统完整
- [ ] 任务队列工作正常
- [ ] 编排引擎可执行计划
- [ ] 自动化功能可用

### 执行记录

| Batch | 执行日期 | 执行人 | 结果 |
|-------|---------|--------|------|
| Batch 001 | | | |
| Batch 002 | | | |
| Batch 003 | | | |
| Batch 004 | | | |

### Phrase 4 最终状态

**状态**: 📋 待开始 → 🔄 进行中 → ✅ 完成

**完成日期**: 

---

## 🎉 PolyMind 完全形态

### 完成后的 PolyMind

```
┌─────────────────────────────────────────────────────────────────┐
│                     PolyMind 完全形态                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stage 1: ✅ LLM 智能路由                                       │
│  Stage 2: ✅ SubAgent 路由分配                                  │
│  Stage 3: ✅ 记忆进化                                            │
│  Stage 4: ✅ Harness 完全形态                                    │
│                                                                  │
│  特性:                                                          │
│  ✓ 7 个 Agent 角色                                              │
│  ✓ 任务队列 + 优先级调度                                        │
│  ✓ 自动规划 + 验证                                             │
│  ✓ Cron 调度                                                    │
│  ✓ 健康检查 + 自动恢复                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*Phrase 4 - 高级编排 - TDD Plan v1.0*

*PolyMind 开发路线图完成！🎉*