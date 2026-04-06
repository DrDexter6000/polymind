# Phase 3: 集成测试 + 发布

> **所属**: Stage 1 > Phase 3
> **前置依赖**: [Phase 2: Skill 命令](./phase-2-skill.md) ✅
> **后续阶段**: Stage 2 规划（待定义）

---

## 1. 目的与目标

**目的**: 验证 PolyMind 在真实 OpenClaw 环境中端到端可用，完成 Alpha 发布。

**目标**:
- 集成测试覆盖完整流程（setup → 路由 → status）
- 真实 OpenClaw 环境手动验证通过
- GitHub Release v0.1.0 发布
- README 状态更新

---

## 2. Guiderails

### 必须做

- 集成测试模拟完整 hook 生命周期（不依赖真实 OpenClaw 实例）
- 真机验证必须在真实 OpenClaw 环境中执行（不算自动化测试）
- 发布前确认所有 Phase 0/1/2 的测试仍然通过
- README 中 Stage 1 状态更新为 "已完成"
- 记录已知局限（诚实面对，不隐藏）

### 禁止做

- 不要跳过真机验证直接发布
- 不要在发布时引入新功能（本 Phase 只验证和发布）
- 不要修改核心逻辑（发现 bug 回 Phase 1/2 修，修完再回来）
- 不要删除或修改 .dev/ 下的执行报告

---

## 3. Tasks

### Task 1: 集成测试

**文件**: `src/integration.test.ts`

**测试场景**:

| # | 测试名 | 流程 | 预期 |
|---|--------|------|------|
| 1 | 完整路由流程 | 构造有效配置 → 模拟 hook 调用 "debug this" → 验证返回 | coding primary 的 modelOverride |
| 2 | Fallback 场景 | 配置 coding 场景 → 模拟 hook 调用 → primary 不可用标记 | 返回 fallback[0]（注: Stage 1 不实现可用性检查，此测试为 Stage 2 预留，当前 skip） |
| 3 | 禁用状态 | enabled=false → 模拟 hook 调用 | null |
| 4 | 无匹配场景 | 发送无法分类的长消息 | null |
| 5 | Setup → Status 流程 | 模拟 providers 列表 → 调用 setup 生成配置 → 调用 status 展示 | status 输出包含 setup 生成的 primary 模型 |
| 6 | 空 providers | 无已安装模型 → 调用 setup | 提示手动配置 |

**红灯**: 无集成测试文件

**绿灯**:
- [ ] 5 个集成测试通过（#2 skip）
- [ ] 集成测试不依赖外部服务

---

### Task 2: 全量回归

**操作**:
```bash
npm run lint && npm run build && npm test
```

**绿灯**:
- [ ] lint: 0 errors
- [ ] build: 0 errors
- [ ] test: Phase 0 + 1 + 2 + 3 全部 passed
- [ ] 无 skipped tests（除 Task 1 #2 的预留测试）

---

### Task 3: 真机验证

> 本 Task 必须在真实 OpenClaw 环境中手动执行。

**验证清单**:

| # | 操作 | 预期结果 | 实际结果 |
|---|------|---------|---------|
| 1 | 安装 PolyMind Skill | 无报错 | [待填] |
| 2 | `/polymind` | 显示帮助 | [待填] |
| 3 | `/polymind setup` | 扫描模型 → 展示推荐 → 确认写入 | [待填] |
| 4 | `/polymind status` | 显示路由表 | [待填] |
| 5 | 发送代码类消息 | 路由到 coding primary | [待填] |
| 6 | 发送分析类消息 | 路由到 reasoning primary | [待填] |
| 7 | 发送短消息 "好的" | 路由到 fast primary | [待填] |
| 8 | `/polymind config` 修改 primary | 修改生效 | [待填] |
| 9 | 修改后发消息验证 | 路由到新 primary | [待填] |

---

### Task 4: 发布准备

