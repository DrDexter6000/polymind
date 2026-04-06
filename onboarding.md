# PolyMind Onboarding Guide

> **目的**: 引导 PolyMind 完成初始化配置  
> **执行者**: OpenClaw Agent (使用 PolyMind Skill)  
> **时机**: 用户首次安装 / 执行 `/polymind setup` 时

---

## 🎯 Onboarding 流程概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    PolyMind Onboarding                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Step 1: 扫描模型配置                                            │
│   Step 2: 生成官方排名匹配                                         │
│   Step 3: 用户采访（体验排名）                                     │
│   Step 4: 综合推荐配置方案                                         │
│   Step 5: 写入配置 & 启用                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: 扫描用户模型配置

### 1.1 读取 OpenClaw 配置

**执行命令**:
```bash
# 读取当前 providers 配置
cat ~/.openclaw/openclaw.json | jq '.models.providers'
```

### 1.2 提取可用模型列表

**目标**: 获取用户已配置的模型清单

**输出格式**:
```
📋 您已安装的模型:

| # | 模型标识 | 供应商 | 上下文 | 备注 |
|---|---------|-------|--------|------|
| 1 | qwen3.6-plus | bailian | 200K | ✅ 推理 |
| 2 | kimi-k2.5 | modelstudio | 262K | ✅ 代码+推理 |
| 3 | GLM-5.1 | zhipu | 200K | ✅ 推理 |
| 4 | GLM-5-Turbo | zhipu | 200K | ✅ 平衡 |
| 5 | MiniMax-M2.7-highspeed | minimax | 100K | ✅ 快速 |
```

### 1.3 检测模型能力

**根据模型名称匹配能力** (参考 LLM_RANKING.md):

| 模型名 | 推理 | 代码 | 多模态 | 写作 |
|--------|------|------|--------|------|
| qwen3.6-plus | ⭐⭐⭐ | ⭐⭐ | ❌ | ⭐⭐⭐ |
| kimi-k2.5 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| GLM-5.1 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| GLM-5-Turbo | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| MiniMax-M2.7-highspeed | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |

---

## Step 2: 生成官方排名匹配

### 2.1 基于官方排名推荐

**PolyMind 参考 `LLM_RANKING.md`**，为用户的每个 Agent 角色推荐最优模型。

**推荐算法**:
1. 列出用户所有可用模型
2. 按角色需求筛选可用模型
3. 按官方排名排序
4. 输出: 1个首选 + 2个 fallback

### 2.2 推荐输出示例

```
🎯 基于官方排名，为您推荐:

【Artisan (代码专家)】
  首选: modelstudio/kimi-k2.5 (代码 T1)
  Fallback 1: zhipu/GLM-5-Turbo (代码 T2)
  Fallback 2: bailian/qwen3.6-plus (代码 T3)

【Maestro (战略规划)】
  首选: zhipu/GLM-5.1 (推理 T2)
  Fallback 1: modelstudio/kimi-k2.5 (推理 T2)
  Fallback 2: bailian/qwen3.6-plus (推理 T3)

【Envoy (通信)】
  首选: minimax/MiniMax-M2.7-highspeed (速度 T0)
  Fallback 1: zhipu/GLM-5-Turbo (速度 T1)
  Fallback 2: bailian/qwen3.6-plus (速度 T2)
```

---

## Step 3: 用户采访（体验排名）

### 3.1 介绍

```
🤖 PolyMind 还需要了解您的个人体验，这将用于优化推荐。

请基于您的实际使用感受，对已安装的模型进行排名。
```

### 3.2 性价比排名采访

```
💰 【性价比排名】

请按「性价比从高到低」排列您使用过的模型:
(性价比 = 输出质量 / 花费成本)

例如: kimi-k2.5 > GLM-5.1 > qwen3.6-plus

请输入您的排名: _______________
```

**追问 (如果用户没有全部使用过)**:
```
您没有使用过全部模型，没关系！
请只排列您实际体验过的，并告诉我未体验的标记为 [未体验]。

已体验模型: _______________
未体验模型: _______________
```

### 3.3 响应速度排名采访

```
⚡ 【响应速度排名】

请按「响应速度从快到慢」排列您使用过的模型:
(速度 = 首次 token 出现的时间)

例如: MiniMax-M2.7 > GLM-5-Turbo > kimi-k2.5

请输入您的排名: _______________
```

### 3.4 特殊偏好收集

```
🎭 【特殊偏好】

您是否有以下偏好? (可多选)
- [ ] 更注重代码质量，哪怕慢一点
- [ ] 更注重响应速度，可以牺牲一点质量
- [ ] 需要支持多模态 (图片理解)
- [ ] 主要使用中文
- [ ] 主要使用英文
- [ ] 其他: _______________
```

---

## Step 4: 综合推荐配置方案

### 4.1 整合排名计算

**公式**:
```
最终得分 = 0.6 × 官方排名得分 + 0.4 × 用户体验得分
```

**官方排名权重** (基于 LLM_RANKING.md):
- T0 = 100分
- T1 = 80分
- T2 = 60分
- T3 = 40分

**用户体验权重**:
- 性价比排名第1 = 100分，第2 = 80分，...
- 速度排名第1 = 100分，第2 = 80分，...

