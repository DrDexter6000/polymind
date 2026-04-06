# PolyMind Architecture

> **版本**: v2.0 (2026-04)  
> **状态**: 设计完成，待开发  
> **类型**: OpenClaw Plugin + Skill 混合架构

---

## 🎯 核心定位

**PolyMind = 智能 LLM 路由器 + 可进化 SubAgent 分配器**

```
PolyMind 不是另一个「oh-my-openagent 的复制品」，
而是一个专注于「模型路由 + 任务分配 + 记忆进化」的基础设施。
```

---

## 📈 四阶段演进路线

### Stage 1: LLM 智能路由 (基础)

**目标**: 免费提供类似 ClawRouter 的路由能力

```
用户输入 → before_model_resolve Hook → 路由决策 → 最优模型
```

**核心功能**:
- 场景识别 (coding / reasoning / writing / fast)
- 模型路由到最优候选
- Fallback 链保证可用性

**技术实现**:
- OpenClaw Plugin 注册 `before_model_resolve` hook
- 返回 `{ modelOverride, providerOverride }`

### Stage 2: SubAgent 路由分配 (进阶)

**目标**: 为不同子任务分配不同模型

```
/omo artisan   → artisan 模型池 → kimi-k2.5
/omo scholar   → scholar 模型池 → GLM-5.1
/omo plan      → Maestro 规划 → 多模型协作
```

**核心功能**:
- Agent 类型到模型的映射
- `sessions_spawn` 带 `modelOverride`
- 手动指定 + 自动路由双模式

### Stage 3: 记忆进化 (高级)

**目标**: 从交互中学习，持续优化路由

```
交互数据 → .polymind/ 私有记忆 → 路由优化 → 性能提升
```

**核心功能**:
- 记录路由决策效果
- 用户纠正反馈
- 自动调整推荐

**数据隔离**:
```
.polymind/ (PolyMind 私有)
├── routing/     # 路由决策记录
├── preferences/ # 用户偏好
├── performance/ # 模型表现
└── evolution.log # 进化历史

memory/ (ClawMemory 全局)
└── 绝对不碰
```

### Stage 4: Harness 完全形态 (终极)

**目标**: 全自动多智能体编排

```
目标设定 → 自动规划 → 智能路由 → 执行 → 学习 → 进化
```

---

## 🏗️ 系统架构

### 插件 + Skill 混合架构

```
┌────────────────────────────────────────────────────────────────┐
│                       PolyMind                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────────────┐    ┌──────────────────────────┐   │
│   │   Plugin Layer        │    │   Skill Layer             │   │
│   │  (before_model_      │    │                          │   │
│   │   resolve hook)       │    │  /polymind setup         │   │
│   │                       │    │  /polymind status        │   │
│   │  - 拦截模型解析        │    │  /polymind config        │   │
│   │  - 注入 modelOverride  │    │  /omo plan/work/status   │   │
│   │                       │    │                          │   │
│   │  ⚠️ 必须 Plugin       │    │  ✓ 可以是 Skill          │   │
│   └──────────────────────┘    └──────────────────────────┘   │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                    数据层 (隔离)                          │  │
│   │                                                          │  │
│   │   .polymind/                    memory/                 │  │
│   │   ├── routing/                  (ClawMemory)           │  │
│   │   ├── preferences/               ❌ 不接触               │  │
│   │   ├── performance/               ❌ 不接触               │  │
│   │   └── evolution.log                                     │  │
│   │                                                          │  │
│   │   ✓ PolyMind 私有空间            ✓ 用户全局记忆           │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Hook 执行流程

```
1. 用户发送消息
        ↓
2. OpenClaw 预处理消息
        ↓
3. 触发 before_model_resolve hook
        ↓
4. PolyMind Plugin 分析:
   - 读取 .polymind/preferences/ (私有记忆)
   - 识别场景类型 (coding/reasoning/writing/fast)
   - 查询 LLM_RANKING.md 排名
   - 生成路由决策
        ↓
5. 返回 { modelOverride?, providerOverride? }
        ↓
6. OpenClaw 使用指定模型处理
        ↓
