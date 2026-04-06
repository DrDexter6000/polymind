# PolyMind 官方 LLM 排名

> **版本**: v1.0 (2026-04)  
> **用途**: PolyMind 路由决策参考，非商业排名  
> **更新**: 建议每季度重新评估

---

## 📊 概览

本文档为 PolyMind 提供「官方排名参考」，用于推荐最佳模型配置。

**注意**: 本排名基于公开基准测试 + 社区反馈综合评估，实际表现因场景而异。

---

## 🏔️ 一、推理能力天梯

*评估标准: 数学、逻辑、复杂问题分解、多步推理*

| 等级 | 模型 | 评分 | 备注 |
|------|------|------|------|
| **T0** | `o1/o3/o4` (OpenAI) | ⭐⭐⭐⭐⭐ | 顶级推理，思考链强 |
| **T0** | `Claude 4.5 Opus Thinking` | ⭐⭐⭐⭐⭐ | 顶级推理，200K context |
| **T1** | `GPT-5.2` | ⭐⭐⭐⭐ | SOTA 推理能力 |
| **T1** | `DeepSeek R1` | ⭐⭐⭐⭐ | 开源推理王者 |
| **T1** | `Qwen3.5 Thinking` | ⭐⭐⭐⭐ | 开源新星 |
| **T2** | `Gemini 2.5 Pro` | ⭐⭐⭐ | 长上下文推理 |
| **T2** | `GLM-5.1` (智谱) | ⭐⭐⭐ | 国产推理候选 |
| **T2** | `Kimi-K2.5` (月之暗面) | ⭐⭐⭐ | 长上下文支持 |
| **T3** | `Claude Sonnet 4.6` | ⭐⭐ | 平衡型推理 |
| **T3** | `Qwen3.6-plus` (通义) | ⭐⭐ | 实用推理 |

---

## 💻 二、代码能力天梯

*评估标准: HumanEval, SWE-bench, 代码生成、调试、重构*

| 等级 | 模型 | 评分 | 备注 |
|------|------|------|------|
| **T0** | `Claude Sonnet 4.6` | ⭐⭐⭐⭐⭐ | 80%+ SWE-bench，代码质量最佳 |
| **T0** | `GPT-5.1/5.3 Codex` | ⭐⭐⭐⭐⭐ | 专用代码模型 |
| **T1** | `Claude 4.5 Opus` | ⭐⭐⭐⭐ | 代码质量顶级 |
| **T1** | `Kimi-K2.5` | ⭐⭐⭐⭐ | 国产代码首选 |
| **T1** | `MiniMax-M2.5` | ⭐⭐⭐⭐ | 性价比代码 |
| **T2** | `Gemini 2.5 Pro` | ⭐⭐⭐ | 1000K context 优势 |
| **T2** | `DeepSeek V3` | ⭐⭐⭐ | 成本效益高 |
| **T2** | `GLM-5-Turbo` (智谱) | ⭐⭐⭐ | 国产代码候选 |
| **T3** | `Qwen3.6-plus` | ⭐⭐ | 基础代码能力 |
| **T3** | `GPT-4o` | ⭐⭐ | 多模态代码 |

---

## 🖼️ 三、多模态能力天梯

*评估标准: 图像理解、文档解析、图表解读、视觉推理*

| 等级 | 模型 | 评分 | 备注 |
|------|------|------|------|
| **T0** | `GPT-4o` (OpenAI) | ⭐⭐⭐⭐⭐ | 多模态事实标准 |
| **T0** | `Claude 4 (Sonnet/Opus)` | ⭐⭐⭐⭐⭐ | 文档理解强 |
| **T1** | `Gemini 2.0 Flash/Pro` | ⭐⭐⭐⭐ | 原生多模态 |
| **T1** | `Llama 4 Scout/Maverick` | ⭐⭐⭐⭐ | 开源多模态 |
| **T1** | `Qwen3.5 VL` | ⭐⭐⭐⭐ | 开源多模态新星 |
| **T2** | `Kimi-K2.5` | ⭐⭐⭐ | 视觉+长文本 |
| **T2** | `GLM-5.1` (智谱) | ⭐⭐⭐ | 国产多模态 |
| **T3** | `MiniMax-M2.7` | ⭐⭐ | 基础多模态 |

---

## ✍️ 四、创意写作能力天梯

*评估标准: EQ-Bench, 创意表达、风格多样性、叙事连贯性*

| 等级 | 模型 | 评分 | 备注 |
|------|------|------|------|
| **T0** | `GPT-4o` / `GPT-5` | ⭐⭐⭐⭐⭐ | 顶级创意写作 |
| **T0** | `Claude 4 Sonnet/Opus` | ⭐⭐⭐⭐⭐ | 细腻表达 |
| **T1** | `DeepSeek V3` | ⭐⭐⭐⭐ | 成本效益写作 |
| **T1** | `Qwen3.5` | ⭐⭐⭐⭐ | 中文创意 |
| **T2** | `GLM-5.1` (智谱) | ⭐⭐⭐ | 国产写作候选 |
| **T2** | `Gemini 2.0` | ⭐⭐⭐ | 快速生成 |
| **T3** | `Kimi-K2.5` | ⭐⭐ | 对话式写作 |
| **T3** | `MiniMax-M2.7` | ⭐⭐ | 快速内容 |

---

## 🎭 五、6 大 Agent 角色推荐模型

基于上述排名，为 PolyMind 的 6 个 Agent 角色推荐模型：

### 5.1 Maestro (战略规划)

**需求**: 顶级推理 + 长程规划 + 复杂分析

