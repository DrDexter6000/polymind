# Phrase 2: Skill 接口 - TDD Plan

> **Phrase**: 2  
> **名称**: Skill 接口  
> **目标**: 实现用户交互命令系统，包括 Onboarding  
> **预计周期**: 2周  
> **前置依赖**: Phrase 1 (Plugin核心)

---

## 📋 Phrase 2 总览

| Batch | 名称 | Tasks | 预计工时 |
|-------|------|-------|----------|
| **Batch 001** | 命令框架 | 3 | 8h |
| **Batch 002** | Onboarding | 4 | 10h |
| **Batch 003** | 配置管理 | 3 | 6h |
| **Batch 004** | 状态查询 | 2 | 4h |

---

## Batch 001: 命令框架

### Batch 目的

建立 PolyMind Skill 命令体系。

### Batch 目标

- [ ] 创建 `/polymind` 命令入口
- [ ] 创建 `/omo` 命令入口
- [ ] 建立命令路由

### Batch Guiderails

**必须做**:
- 命令遵循 OpenClaw Skill 规范
- 使用 SKILL.md 中定义的命令格式
- 命令参数解析规范化

**不应该做**:
- ❌ 不要混用命令风格
- ❌ 不要在命令中执行长时间阻塞操作
- ❌ 不要直接修改 OpenClaw 配置

### Tasks

#### Task 001: 创建命令入口

**目的**: 建立 `/polymind` 命令处理

**操作指南**:
```typescript
// src/skill/commands/polymind.ts
import type { SkillCommand } from 'openclaw';

export const polymindCommand: SkillCommand = {
  name: 'polymind',
  description: 'PolyMind LLM router control center',
  
  async handle(context: CommandContext): Promise<string> {
    const subcommand = context.args[0];
    
    switch (subcommand) {
      case 'setup':
        return handleSetup(context);
      case 'status':
        return handleStatus(context);
      case 'config':
        return handleConfig(context);
      case 'help':
      default:
        return showHelp();
    }
  }
};

function showHelp(): string {
  return `
🤖 PolyMind 命令帮助

/polymind setup    - 启动 Onboarding
/polymind status   - 查看当前状态
/polymind config   - 配置管理
/polymind help     - 显示帮助
  `.trim();
}
```

**验收标准**:
- [ ] 命令可执行
- [ ] 显示帮助信息

---

#### Task 002: 创建 /omo 命令

**目的**: 建立 `/omo` Agent 调度命令

**操作指南**:
```typescript
// src/skill/commands/omo.ts
export const omoCommand: SkillCommand = {
  name: 'omo',
  description: 'PolyMind agent dispatcher',
  
  async handle(context: CommandContext): Promise<string> {
    const subcommand = context.args[0];
    
    switch (subcommand) {
      case 'plan':
        return handlePlan(context);
      case 'work':
        return handleWork(context);
      case 'status':
        return handleStatus(context);
      case 'agent':
        return handleAgent(context);
      case 'pause':
        return handlePause(context);
      case 'resume':
        return handleResume(context);
      default:
        return showOmoHelp();
    }
  }
};

function showOmoHelp(): string {
  return `
🤖 PolyMind Agent Dispatcher

/omo plan <goal>   - 战略规划模式
/omo work          - 执行当前计划
/omo status        - 查看 Agent 状态
/omo agent <type>  - 切换到指定 Agent
/omo pause         - 暂停所有任务
/omo resume        - 恢复任务
  `.trim();
}
```

**验收标准**:
- [ ] `/omo plan` 命令可执行
- [ ] `/omo status` 命令可执行

---

#### Task 003: 建立命令路由

**目的**: 统一管理所有命令

**操作指南**:
```typescript
// src/skill/commands/index.ts
import { polymindCommand } from './polymind';
import { omoCommand } from './omo';

export const commands = [polymindCommand, omoCommand];

export function registerCommands(): void {
  commands.forEach(cmd => {
    // 注册到 OpenClaw 命令系统
  });
}
```

**验收标准**:
- [ ] 所有命令可访问
- [ ] 命令路由正确

---

### Batch 001 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 001 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] src/skill/commands/polymind.ts
- [ ] src/skill/commands/omo.ts
- [ ] 命令路由

