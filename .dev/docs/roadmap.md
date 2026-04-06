# PolyMind 开发路线总览

> **版本**: v1.0  
> **更新日期**: 2026-04-06  
> **状态**: 规划完成，待执行

---

## 📋 文档体系

```
.dev/
├── roadmap.md                    # 本文档 - 总览
├── phrase-0-foundation.md        # 基础奠基
├── phrase-1-plugin-core.md      # Plugin 核心
├── phrase-2-skill-interface.md  # Skill 接口
├── phrase-3-memory-system.md    # 记忆系统
└── phrase-4-advanced.md         # 高级编排

.dev/batches/                     # 执行结果记录
├── phrase-0-batch-001-xxx.md
├── phrase-0-batch-002-xxx.md
├── phrase-1-batch-001-xxx.md
└── ...
```

---

## 🎯 开发阶段总览

| Phase | 名称 | 核心交付 | 预计周期 | 依赖 |
|-------|------|---------|---------|------|
| **Phrase 0** | 基础奠基 | 项目脚手架、目录结构、CI/CD | 1周 | 无 |
| **Phrase 1** | Plugin核心 | `before_model_resolve` hook、路由决策 | 2周 | Phrase 0 |
| **Phrase 2** | Skill接口 | 命令系统、Onboarding | 2周 | Phrase 1 |
| **Phrase 3** | 记忆系统 | `.polymind/` 私有存储、进化机制 | 2周 | Phrase 2 |
| **Phrase 4** | 高级编排 | Harness Framework、自动化 | 3周 | Phrase 3 |

---

## 🔄 阶段依赖关系

```
Phrase 0 (基础)
    │
    ▼
Phrase 1 (Plugin核心)
    │
    ▼
Phrase 2 (Skill接口)
    │
    ▼
Phrase 3 (记忆系统)
    │
    ▼
Phrase 4 (高级编排)
```

---

## 📦 Phrase 0: 基础奠基

**目标**: 建立开发基础设施，确保后续高效开发

| Batch | 内容 | 交付物 |
|-------|------|--------|
| Batch 001 | 项目初始化 | TypeScript配置、目录结构 |
| Batch 002 | 代码规范 | ESLint规则、命名规范 |
| Batch 003 | CI/CD | GitHub Actions构建 |

**详细文档**: [phrase-0-foundation.md](./phrase-0-foundation.md)

---

## 🔌 Phrase 1: Plugin 核心

**目标**: 实现 `before_model_resolve` hook，建立路由决策引擎

| Batch | 内容 | 交付物 |
|-------|------|--------|
| Batch 001 | Plugin骨架 | plugin/index.ts、manifest |
| Batch 002 | Hook注册 | before_model_resolve handler |
| Batch 003 | 场景识别 | SceneClassifier |
| Batch 004 | 模型选择 | ModelSelector |

**详细文档**: [phrase-1-plugin-core.md](./phrase-1-plugin-core.md)

---

## 🛠️ Phrase 2: Skill 接口

**目标**: 实现用户交互命令系统，包括 Onboarding

| Batch | 内容 | 交付物 |
|-------|------|--------|
| Batch 001 | 命令框架 | /polymind 命令体系 |
| Batch 002 | Onboarding | 5步引导流程 |
| Batch 003 | 配置管理 | /polymind config |

**详细文档**: [phrase-2-skill-interface.md](./phrase-2-skill-interface.md)

---

## 🧠 Phrase 3: 记忆系统

**目标**: 实现 `.polymind/` 私有存储，建立进化机制

| Batch | 内容 | 交付物 |
|-------|------|--------|
| Batch 001 | 存储层 | JSON存储引擎 |
| Batch 002 | 路由记录 | decisions.json |
| Batch 003 | 用户偏好 | preferences/ |
| Batch 004 | 进化引擎 | evolution.log |

**详细文档**: [phrase-3-memory-system.md](./phrase-3-memory-system.md)

---

## 🚀 Phrase 4: 高级编排

**目标**: 实现 Harness Framework，达到完全形态

| Batch | 内容 | 交付物 |
|-------|------|--------|
| Batch 001 | Agent注册 | 6大Agent角色 |
| Batch 002 | 任务队列 | 优先级调度 |
| Batch 003 | 编排引擎 | Maestro/Oracle |
| Batch 004 | 自动化 | Cron调度 |

**详细文档**: [phrase-4-advanced.md](./phrase-4-advanced.md)

---

## ✅ 执行追踪

| Phrase | 状态 | 开始日期 | 完成日期 | 执行批次 |
|--------|------|---------|---------|---------|
| Phrase 0 | 📋 待开始 | - | - | - |
| Phrase 1 | 📋 待开始 | - | - | - |
| Phrase 2 | 📋 待开始 | - | - | - |
| Phrase 3 | 📋 待开始 | - | - | - |
| Phrase 4 | 📋 待开始 | - | - | - |

---

## 📝 执行日志

每次执行 Batch 后，必须在 `.dev/batches/` 下创建执行结果文档：

```
.dev/batches/
├── phrase-0-batch-001-{yyyy-mm-dd}-{执行人}.md
├── phrase-0-batch-002-{yyyy-mm-dd}-{执行人}.md
└── ...
```

**模板**:
```markdown
# Batch 执行结果

- **Phrase**: X
- **Batch**: 00X
- **执行日期**: YYYY-MM-DD
- **执行人**: Agent/Master
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

## 执行概要
[简述执行了什么]

## 输出物
[列举生成的文件]

## 问题记录
[遇到的问题及解决方案]

## 下一步
[下一个要执行的batch]
```

---

## 🔗 关联文档

- [README.md](../../README.md) - 项目介绍
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - 架构设计
- [LLM_RANKING.md](../../LLM_RANKING.md) - 模型排名
- [onboarding.md](../../onboarding.md) - Onboarding流程

---

*PolyMind Roadmap - 规划完成时间: 2026-04-06*