# Phrase 0: 基础奠基 - TDD Plan

> **Phrase**: 0  
> **名称**: 基础奠基  
> **目标**: 建立开发基础设施，确保后续高效开发  
> **预计周期**: 1周  
> **前置依赖**: 无

---

## 📋 Phrase 0 总览

| Batch | 名称 | Tasks | 预计工时 |
|-------|------|-------|----------|
| **Batch 001** | 项目初始化 | 3 | 4h |
| **Batch 002** | 代码规范 | 3 | 3h |
| **Batch 003** | CI/CD | 2 | 3h |

---

## Batch 001: 项目初始化

### Batch 目的

建立标准化 TypeScript 项目结构，确保团队协作一致性。

### Batch 目标

- [ ] 完成 `package.json` 配置
- [ ] 建立 TypeScript 配置
- [ ] 建立目录结构

### Batch Guiderails

**必须做**:
- 使用 `tsconfig.json` 严格模式
- 目录结构符合 `src/plugin`、`src/skill` 分离
- `.gitignore` 排除 `.polymind/`、`node_modules/`
- 保留 `.dev/` 在 git 中（它是开发规范文档）

**不应该做**:
- ❌ 不要硬编码任何 API keys
- ❌ 不要在源代码目录放文档
- ❌ 不要使用 `any` 类型

### Tasks

#### Task 001: 初始化 package.json

**目的**: 定义项目依赖和脚本

**操作指南**:
```bash
cd /home/dexter/.openclaw/workspace/skills/polymind
npm init -y
npm install typescript @types/node --save-dev
npm install zod --save  # 用于配置验证
```

**验收标准**:
- [ ] `package.json` 存在
- [ ] `scripts` 包含 `build`、`test`、`lint`
- [ ] `engines` 声明 Node >= 18

---

#### Task 002: 配置 TypeScript

**目的**: 统一代码规范

**操作指南**:
```bash
npx tsc --init
```

编辑 `tsconfig.json`:
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
  "exclude": ["node_modules", "dist", ".dev", ".polymind"]
}
```

**验收标准**:
- [ ] `tsconfig.json` 存在
- [ ] `strict: true`
- [ ] `noImplicitAny: true`

---

#### Task 003: 建立目录结构

**目的**: 建立标准化目录结构

**操作指南**:
```bash
mkdir -p src/{plugin/{hooks,router},skill/{commands,handlers},onboard}
mkdir -p .dev/{docs,batches}
mkdir -p .polymind/{routing,preferences,performance}
touch src/.gitkeep .polymind/.gitkeep
```

**验收标准**:
- [ ] 目录结构符合规范
- [ ] `.gitignore` 包含 `.polymind/`、`node_modules/`、`dist/`

---

### Batch 001 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 001 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] package.json
- [ ] tsconfig.json
- [ ] 目录结构

### 问题记录
[如有]

### 验证命令
```bash
ls -la && cat package.json | jq '.scripts'
```
```

---

## Batch 002: 代码规范

### Batch 目的

建立代码风格规范，确保代码可读性和可维护性。

### Batch 目标

- [ ] 建立 ESLint 配置
- [ ] 建立 Prettier 配置
- [ ] 建立命名规范文档

### Batch Guiderails

**必须做**:
- ESLint 使用 `typescript-eslint/recommended`
- Prettier 统一格式化
- 文件命名: `kebab-case.ts`
- 类型命名: `PascalCase`
- 常量命名: `UPPER_SNAKE_CASE`

**不应该做**:
- ❌ 不要混用命名风格
- ❌ 不要使用 `var`
- ❌ 不要在代码中硬编码配置值

### Tasks

#### Task 001: 配置 ESLint

**操作指南**:
```bash
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev
```

创建 `.eslintrc.json`:
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "warn"
  }
}
```

**验收标准**:
- [ ] ESLint 运行无错误
- [ ] `any` 类型报错

---

#### Task 002: 配置 Prettier

**操作指南**:
```bash
npm install prettier eslint-config-prettier --save-dev
```

创建 `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**验收标准**:
- [ ] Prettier 格式化正常
- [ ] 与 ESLint 无冲突

---

#### Task 003: 编写命名规范

**操作指南**:

在 `.dev/docs/` 创建 `CODING_STANDARDS.md`:

```markdown
# PolyMind 代码命名规范

## 文件命名
- TypeScript: `kebab-case.ts`
- 配置文件: `kebab-case.json`
- 测试文件: `*.test.ts`

## 类型命名
- Interface: `IPascalCase` 或 `PascalCase`
- Type: `PascalCase`
- Enum: `PascalCase`

## 函数命名
- 动词: `camelCase`
- 事件处理: `handleXxx`
- 异步: `fetchXxx`, `loadXxx`, `saveXxx`

## 常量命名
- 配置常量: `UPPER_SNAKE_CASE`
- 枚举值: `UPPER_SNAKE_CASE`
```

**验收标准**:
- [ ] 规范文档存在且可读

---

### Batch 002 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 002 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] .eslintrc.json
- [ ] .prettierrc
- [ ] CODING_STANDARDS.md

### 验证命令
```bash
npm run lint
npm run format -- --check
```
```

---

## Batch 003: CI/CD

### Batch 目的

建立自动化构建和测试流程。

### Batch 目标

- [ ] 建立 GitHub Actions 构建
- [ ] 建立自动化测试

### Batch Guiderails

**必须做**:
- PR 必须通过 lint + build + test
- Master 分支保护，禁止直接推送
- 构建产物自动发布

**不应该做**:
- ❌ 不要在 CI 中硬编码 secrets
- ❌ 不要跳过测试
- ❌ 不要在 CI 中修改 `.polymind/`

### Tasks

#### Task 001: 创建 GitHub Actions

**操作指南**:

创建 `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

**验收标准**:
- [ ] CI 配置存在
- [ ] PR 检查通过

---

#### Task 002: 建立测试框架

**操作指南**:
```bash
npm install jest @types/jest ts-jest --save-dev
npx jest --init
```

配置 `jest.config.js`:
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts']
};
```

**验收标准**:
- [ ] `npm test` 可运行
- [ ] 有测试覆盖率报告

---

### Batch 003 执行结果简报

> **执行后必须填写此部分**

```markdown
## Batch 003 执行结果

- **执行日期**: 
- **执行人**: 
- **执行结果**: ✅成功 / ⚠️部分成功 / ❌失败

### 输出物
- [ ] .github/workflows/ci.yml
- [ ] jest.config.js
- [ ] 测试框架

### 验证命令
```bash
npm test
# 检查 GitHub Actions 状态
```
```

---

## 📊 Phrase 0 总结

### 完成标准

所有 Batch 执行成功，且:
- [ ] CI 通过
- [ ] 代码可构建
- [ ] 测试可运行

### 执行记录

| Batch | 执行日期 | 执行人 | 结果 |
|-------|---------|--------|------|
| Batch 001 | | | |
| Batch 002 | | | |
| Batch 003 | | | |

### Phrase 0 最终状态

**状态**: 📋 待开始 → 🔄 进行中 → ✅ 完成

**完成日期**: 

---

*Phrase 0 - 基础奠基 - TDD Plan v1.0*