7. 结果返回 + 记录到 .polymind/
```

---

## 📁 目录结构

```
~/.openclaw/workspace/skills/polymind/
├── SKILL.md              # Skill 清单 (用户触发)
├── README.md             # 项目首页
├── ARCHITECTURE.md       # 本文档
├── LLM_RANKING.md        # 官方 LLM 排名
├── onboarding.md         # Onboarding 流程
│
├── src/
│   ├── plugin/
│   │   ├── index.ts      # Plugin 入口
│   │   ├── hooks/
│   │   │   └── beforeModelResolve.ts
│   │   └── router/
│   │       ├── SceneClassifier.ts
│   │       └── ModelSelector.ts
│   │
│   ├── skill/
│   │   ├── commands/
│   │   │   ├── setup.ts
│   │   │   ├── status.ts
│   │   │   ├── config.ts
│   │   │   └── onboarding.ts
│   │   └── handlers/
│   │       └── omoCommands.ts
│   │
│   └── onboard/
│       ├── scanner.ts       # 扫描用户配置
│       ├── ranker.ts        # 排名整合
│       └── configurator.ts   # 配置写入
│
├── .polymind/            # PolyMind 私有数据 (隔离!)
│   ├── config.json        # 用户最终配置
│   ├── routing/
│   │   └── decisions.json  # 路由决策记录
│   ├── preferences/
│   │   ├── cost-ranking.json
│   │   └── speed-ranking.json
│   ├── performance/
│   │   └── model-scores.json
│   └── evolution.log      # 进化日志
│
└── docs/
    ├── PLUGIN_DEV.md     # 插件开发指南
    └── COMMAND_REF.md     # 命令参考
```

---

## 🔌 Plugin 规范

### 必须实现的功能

| 功能 | 说明 | 必须 |
|------|------|------|
| `before_model_resolve` | 拦截模型解析，注入路由决策 | ✅ |
| `modelOverride` | 返回最优模型 | ✅ |
| `providerOverride` | 返回最优供应商 | ⚠️ 可选 |

### Plugin Manifest

```json
{
  "id": "polymind",
  "name": "PolyMind",
  "version": "0.1.0",
  "description": "Intelligent LLM router and subagent dispatcher",
  "hooks": {
    "before_model_resolve": "src/plugin/hooks/beforeModelResolve"
  },
  "permissions": []
}
```

---

## 🧠 记忆系统设计

### 隔离原则

```
┌─────────────────────────────────────────────────────────────┐
│                     Master Dexter 的记忆系统                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   memory/ (ClawMemory 全局)                                  │
│   ├── L0: index.md                                         │
│   ├── L1: topics/                                          │
│   ├── L2: daily/                                           │
│   └── users/ou_35a.../                                     │
│           ├── profile.md                                    │
│           └── .learnings/                                   │
│                                                              │
│   ❌ PolyMind 绝对不写入这个目录                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     PolyMind 私有记忆                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   .polymind/                                               │
│   ├── config.json           # 路由配置                       │
│   ├── routing/decisions.json # 每次路由记录                   │
│   ├── preferences/          # 用户偏好                       │
│   └── performance/          # 模型表现评分                   │
│                                                              │
│   ✓ PolyMind 完全自主，隔离存储                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 数据内容

| 文件 | 内容 | 生命周期 |
|------|------|---------|
| `config.json` | 用户最终配置 | 永久 |
| `routing/decisions.json` | 每次路由决策 | 滚动30天 |
| `preferences/cost-ranking.json` | 用户性价比排名 | 永久 |
| `preferences/speed-ranking.json` | 用户速度排名 | 永久 |
| `performance/model-scores.json` | 模型综合评分 | 滚动更新 |
| `evolution.log` | 进化历史 | 永久 |

---

## 📋 Onboarding 流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      Onboarding 流程                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [1] 扫描                                                      │
│      └─> 读取 openclaw.json providers                           │
│      └─> 提取已安装模型列表                                      │
│                                                                  │
│  [2] 官方匹配                                                   │
│      └─> 查询 LLM_RANKING.md                                    │
│      └─> 按 Agent 角色推荐模型                                   │
│                                                                  │
│  [3] 用户采访                                                   │
│      ├─> 性价比排名 (用户体验)                                    │
│      ├─> 响应速度排名 (用户体验)                                  │
│      └─> 特殊偏好收集                                            │
│                                                                  │
│  [4] 综合推荐                                                   │
│      └─> 公式: 最终 = 0.6×官方 + 0.4×用户                        │
│                                                                  │
│  [5] 写入配置                                                   │
│      ├─> config.patch 到 openclaw.json                          │
│      └─> .polymind/ 私有记忆初始化                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 竞品对比

| 特性 | ClawRouter | LLMRouter | PolyMind |
|------|-----------|-----------|----------|
| **费用** | 收费 | 免费 | 免费 |
| **License** | proprietary | MIT | MIT |
| **路由方式** | 插件 hook | 独立服务器 | Plugin hook |
| **SubAgent 路由** | ❌ | ❌ | ✅ |
| **记忆进化** | ❌ | ❌ | ✅ |
| **Harness** | ❌ | ❌ | ✅ (Stage 4) |
| **Onboarding** | ❌ | ❌ | ✅ |
| **隔离记忆** | N/A | N/A | ✅ |

---

## 📚 参考文档

- [LLM_RANKING.md](./LLM_RANKING.md) - 官方模型排名
- [onboarding.md](./onboarding.md) - Onboarding 流程
- [SKILL.md](./SKILL.md) - Skill 规范

---

*Architecture v2.0 - PolyMind*