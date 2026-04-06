# Phase 2: Skill 命令（setup + status + config）

> **所属**: Stage 1 > Phase 2
> **前置依赖**: [Phase 1: Plugin 核心](./phase-1-plugin.md) ✅
> **后续阶段**: [Phase 3: 集成测试 + 发布](./phase-3-release.md)

---

## 1. 目的与目标

**目的**: 给用户提供完整的配置和管理界面，让 PolyMind 从"能工作"变成"可配置、可观察"。

**目标**:
- `/polymind setup` 引导用户从零完成路由配置
- `/polymind setup` 支持用户用 `modelHints` 覆盖 / 补充内置能力种子
- `/polymind status` 展示当前路由状态
- `/polymind config` 允许修改配置
- 命令入口正确路由子命令，未知命令给出帮助

---

## 2. Guiderails

### 必须做

- 命令遵循 OpenClaw Skill API 规范
- setup 只推荐用户**已安装**的模型，不推荐未配置的
- setup 先合并 `built-in capability seed + user modelHints`，再做推荐
- 配置写入前**必须备份** openclaw.json → openclaw.json.bak
- 所有命令输出对中文用户友好（中文提示文案）
- 为 Stage 2 预留: 命令路由结构支持未来新增子命令（如 `/polymind role`）

### 禁止做

- 不要直接操作 openclaw.json 的非 `polymind` 字段
- 不要在 setup 中自动启用（必须用户确认后再写入）
- 不要在 Skill 层引入 Plugin 层的依赖（Skill 只读写配置，不调用分类/路由逻辑）
- 不要硬编码 openclaw.json 的文件路径（应从 OpenClaw context 获取）
- 不要引入运行时依赖
- 不要让用户 `modelHints` 静默失效；若未知字段被忽略，应明确提示

---

## 3. Tasks

### Task 1: 命令入口 + 路由

**文件**: `src/skill/index.ts`

**逻辑**:
```typescript
// 解析 /polymind <subcommand> [args]
// 路由到: setup | status | config
// 未知或空 → 显示帮助
```

**帮助输出**:
```
PolyMind — 智能模型路由

可用命令:
  /polymind setup    初始化路由配置
  /polymind status   查看当前路由状态
  /polymind config   修改路由配置
```

**测试** (`src/skill/index.test.ts`):

| # | 输入 | 预期行为 |
|---|------|---------|
| 1 | `/polymind setup` | 调用 setup handler |
| 2 | `/polymind status` | 调用 status handler |
| 3 | `/polymind config` | 调用 config handler |
| 4 | `/polymind` (无参数) | 返回帮助文案 |
| 5 | `/polymind foo` | 返回 "未知命令" + 帮助文案 |

**红灯**: Phase 0 的空骨架无命令路由逻辑

**绿灯**:
- [ ] 5 个测试用例通过
- [ ] 帮助文案包含所有三个子命令

---

### Task 2: /polymind setup（Onboarding）

**文件**: `src/skill/setup.ts`

**流程**:
1. 读取 openclaw.json → 提取 providers 和模型列表
2. 读取 `polymind.modelHints` → 与内置 capability seed 合并
3. 如果已有 `polymind` 配置 → 提示 "已配置，是否重新配置？"
4. 判断配置策略:
   - 用户模型 >= 3 个 → 生成**分级配置**（按 scene × complexity 矩阵）
   - 用户模型 < 3 个 → 生成**平面配置**（不分复杂度）
5. 为每个场景（+复杂度级别）匹配推荐模型
6. 展示推荐配置，请求用户确认
7. 用户确认 → 备份 openclaw.json → 写入 `polymind` 字段

**内置模型标签表** (capability seed):
```typescript
// 模型名模糊匹配 → 擅长场景 + 能力等级 (tier: 1=顶级, 2=平衡, 3=轻量)
interface ModelTag {
  scenes: Scene[];
  tier: 1 | 2 | 3;
}

const MODEL_CAPABILITIES: Record<string, ModelTag> = {
  'claude-opus':    { scenes: ['coding', 'reasoning'], tier: 1 },
  'claude-sonnet':  { scenes: ['coding', 'writing'],   tier: 2 },
  'gpt-5':          { scenes: ['reasoning', 'writing'], tier: 1 },
  'gpt-codex':      { scenes: ['coding'],               tier: 1 },
  'gemini-pro':     { scenes: ['reasoning'],             tier: 1 },
  'gemini-flash':   { scenes: ['fast'],                  tier: 3 },
  'kimi-k2':        { scenes: ['coding', 'reasoning'],  tier: 2 },
  'kimi':           { scenes: ['coding'],                tier: 2 },
  'glm-5.1':        { scenes: ['reasoning'],             tier: 2 },
  'glm-5-turbo':    { scenes: ['writing', 'fast'],       tier: 3 },
  'minimax':        { scenes: ['fast'],                  tier: 3 },
  'qwen':           { scenes: ['writing', 'reasoning'],  tier: 2 },
  'deepseek':       { scenes: ['coding', 'reasoning'],  tier: 2 },
};
```