| 推荐 | 模型 | 理由 |
|------|------|------|
| 🥇 首选 | `zhipu/GLM-5.1` | 顶级推理，200K context |
| 🥈 备选 1 | `modelstudio/kimi-k2.5` | 长上下文，规划优势 |
| 🥉 备选 2 | `bailian/qwen3.6-plus` | 开源推理，稳健 |

### 5.2 Oracle (计划审查)

**需求**: 保守推理 + 风险识别 + 验证能力

| 推荐 | 模型 | 理由 |
|------|------|------|
| 🥇 首选 | `modelstudio/kimi-k2.5` | 风险识别强 |
| 🥈 备选 1 | `zhipu/GLM-5.1` | 推理验证 |
| 🥉 备选 2 | `minimax/MiniMax-M2.7-highspeed` | 快速验证 |

### 5.3 Artisan (代码专家)

**需求**: 顶级代码能力 + 调试 + 重构

| 推荐 | 模型 | 理由 |
|------|------|------|
| 🥇 首选 | `modelstudio/kimi-k2.5` | 国产代码首选 |
| 🥈 备选 1 | `zhipu/GLM-5-Turbo` | 智谱代码 |
| 🥉 备选 2 | `bailian/qwen3.6-plus` | 通义代码 |

### 5.4 Scholar (研究分析)

**需求**: 推理 + 搜索 + 综合分析

| 推荐 | 模型 | 理由 |
|------|------|------|
| 🥇 首选 | `zhipu/GLM-5.1` | 推理+分析 |
| 🥈 备选 1 | `modelstudio/kimi-k2.5` | 长文本研究 |
| 🥉 备选 2 | `minimax/MiniMax-M2.7-highspeed` | 快速研究 |

### 5.5 Scribe (内容写作)

**需求**: 创意写作 + 多风格 + 表达流畅

| 推荐 | 模型 | 理由 |
|------|------|------|
| 🥇 首选 | `zhipu/GLM-5-Turbo` | 平衡写作 |
| 🥈 备选 1 | `bailian/qwen3.6-plus` | 中文写作 |
| 🥉 备选 2 | `modelstudio/kimi-k2.5` | 对话式写作 |

### 5.6 Envoy (通信联络)

**需求**: 快速响应 + 多频道 + TTS 友好

| 推荐 | 模型 | 理由 |
|------|------|------|
| 🥇 首选 | `minimax/MiniMax-M2.7-highspeed` | 最快速度 |
| 🥈 备选 1 | `zhipu/GLM-5-Turbo` | 平衡速度 |
| 🥉 备选 2 | `bailian/qwen3.6-plus` | 稳健通信 |

### 5.7 Warden (安全监控)

**需求**: 保守推理 + 安全检查 + 审计

| 推荐 | 模型 | 理由 |
|------|------|------|
| 🥇 首选 | `modelstudio/kimi-k2.5` | 风险识别 |
| 🥈 备选 1 | `zhipu/GLM-5.1` | 深度检查 |
| 🥉 备选 2 | `bailian/qwen3.6-plus` | 稳健保守 |

---

## 📋 六、推荐配置模板

基于用户已安装模型，PolyMind 生成以下默认配置：

```json
{
  "polymind": {
    "agentModels": {
      "maestro": {
        "primary": "zhipu/GLM-5.1",
        "fallbacks": ["modelstudio/kimi-k2.5", "bailian/qwen3.6-plus"]
      },
      "oracle": {
        "primary": "modelstudio/kimi-k2.5",
        "fallbacks": ["zhipu/GLM-5.1", "minimax/MiniMax-M2.7-highspeed"]
      },
      "artisan": {
        "primary": "modelstudio/kimi-k2.5",
        "fallbacks": ["zhipu/GLM-5-Turbo", "bailian/qwen3.6-plus"]
      },
      "scholar": {
        "primary": "zhipu/GLM-5.1",
        "fallbacks": ["modelstudio/kimi-k2.5", "minimax/MiniMax-M2.7-highspeed"]
      },
      "scribe": {
        "primary": "zhipu/GLM-5-Turbo",
        "fallbacks": ["bailian/qwen3.6-plus", "modelstudio/kimi-k2.5"]
      },
      "envoy": {
        "primary": "minimax/MiniMax-M2.7-highspeed",
        "fallbacks": ["zhipu/GLM-5-Turbo", "bailian/qwen3.6-plus"]
      },
      "warden": {
        "primary": "modelstudio/kimi-k2.5",
        "fallbacks": ["zhipu/GLM-5.1", "bailian/qwen3.6-plus"]
      }
    }
  }
}
```

---

## 🔄 七、用户排名整合

PolyMind 会在 onboarding 时收集用户实测排名，用于调整推荐：

| 用户排名维度 | 用途 |
|-------------|------|
| **性价比排名** | 优先推荐高性价比模型 |
| **速度排名** | 优先推荐快速模型 |

**整合公式**:
```
最终推荐 = 0.6 × 官方排名 + 0.4 × 用户排名
```

---

## 📚 参考来源

- [Vellum AI LLM Leaderboard](https://vellum.ai/llm-leaderboard)
- [SWE-bench Leaderboard](https://www.swebench.com)
- [LiveBench](https://livebench.ai)
- [EQ-Bench](https://eqbench.com)
- [LLM Stats](https://llm-stats.com)
- [Codingscape Best LLMs for Coding](https://codingscape.com/blog/best-llms-for-coding-developer-favorites)
- [Digital Applied LLM Comparison](https://www.digitalapplied.com/blog/llm-comparison-guide-december-2025)

---

*本文档为 PolyMind 内部参考，持续更新中*