### 4.2 生成最终配置

```
🎉 【PolyMind 推荐配置】

基于「官方排名」+「您的体验」，为您生成配置:

┌─────────────────────────────────────────────────────────────┐
│ Agent         │  Primary           │ Fallback 1        │ Fallback 2        │
├───────────────┼───────────────────┼───────────────────┼───────────────────┤
│ Maestro       │ zhipu/GLM-5.1     │ kimi-k2.5         │ qwen3.6-plus      │
│ Oracle        │ kimi-k2.5         │ GLM-5.1           │ MiniMax-M2.7      │
│ Artisan       │ kimi-k2.5         │ GLM-5-Turbo       │ qwen3.6-plus      │
│ Scholar       │ GLM-5.1           │ kimi-k2.5         │ qwen3.6-plus      │
│ Scribe        │ GLM-5-Turbo       │ qwen3.6-plus      │ kimi-k2.5         │
│ Envoy         │ MiniMax-M2.7      │ GLM-5-Turbo       │ qwen3.6-plus      │
│ Warden        │ kimi-k2.5         │ GLM-5.1           │ qwen3.6-plus      │
└─────────────────────────────────────────────────────────────┘

💡 备注: 
- 性价比优先: kimi-k2.5, GLM-5-Turbo
- 速度优先: MiniMax-M2.7-highspeed
- 质量优先: GLM-5.1, kimi-k2.5
```

---

## Step 5: 写入配置 & 启用

### 5.1 确认配置

```
✅ 【最后确认】

请确认是否应用以上配置?

- [Y] 是，应用配置
- [N] 否，稍后手动调整
- [E] 编辑特定角色配置
```

### 5.2 执行写入

**用户确认后，PolyMind 执行**:

```bash
# 1. 备份当前配置
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak.$(date +%Y%m%d)

# 2. 写入 polymind 配置到 openclaw.json
# (通过 gateway config.patch)

# 3. 写入 polymind 私有记忆
mkdir -p ~/.openclaw/workspace/.polymind/
```

### 5.3 配置写入内容

**openclaw.json (通过 config.patch)**:
```json
{
  "polymind": {
    "enabled": true,
    "version": "0.1.0",
    "setupDate": "2026-04-06",
    "agentModels": {
      "maestro": {
        "primary": "zhipu/GLM-5.1",
        "fallbacks": ["modelstudio/kimi-k2.5", "bailian/qwen3.6-plus"]
      },
      "artisan": {
        "primary": "modelstudio/kimi-k2.5",
        "fallbacks": ["zhipu/GLM-5-Turbo", "bailian/qwen3.6-plus"]
      },
      "envoy": {
        "primary": "minimax/MiniMax-M2.7-highspeed",
        "fallbacks": ["zhipu/GLM-5-Turbo", "bailian/qwen3.6-plus"]
      }
    },
    "userPreferences": {
      "costRanking": ["kimi-k2.5", "GLM-5.1", "qwen3.6-plus"],
      "speedRanking": ["MiniMax-M2.7", "GLM-5-Turbo", "kimi-k2.5"]
    }
  }
}
```

**私有记忆 (`~/.openclaw/workspace/.polymind/`)**:
```
.polymind/
├── config.json          # 用户最终配置
├── user-rankings.json   # 用户体验排名
├── official-match.json   # 官方排名匹配记录
└── evolution.log        # 进化日志
```

### 5.4 启用确认

```
🎊 PolyMind 配置完成！

已为您配置:
✓ 6 个 Agent 角色
✓ 18 个模型路由规则 (每角色 1主+2备)
✓ 用户偏好记忆 (位于 .polymind/ 目录)

下一步:
- 重启 Gateway 生效: /gateway restart
- 查看状态: /polymind status
- 手动调整: /polymind config

感谢使用 PolyMind! 🧠
```

---

## 📋 Onboarding 脚本 (自动化)

```bash
#!/bin/bash
# polymind-onboarding.sh

echo "🤖 PolyMind Onboarding 启动..."
echo "================================"

# Step 1: 扫描
echo "📋 Step 1: 扫描模型配置..."
PROVIDERS=$(cat ~/.openclaw/openclaw.json | jq '.models.providers')

# Step 2: 生成推荐 (调用 agent 分析)
echo "🎯 Step 2: 基于官方排名生成推荐..."

# Step 3: 用户采访
echo "💰 Step 3: 请回答性价比排名..."
read -p "您的性价比排名: " COST_RANK
read -p "您的速度排名: " SPEED_RANK

# Step 4: 综合推荐
echo "🎉 Step 4: 生成最终配置..."

# Step 5: 写入
echo "✅ Step 5: 写入配置..."

echo "================================"
echo "🎊 PolyMind Onboarding 完成!"
```

---

## ❓ 常见问题

| 问题 | 答案 |
|------|------|
| **我不满意推荐结果** | 运行 `/polymind config` 手动调整 |
| **我想重新排名** | 运行 `/polymind re-rank` 重新采访 |
| **如何查看当前配置** | 运行 `/polymind status` |
| **如何禁用 PolyMind** | 设置 `polymind.enabled: false` 并重启 |

---

*Onboarding Guide v1.0 - PolyMind*