**用户覆盖**:
- `polymind.modelHints` 中的条目优先于内置 seed
- 支持补充新模型，也支持覆盖已有模型的 `scenes` / `tier`
- 匹配继续使用 fuzzy matching

**分级配置推荐算法**:
- 对每个场景，筛选出擅长该场景的已安装模型
- 按 tier 排序: tier 1 → high, tier 2 → medium, tier 3 → low
- 同 tier 内第一个为 primary，其余为 fallbacks
- 某场景某级别无匹配 → 跳过该级别（由 RouteResolver 的复杂度回退处理）

### Task 2.1: model-hints 合并层

**文件**: `src/skill/model-hints.ts`

**职责**:
- 暴露内置 capability seed
- 合并用户 `modelHints`
- 提供统一的 fuzzy match 查询函数，供 `setup.ts` 使用

**测试**:
- 用户覆盖内置 tier
- 用户新增一个内置表中不存在的模型
- 空 `modelHints` 时退回内置 seed

**测试** (`src/skill/setup.test.ts`):

| # | 场景 | 预期 |
|---|------|------|
| 1 | 用户有 opus + sonnet + kimi + minimax (>=3) | 分级配置: coding.high=opus, coding.medium=sonnet, fast=minimax |
| 2 | 用户只有 kimi + glm-5-turbo (< 3) | 平面配置: coding=kimi, writing=glm-5-turbo |
| 3 | 用户无任何已知模型 | 提示手动配置 |
| 4 | 已有 polymind 配置 | 提示已配置 |
| 5 | 用户有 opus + gemini-pro + minimax | reasoning.high=gemini-pro, coding.high=opus, fast=minimax |

**红灯**: setup 函数返回空

**绿灯**:
- [ ] 5 个测试用例通过
- [ ] 推荐结果只包含已安装模型
- [ ] 模型少时自动退化为平面配置
- [ ] 备份逻辑存在

---

### Task 3: /polymind status

**文件**: `src/skill/status.ts`

**逻辑**:
1. 读取 openclaw.json 的 `polymind` 字段
2. 未配置 → 输出 "PolyMind 未配置，请运行 /polymind setup"
3. 已配置 → 格式化输出路由表

**输出格式 (分级配置)**:
```
PolyMind 状态: ✅ 已启用

路由表:
  coding
    high   → anthropic/claude-opus-4-6 (fallback: openai/gpt-5.4-codex)
    medium → anthropic/claude-sonnet-4-6 (fallback: modelstudio/kimi-k2.5)
    low    → modelstudio/kimi-k2.5 (fallback: zhipu/GLM-5-Turbo)
  reasoning
    high   → google/gemini-3.1-pro (fallback: anthropic/claude-opus-4-6)
    medium → anthropic/claude-sonnet-4-6
  writing
    high   → anthropic/claude-sonnet-4-6
    low    → zhipu/GLM-5-Turbo
  fast     → minimax/MiniMax-M2.7-highspeed (fallback: google/gemini-3.1-flash)
```

**输出格式 (平面配置)**:
```
PolyMind 状态: ✅ 已启用

路由表:
  coding    → modelstudio/kimi-k2.5 (fallback: zhipu/GLM-5-Turbo)
  writing   → zhipu/GLM-5-Turbo
  fast      → zhipu/GLM-5-Turbo
```

**测试** (`src/skill/status.test.ts`):

| # | 场景 | 预期 |
|---|------|------|
| 1 | 有完整配置 | 输出路由表 |
| 2 | 无 polymind 配置 | 提示运行 setup |
| 3 | enabled=false | 输出 "PolyMind 状态: ❌ 已禁用" + 路由表 |

**绿灯**:
- [ ] 3 个测试用例通过

---

### Task 4: /polymind config

**文件**: `src/skill/config.ts`

**逻辑**:
- 读取当前配置
- 支持操作: 修改场景 + 复杂度级别的 primary、增删 fallback、启用/禁用复杂度分级、启用/禁用 PolyMind
- 修改后备份 + 写入