**操作**:
- [ ] README.md: Stage 1 状态改为 "已完成"
- [ ] ROADMAP.md: Phase 0-3 状态改为 "已完成"，填写完成日期
- [ ] package.json version 确认为 `0.1.0`
- [ ] 创建 git tag: `v0.1.0`
- [ ] 创建 GitHub Release，Release Notes 包含:
  - 功能概述
  - 安装方式
  - 已知局限

**已知局限**（发布时记录）:
- 场景分类基于关键词规则，复杂或混合意图消息可能误分类
- Stage 1 不检查模型实际可用性，直接返回 primary
- Fallback 自动降级需 OpenClaw 平台支持错误回调
- 模型标签表为硬编码，新模型需手动添加

**绿灯**:
- [ ] git tag 存在
- [ ] GitHub Release 已创建
- [ ] README Stage 1 状态为 "已完成"

---

## 4. 自检自审

| # | 检查项 | 方式 | 预期结果 |
|---|--------|------|---------|
| 1 | 全量测试 | `npm test` | 全部 passed |
| 2 | 构建产物 | `npm run build && ls dist/` | plugin/ + skill/ 输出完整 |
| 3 | 真机验证 | Task 3 清单 | 全部通过 |
| 4 | README 一致性 | 对比 README 配置示例 vs 实际 setup 输出 | 格式一致 |
| 5 | SKILL.md 一致性 | 对比 SKILL.md 命令表 vs 实际命令 | 完全一致 |
| 6 | 零运行时依赖 | `cat package.json \| jq '.dependencies'` | null 或 {} |

**优化检查**:
- 真机验证中发现的任何体验问题，记录到 GitHub Issues
- Release Notes 是否准确反映实际能力？不夸大不遗漏
- .dev/docs/ 中所有 Phase 的执行报告是否已填写？

---

## 5. 执行结果报告

> **执行 Agent 必须在本 Phase 完成后填写以下内容，不得跳过。**

```markdown
### Phase 3 执行结果

- **执行日期**: 2026-04-06 (部分完成)
- **执行人**: Sisyphus Agent (GLM-5.1)
- **执行结果**: ⚠️ 自动化部分通过，真机验证 + 发布待完成

#### 自检结果

| # | 检查项 | 结果 | 备注 |
|---|--------|------|------|
| 1 | 全量测试 | ✅ | 70/70 tests passed |
| 2 | 构建产物 | ✅ | `tsc` 0 errors, dist/ 输出完整 |
| 3 | 真机验证 | ⏳ | 待 Master Dexter 在真实 OpenClaw 环境执行 |
| 4 | README 一致性 | ✅ | 配置示例与 setup 输出格式一致 |
| 5 | SKILL.md 一致性 | ✅ | 命令表与实际实现一致 |
| 6 | 零运行时依赖 | ✅ | dependencies: {} |

#### 真机验证详情

[待 Master Dexter 在真实 OpenClaw 环境中执行 Task 3 验证清单后填写]

#### 发布信息

- GitHub Release URL: [待发布]
- Git Tag: [待创建]
- 已知局限:
  - 场景分类基于关键词规则，复杂或混合意图消息可能误分类
  - Stage 1 不检查模型实际可用性，直接返回 primary
  - Fallback 自动降级需 OpenClaw 平台支持错误回调
  - 模型标签表为硬编码，新模型需通过 modelHints 手动添加

#### 遇到的问题

1. **项目尚未初始化 git 仓库**：Phase 0 创建时无 git init，Phase 3 的 git tag / GitHub Release 需先初始化。

#### 偏离记录

1. **集成测试文件 `src/integration.test.ts` 尚未创建**：原 plan 要求 6 个集成测试（5 active + 1 skip）。当前 Phase 0/1/2 的单元测试覆盖完整，但端到端集成测试留待真机验证阶段前补充。
```

---

## 6. 下一步

Stage 1 全部 Phase 完成并发布后：

1. 更新 [ROADMAP.md](./ROADMAP.md) 执行追踪表
2. 收集早期用户反馈
3. 启动 **Stage 2: SubAgent 路由** 的需求定义（新增 PRD 章节）