### 验证命令
```bash
# 测试命令
/polymind help
/omo status
```
```

---

## Batch 002: Onboarding

### Batch 目的

实现完整的 Onboarding 流程，包括模型扫描、排名整合、配置写入。

### Batch 目标

- [ ] 实现模型扫描 (scanner)
- [ ] 实现排名整合 (ranker)
- [ ] 实现配置生成
- [ ] 实现配置写入

### Batch Guiderails

**必须做**:
- 遵循 onboarding.md 流程
- 读取 OpenClaw 配置获取可用模型
- 用户确认后再写入配置
- 记录到 .polymind/ 目录

**不应该做**:
- ❌ 不要自动修改 openclaw.json
- ❌ 不要跳过用户确认
- ❌ 不要强制用户接受推荐

### Tasks

#### Task 001: 实现模型扫描

**目的**: 扫描用户已安装的模型

**操作指南**:
```typescript
// src/onboard/scanner.ts
import fs from 'fs/promises';
import path from 'path';

export interface ScannedModel {
  id: string;
  provider: string;
  contextWindow: number;
  capabilities: string[];
}

export async function scanModels(): Promise<ScannedModel[]> {
  // 1. 读取 openclaw.json
  const configPath = path.join(process.env.HOME!, '.openclaw/openclaw.json');
  const configRaw = await fs.readFile(configPath, 'utf-8');
  const config = JSON.parse(configRaw);
  
  // 2. 提取 providers
  const providers = config.models?.providers || {};
  const models: ScannedModel[] = [];
  
  for (const [provider, providerConfig] of Object.entries(providers)) {
    // 提取模型列表
    // ...
  }
  
  return models;
}
```

**验收标准**:
- [ ] 可列出所有已配置模型
- [ ] 可识别模型能力

---

#### Task 002: 实现排名整合

**目的**: 结合官方排名和用户偏好生成推荐

**操作指南**:
```typescript
// src/onboard/ranker.ts
import { LLM_RANKING } from '../llm-ranking';
import type { ScannedModel } from './scanner';

export interface RankingResult {
  agent: string;
  primary: string;
  fallbacks: string[];
  reason: string;
}

export function generateRanking(
  models: ScannedModel[],
  userCostRanking?: string[],
  userSpeedRanking?: string[]
): RankingResult[] {
  // 1. 加载 LLM_RANKING.md (或 JSON)
  // 2. 按 Agent 角色匹配可用模型
  // 3. 计算综合得分: 0.6×官方 + 0.4×用户
  // 4. 生成推荐
}
```

**验收标准**:
- [ ] 生成每 Agent 的推荐
- [ ] 考虑用户排名

---

#### Task 003: 实现配置生成

**目的**: 生成可写入的配置

**操作指南**:
```typescript
// src/onboard/configurator.ts
export interface PolyMindConfig {
  polymind: {
    enabled: boolean;
    version: string;
    setupDate: string;
    agentModels: Record<string, {
      primary: string;
      fallbacks: string[];
    }>;
    userPreferences: {
      costRanking: string[];
      speedRanking: string[];
    };
  };
}

export function generateConfig(
  rankings: RankingResult[],
  userPreferences: UserPreferences
): PolyMindConfig {
  return {
    polymind: {
      enabled: true,
      version: '0.1.0',
      setupDate: new Date().toISOString(),
      agentModels: Object.fromEntries(
        rankings.map(r => [r.agent, {
          primary: r.primary,
          fallbacks: r.fallbacks
        }])
      ),
      userPreferences: {
        costRanking: userPreferences.costRanking,
        speedRanking: userPreferences.speedRanking
      }
    }
  };
}
```

**验收标准**:
- [ ] 生成符合 schema 的配置
- [ ] 可序列化

---

#### Task 004: 实现 Onboarding 命令

**目的**: 完整的 Onboarding 流程

**操作指南**:
```typescript
// src/skill/commands/onboarding.ts
export async function runOnboarding(context: CommandContext): Promise<string> {
  const lines: string[] = [];
  
  // Step 1: 扫描
  lines.push('📋 Step 1: 扫描模型配置...');
  const models = await scanModels();
  lines.push(`发现 ${models.length} 个已安装模型`);
  
  // Step 2: 生成推荐
  lines.push('🎯 Step 2: 基于官方排名生成推荐...');
  const rankings = generateRanking(models);
  
  // Step 3: 用户采访
  lines.push('💰 Step 3: 请回答性价比排名...');
  const preferences = await collectPreferences(context);
  
  // Step 4: 综合推荐
  lines.push('🎉 Step 4: 生成最终配置...');
  const config = generateConfig(rankings, preferences);
  
  // Step 5: 用户确认
  lines.push('✅ Step 5: 请确认配置...');
  const confirmed = await askConfirmation(context);
  
  if (confirmed) {
    await writeConfig(config);
    lines.push('✅ 配置已写入！');
  } else {
    lines.push('❌ 已取消');
  }
  
  return lines.join('\n');
}
```

**验收标准**:
- [ ] 完整 5 步流程
- [ ] 用户可交互

---

### Batch 002 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 002 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] src/onboard/scanner.ts
- [ ] src/onboard/ranker.ts
- [ ] src/onboard/configurator.ts
- [ ] Onboarding 流程

### 验证命令
```bash
/polymind setup
```
```

