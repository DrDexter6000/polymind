# Phase 0: 项目脚手架

> **所属**: Stage 1 > Phase 0
> **前置依赖**: 无
> **后续阶段**: [Phase 1: Plugin 核心](./phase-1-plugin.md)

---

## 1. 目的与目标

**目的**: 建立标准化的 TypeScript 项目骨架，确保后续所有 Phase 在统一的构建、测试、规范基础上开发。

**目标**:
- 项目可构建 (`npm run build` 通过)
- 项目可测试 (`npm test` 通过)
- 项目可检查 (`npm run lint` 通过)
- 目录结构符合 [ARCHITECTURE.md](./ARCHITECTURE.md) 定义
- 建立本地 OpenClaw contract 层，避免后续实现依赖未发布类型

---

## 2. Guiderails

### 必须做

- 使用 `tsconfig.json` 严格模式 (`strict: true`)
- 目录结构严格遵循 `src/plugin/` + `src/skill/` 分离
- `.gitignore` 排除 `node_modules/`, `dist/`, `.polymind/`
- 所有源文件创建空导出骨架，确保编译通过
- 创建 `src/contract/openclaw.ts`，为 Plugin / Skill 提供最小宿主接口类型
- 测试框架使用 vitest（轻量、零配置、原生 TS 支持）

### 禁止做

- 不要安装任何运行时依赖（Stage 1 目标零运行时依赖）
- 不要硬编码任何 API key 或环境变量
- 不要在源代码中使用 `any` 类型
- 不要创建 `.polymind/` 目录（Stage 1 无持久化）
- 不要写任何业务逻辑（本 Phase 只建骨架）

---

## 3. Tasks

### Task 1: 初始化 package.json

**操作**:
```bash
cd ~/.openclaw/workspace/skills/polymind
npm init -y
```

编辑 package.json:
- `name`: "polymind"
- `version`: "0.1.0"
- `type`: "module"
- `scripts.build`: `tsc`
- `scripts.test`: `vitest run`
- `scripts.lint`: `eslint src/`
- `engines.node`: `>=18`

**红灯 (操作前应失败)**:
- `npm run build` → 失败（无 tsconfig）

**绿灯 (操作后应通过)**:
- [ ] package.json 存在
- [ ] `npm install` 成功

---

### Task 2: TypeScript 配置

**操作**:
```bash
npm install typescript --save-dev
```

创建 `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**红灯**: `npm run build` → 失败（src/ 不存在或无 .ts 文件）

**绿灯**:
- [ ] tsconfig.json 存在
- [ ] `strict: true` 已启用

---

### Task 3: 目录结构 + 空骨架

**操作**:
```
src/
├── contract/
│   └── openclaw.ts            # OpenClaw host contract (local mock/interfaces)
├── plugin/
│   ├── index.ts                # export function register() {}
│   ├── continuation-detector.ts # export function detectContinuation() { return { hit: false }; }
│   ├── types.ts                # export type Scene, Complexity, RouteConfig, etc.
│   ├── scene-classifier.ts     # export function classify(message: string): Scene | null { return null; }
│   ├── complexity-estimator.ts # export function estimate(message: string, scene: Scene): Complexity { return 'medium'; }
│   └── route-resolver.ts       # export function resolve(): null { return null; }
└── skill/
    ├── index.ts              # export function handleCommand() {}
    ├── setup.ts              # export function setup() {}
    ├── status.ts             # export function status() {}
    └── config.ts             # export function config() {}
```

**红灯**: 目录不存在，`npm run build` 无文件可编译

**绿灯**:
- [ ] 所有文件存在
- [ ] `npm run build` 编译通过，dist/ 下生成 .js + .d.ts
- [ ] 目录结构与 ARCHITECTURE.md 一致（含 complexity-estimator.ts）
- [ ] `src/contract/openclaw.ts` 提供最小宿主接口，不出现 `any`

---

### Task 4: 测试框架

**操作**:
```bash
npm install vitest --save-dev
```

创建 `src/plugin/scene-classifier.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { classify } from './scene-classifier';