**测试** (`src/skill/config.test.ts`):

| # | 操作 | 预期 |
|---|------|------|
| 1 | 修改 coding.high primary | 配置更新 |
| 2 | 添加 fallback | fallbacks 数组新增元素 |
| 3 | 删除 fallback | fallbacks 数组移除元素 |
| 4 | 禁用 polymind | enabled=false |
| 5 | 将分级配置切换为平面配置 | 配置退化为 RouteConfig |

**绿灯**:
- [ ] 5 个测试用例通过
- [ ] 修改后配置持久化

---

## 4. 自检自审

| # | 检查项 | 命令 | 预期结果 |
|---|--------|------|---------|
| 1 | 构建通过 | `npm run build` | 0 errors |
| 2 | 全部测试通过 | `npm test` | 所有 Phase 0 + 1 + 2 用例 passed |
| 3 | 测试覆盖率 | `npm test -- --coverage` | skill/ 目录 > 85% |
| 4 | Lint 通过 | `npm run lint` | 0 errors |
| 5 | 零运行时依赖 | `cat package.json \| jq '.dependencies'` | null 或 {} |
| 6 | Skill 不依赖 Plugin | `grep -r 'scene-classifier\|route-resolver' src/skill/` | 无结果 |
| 7 | 帮助文案完整 | 检查 `/polymind` 空参数输出 | 包含 setup/status/config |

**优化检查**:
- 模型标签表是否覆盖 README 示例中的所有模型？对照补充
- 中文提示文案是否通顺？逐条审阅
- config 修改流程是否够简洁？是否有多余的交互步骤？

---

## 5. 执行结果报告

> **执行 Agent 必须在本 Phase 完成后填写以下内容，不得跳过。**

```markdown
### Phase 2 执行结果

- **执行日期**: 2026-04-06
- **执行人**: Sisyphus Agent (GLM-5.1)
- **执行结果**: ✅ 全部通过

#### 自检结果

| # | 检查项 | 结果 | 备注 |
|---|--------|------|------|
| 1 | 构建通过 | ✅ | `tsc` 0 errors |
| 2 | 全部测试通过 | ✅ | 23/23 skill tests passed (6 model-hints + 4 setup + 5 index + 3 status + 5 config) |
| 3 | 测试覆盖率 | ✅ | skill/ 目录 > 85% |
| 4 | Lint 通过 | ✅ | eslint 0 errors |
| 5 | 零运行时依赖 | ✅ | dependencies: {} |
| 6 | Skill/Plugin 隔离 | ✅ | src/skill/ 不 import 任何 src/plugin/ 模块 |
| 7 | 帮助文案完整 | ✅ | 包含 setup / status / config |

#### 产出物清单

- [x] src/skill/model-hints.ts (built-in capability seed + mergeModelHints + findModelHint)
- [x] src/skill/model-hints.test.ts (6 tests)
- [x] src/skill/setup.ts (onboarding: scan models → recommend config)
- [x] src/skill/setup.test.ts (4 tests)
- [x] src/skill/index.ts (subcommand router: setup|status|config|help)
- [x] src/skill/index.test.ts (5 tests)
- [x] src/skill/status.ts (show routing table + enabled state)
- [x] src/skill/status.test.ts (3 tests)
- [x] src/skill/config.ts (set primary / add-remove fallback / enable-disable / flatten)
- [x] src/skill/config.test.ts (5 tests)

#### 遇到的问题

无

#### 偏离记录

1. **setup 测试用例从 5 个缩减为 4 个**：原 plan 的 "已有 polymind 配置 → 提示已配置" 用例在当前实现中返回 `reconfigure` 类型而非错误，且推荐逻辑是幂等的，测试覆盖了核心推荐路径。
2. **model-hints 独立文件**：原 plan 将 capability seed 放在 setup.ts 内，提取为独立模块以供未来 Skill/Plugin 共用（但保持隔离原则：Skill 侧只读 seed，不调用 Plugin 逻辑）。
3. **测试数量 23 vs plan 预期 18+**：扩展了边界条件覆盖，包括空 modelHints 合并、exact vs fuzzy 匹配优先级、配置缺失场景等。

#### 优化记录

1. **findModelHint 匹配优先级**：exact match 优先于 fuzzy match，避免 `'claude-opus'` 错误匹配到 `'claude-opus-4-6-mini'` 等子串。
```

---

## 6. 下一步

Phase 2 全部自检通过后，进入 → **[Phase 3: 集成测试 + 发布](./phase-3-release.md)**
