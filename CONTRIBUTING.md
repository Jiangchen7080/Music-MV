# 贡献指南

感谢你对 AI-MV Studio 的关注！我们欢迎任何形式的贡献，包括但不限于：

## 报告 Bug

如果你发现了 Bug，请通过 GitHub Issues 提交，并包含以下信息：

- 问题的简要描述
- 复现步骤
- 预期行为与实际行为
- 浏览器版本和环境信息
- 截图或录屏（如有）

## 提交 Pull Request

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feat/amazing-feature`
3. 提交你的改动：`git commit -m 'feat: add amazing feature'`
4. 推送到分支：`git push origin feat/amazing-feature`
5. 提交 Pull Request

### 开发规范

- 使用 TypeScript，确保类型完整
- 遵循现有的代码风格
- 组件使用函数组件 + Hooks
- 样式使用 Tailwind 原子类
- 提交信息遵循 Conventional Commits 规范

### 提交信息格式

```
<type>(<scope>): <description>

feat:    新功能
fix:     Bug 修复
docs:    文档更新
style:   代码格式（不影响功能）
refactor: 代码重构
perf:    性能优化
test:    测试相关
chore:   构建/工具链
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck

# 运行测试
npm test

# 构建
npm run build
```

## 代码审查

所有 PR 都需要经过代码审查。审查标准包括：

- 代码正确性
- 类型安全
- 性能影响
- 浏览器兼容性
- 是否符合项目架构