---

## Batch 003: 配置管理

### Batch 目的

实现配置查看、编辑、重置等管理功能。

### Batch 目标

- [ ] `/polymind config view`
- [ ] `/polymind config edit`
- [ ] `/polymind config reset`

### Batch Guiderails

**必须做**:
- 配置修改需要用户确认
- 保留配置备份
- 支持部分更新

**不应该做**:
- ❌ 不要自动重启 Gateway
- ❌ 不要修改 OpenClaw 核心配置
- ❌ 不要泄露敏感信息

### Tasks

#### Task 001: 配置查看

**目的**: 显示当前配置

**操作指南**:
```typescript
export async function handleConfigView(context: CommandContext): Promise<string> {
  const config = await readPolyMindConfig();
  return formatAsTable(config);
}
```

**验收标准**:
- [ ] 显示所有配置项
- [ ] 格式化友好

---

#### Task 002: 配置编辑

**目的**: 交互式编辑配置

**操作指南**:
```typescript
export async function handleConfigEdit(context: CommandContext): Promise<string> {
  // 1. 读取当前配置
  // 2. 显示编辑界面
  // 3. 用户修改
  // 4. 验证
  // 5. 写入
}
```

**验收标准**:
- [ ] 可修改单个配置项
- [ ] 验证输入

---

#### Task 003: 配置重置

**目的**: 恢复到默认配置

**操作指南**:
```typescript
export async function handleConfigReset(context: CommandContext): Promise<string> {
  // 1. 确认操作
  // 2. 备份当前
  // 3. 写入默认
}
```

**验收标准**:
- [ ] 有确认提示
- [ ] 有备份

---

### Batch 003 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 003 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] config view
- [ ] config edit
- [ ] config reset

### 验证命令
```bash
/polymind config view
/polymind config reset
```
```

---

## Batch 004: 状态查询

### Batch 目的

实现状态查看功能。

### Batch 目标

- [ ] `/polymind status`
- [ ] `/omo status`

### Batch Guiderails

**必须做**:
- 显示简洁的状态概览
- 区分启用/禁用状态
- 显示活跃任务数

**不应该做**:
- ❌ 不要显示敏感信息
- ❌ 不要在状态中暴露完整配置

### Tasks

#### Task 001: 状态查看

**目的**: 显示 PolyMind 状态

**操作指南**:
```typescript
export async function handleStatus(context: CommandContext): Promise<string> {
  const config = await readPolyMindConfig();
  const memory = await readPolyMindMemory();
  
  return `
🤖 PolyMind 状态

状态: ${config.enabled ? '✅ 启用' : '❌ 禁用'}
版本: ${config.version}
配置时间: ${config.setupDate}

📊 活跃 Agent: ${memory.activeAgents}
📋 任务队列: ${memory.taskQueueSize}
🧠 路由决策: ${memory.totalDecisions} 次

🔥 最近活动:
${memory.recentActivity.slice(0, 3).map(a => `- ${a}`).join('\n')}
  `.trim();
}
```

**验收标准**:
- [ ] 状态显示完整
- [ ] 格式友好

---

#### Task 002: /omo status

**目的**: 显示 Agent 调度状态

**操作指南**:
```typescript
export async function handleOmoStatus(context: CommandContext): Promise<string> {
  // 显示当前 Agent 状态、任务进度等
}
```

**验收标准**:
- [ ] 显示活跃任务
- [ ] 显示 Agent 分配

---

### Batch 004 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 004 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] /polymind status
- [ ] /omo status

### 验证命令
```bash
/polymind status
/omo status
```
```

---

## 📊 Phrase 2 总结

### 完成标准

所有 Batch 执行成功，且:
- [ ] 命令可执行
- [ ] Onboarding 可完成
- [ ] 配置可管理
- [ ] 状态可查看

### 执行记录

| Batch | 执行日期 | 执行人 | 结果 |
|-------|---------|--------|------|
| Batch 001 | | | |
| Batch 002 | | | |
| Batch 003 | | | |
| Batch 004 | | | |

### Phrase 2 最终状态

**状态**: 📋 待开始 → 🔄 进行中 → ✅ 完成

**完成日期**: 

---

*Phrase 2 - Skill 接口 - TDD Plan v1.0*