describe('SceneClassifier', () => {
  it('should exist', () => {
    expect(classify).toBeDefined();
  });
});
```

**红灯**: `npm test` → 命令不存在或失败

**绿灯**:
- [ ] `npm test` 执行成功
- [ ] 1 test passed

---

### Task 5: ESLint 配置

**操作**:
```bash
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev
```

创建 `eslint.config.js` (flat config):
- 启用 `@typescript-eslint/recommended`
- 规则: `@typescript-eslint/no-explicit-any: error`

**红灯**: `npm run lint` → 命令不存在

**绿灯**:
- [ ] `npm run lint` 通过
- [ ] 在任意文件加 `const x: any = 1;` → lint 报错

---

### Task 6: .gitignore

**操作**:
```gitignore
node_modules/
dist/
.polymind/
```

**绿灯**:
- [ ] `git status` 不跟踪 node_modules/, dist/

---

## 4. 自检自审

Phase 完成后，执行以下检查清单：

| # | 检查项 | 命令 | 预期结果 |
|---|--------|------|---------|
| 1 | 构建通过 | `npm run build` | 编译成功，dist/ 下有输出 |
| 2 | 测试通过 | `npm test` | 至少 1 test passed |
| 3 | Lint 通过 | `npm run lint` | 0 errors |
| 4 | 类型安全 | 在源文件加 `any` → `npm run lint` | 报错 |
| 5 | 目录结构 | `find src -name '*.ts' \| sort` | 与 Task 3 定义一致 |
| 6 | 零运行时依赖 | `cat package.json \| jq '.dependencies'` | null 或 {} |

**优化检查**: 如果发现任何 Task 的实现不够干净（多余文件、不必要的配置），立即修正后再进入下一 Phase。

---

## 5. 执行结果报告

> **执行 Agent 必须在本 Phase 完成后填写以下内容，不得跳过。**

```markdown
### Phase 0 执行结果

- **执行日期**: 2026-04-06
- **执行人**: Sisyphus Agent (GLM-5.1)
- **执行结果**: ✅ 全部通过

#### 自检结果

| # | 检查项 | 结果 | 备注 |
|---|--------|------|------|
| 1 | 构建通过 | ✅ | `tsc` 0 errors |
| 2 | 测试通过 | ✅ | 合同层 4 tests passed |
| 3 | Lint 通过 | ✅ | eslint 0 errors |
| 4 | 类型安全 | ✅ | `@typescript-eslint/no-explicit-any: error` 规则生效 |
| 5 | 目录结构 | ✅ | 与 ARCHITECTURE.md 一致 |
| 6 | 零运行时依赖 | ✅ | dependencies: {} |

#### 产出物清单

- [x] package.json (name: polymind, version: 0.1.0, type: module)
- [x] tsconfig.json (strict: true, target: ES2022, module: NodeNext)
- [x] eslint.config.js (flat config, @typescript-eslint/recommended)
- [x] vitest.config.ts
- [x] src/contract/openclaw.ts (OpenClaw host contract 本地类型层)
- [x] src/contract/openclaw.test.ts (4 tests)
- [x] src/plugin/types.ts (Scene, Complexity, RouteConfig, PolyMindConfig)
- [x] src/plugin/continuation-detector.ts (骨架 → 后续 Phase 1 完整实现)
- [x] src/plugin/scene-classifier.ts (骨架)
- [x] src/plugin/complexity-estimator.ts (骨架)
- [x] src/plugin/route-resolver.ts (骨架)
- [x] src/plugin/index.ts (骨架)
- [x] src/skill/index.ts (骨架)
- [x] src/skill/setup.ts (骨架)
- [x] src/skill/status.ts (骨架)
- [x] src/skill/config.ts (骨架)
- [x] src/skill/model-hints.ts (骨架)

#### 遇到的问题

1. **npm init -y 将含 token 的 GitHub URL 写入 package.json.repository**：立即 scrub 为安全 URL。
2. **UNC 路径 + Windows shell 导致 npm/tsc/vitest 找不到**：通过 `wsl -e bash -lc "..."` 在 WSL 内执行所有 Node.js 命令解决。
3. **ESLint flat config 初始配置不匹配已安装的 parser/plugin 版本**：调整为正确的 `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` 组合。

#### 偏离记录

1. **额外创建 `vitest.config.ts`**：原始 plan 未提及，但 vitest 在 NodeNext 模块解析下需要显式配置 TypeScript path。
2. **骨架阶段即实现了 contract 层完整类型**：原 plan 建议空骨架，但因 `before_model_resolve` / `before_prompt_build` 的 hook 签名直接影响后续所有实现，提前完成类型定义以确保后续 Phase 不需要回头修改。
3. **未创建 `.gitignore`**：项目尚未初始化 git 仓库，将在 Phase 3 发布前创建。
```

---

## 6. 下一步

Phase 0 全部自检通过后，进入 → **[Phase 1: Plugin 核心](./phase-1-plugin.md)**
