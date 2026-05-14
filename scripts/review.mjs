/**
 * AI-MV Studio 代码审查脚本
 * 运行: node scripts/review.mjs
 * 功能: 类型检查 + 测试 + 构建验证 + 代码质量分析 + 生成审查报告
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const REVIEWS_DIR = join(ROOT, 'reviews')

const results = []
const highPriority = []
const mediumPriority = []
const lowPriority = []

function log(step, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️'
  const line = `${icon} [${status}] ${step}${detail ? ': ' + detail : ''}`
  results.push(line)
  console.log(line)
}

function run(cmd, cwd = ROOT) {
  try {
    const out = execSync(cmd, { cwd, encoding: 'utf-8', stdio: 'pipe', timeout: 120000 })
    return { ok: true, stdout: out.trim(), stderr: '' }
  } catch (e) {
    return { ok: false, stdout: e.stdout?.trim() || '', stderr: e.stderr?.trim() || e.message }
  }
}

function getFiles(dir, ext) {
  try {
    const result = execSync(`dir /s /b "${dir}\\*.${ext}"`, { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe' })
    return result.trim().split('\n').filter(Boolean).map(f => f.trim())
  } catch {
    return []
  }
}

async function review() {
  console.log('\n🔍 AI-MV Studio 代码审查\n')
  console.log('=' .repeat(50))

  if (!existsSync(REVIEWS_DIR)) mkdirSync(REVIEWS_DIR, { recursive: true })

  // ── 1. TypeScript 类型检查 ──
  console.log('\n--- 1. TypeScript 类型检查 ---')
  const tc = run('npx tsc --noEmit')
  if (tc.ok) {
    log('TypeScript 类型检查', 'PASS', '无类型错误')
  } else {
    const errors = tc.stderr || tc.stdout
    log('TypeScript 类型检查', 'FAIL', `发现类型错误`)
    highPriority.push('TypeScript 类型错误需要修复')
    results.push('```\n' + errors.slice(0, 2000) + '\n```')
  }

  // ── 2. 测试 ──
  console.log('\n--- 2. 测试 ---')
  const test = run('npx vitest run')
  if (test.ok) {
    log('单元测试', 'PASS', '全部通过')
  } else {
    log('单元测试', 'FAIL', '有测试失败')
    highPriority.push('测试失败需要修复')
    results.push('```\n' + (test.stderr || test.stdout || '').slice(0, 1000) + '\n```')
  }

  // ── 3. 构建验证 ──
  console.log('\n--- 3. 构建验证 ---')
  const build = run('npx vite build')
  if (build.ok) {
    log('生产构建', 'PASS', '构建成功')
  } else {
    log('生产构建', 'FAIL', '构建失败')
    highPriority.push('生产构建失败')
    results.push('```\n' + (build.stderr || build.stdout || '').slice(0, 1000) + '\n```')
  }

  // ── 4. 代码质量分析 ──
  console.log('\n--- 4. 代码质量分析 ---')

  // 4.1 检查 ts 文件数量
  const tsFiles = getFiles(join(ROOT, 'src'), 'ts')
  const tsxFiles = getFiles(join(ROOT, 'src'), 'tsx')
  log('源文件统计', 'INFO', `${tsFiles.length + tsxFiles.length} 个文件 (${tsFiles.length} ts + ${tsxFiles.length} tsx)`)

  // 4.2 检查 any 类型使用
  const anyCheck = run('findstr /s /n /i ": any" src\\*.ts src\\*.tsx', ROOT)
  if (anyCheck.ok && anyCheck.stdout) {
    const anyCount = anyCheck.stdout.split('\n').length
    log('any 类型使用', 'WARN', `发现 ${anyCount} 处 "any" 类型`)
    mediumPriority.push(`减少 "any" 类型使用 (${anyCount} 处)，改用具体类型`)
  } else {
    log('any 类型使用', 'PASS', '未发现 "any" 类型')
  }

  // 4.3 检查 console.log
  const consoleCheck = run('findstr /s /n "console\\.log\\|console\\.debug" src\\*.ts src\\*.tsx', ROOT)
  if (consoleCheck.ok && consoleCheck.stdout) {
    const consoleCount = consoleCheck.stdout.split('\n').length
    log('console.log 残留', 'WARN', `发现 ${consoleCount} 处 console.log/debug`)
    mediumPriority.push(`移除或替换 console.log 为 logger (${consoleCount} 处)`)
  } else {
    log('console.log 残留', 'PASS', '未发现残留')
  }

  // 4.4 检查 TODO/FIXME
  const todoCheck = run('findstr /s /n "TODO\\|FIXME\\|HACK\\|XXX" src\\*.ts src\\*.tsx', ROOT)
  if (todoCheck.ok && todoCheck.stdout) {
    const todoCount = todoCheck.stdout.split('\n').length
    log('TODO/FIXME 标记', 'INFO', `发现 ${todoCount} 处待办标记`)
    lowPriority.push(`处理 TODO/FIXME 标记 (${todoCount} 处)`)
    const lines = todoCheck.stdout.split('\n').slice(0, 20)
    results.push('待办标记:\n```\n' + lines.join('\n') + '\n```')
  } else {
    log('TODO/FIXME 标记', 'PASS', '未发现待办标记')
  }

  // 4.5 检查大文件
  log('文件大小检查', 'INFO', '正在扫描大文件...')
  for (const file of [...tsFiles, ...tsxFiles]) {
    try {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n').length
      const relPath = file.replace(ROOT + '\\', '')
      if (lines > 300) {
        log('大文件', 'WARN', `${relPath} (${lines} 行)`)
        mediumPriority.push(`考虑拆分大文件: ${relPath} (${lines} 行)`)
      }
    } catch { /* skip */ }
  }

  // 4.6 检查缺失的接口导出
  const indexCheck = run('findstr /s /n "interface\\|type " src\\types\\*.ts', ROOT)
  if (indexCheck.ok && indexCheck.stdout) {
    log('类型定义检查', 'INFO', `类型定义已集中管理`)
  }

  // ── 5. React 最佳实践检查 ──
  console.log('\n--- 5. React 最佳实践检查 ---')

  // 5.1 检查缺少 memo 的组件
  const componentCheck = run('findstr /s /n "export function\\|export const.*=>" src\\components\\*.tsx', ROOT)
  if (componentCheck.ok && componentCheck.stdout) {
    const components = componentCheck.stdout.split('\n')
    const memoCheck = run('findstr /s /n "\\.memo(" src\\components\\*.tsx', ROOT)
    const memoCount = memoCheck.ok && memoCheck.stdout ? memoCheck.stdout.split('\n').length : 0
    log('React 组件 memo 化', 'INFO', `${components.length} 个组件, ${memoCount} 个使用了 memo`)
    if (memoCount < components.length * 0.3) {
      mediumPriority.push('考虑对频繁重渲染的组件使用 React.memo')
    }
  }

  // 5.2 检查 && 条件渲染模式
  const andCheck = run('findstr /s /n "{[a-zA-Z].*&&" src\\components\\*.tsx', ROOT)
  if (andCheck.ok && andCheck.stdout) {
    const andCount = andCheck.stdout.split('\n').length
    if (andCount > 5) {
      log('条件渲染模式', 'WARN', `发现 ${andCount} 处 && 条件渲染（React 18 中 0 和 NaN 会被渲染）`)
      mediumPriority.push(`审查 && 条件渲染模式 (${andCount} 处)，考虑用三元表达式`)
    } else {
      log('条件渲染模式', 'PASS', `仅 ${andCount} 处 && 模式，可接受`)
    }
  }

  // 5.3 检查 useEffect 依赖
  const effectCheck = run('findstr /s /n "useEffect" src\\*.tsx', ROOT)
  if (effectCheck.ok && effectCheck.stdout) {
    log('useEffect 使用', 'INFO', `共 ${effectCheck.stdout.split('\n').length} 处`)
  }

  // ── 6. 生成报告 ──
  const date = new Date().toISOString().split('T')[0]
  const score = calculateScore(results)

  const report = `# AI-MV Studio 代码审查报告 — ${date}

## 审查摘要

| 项目 | 结果 |
|------|------|
| 类型检查 | ${results.find(r => r.includes('TypeScript 类型检查'))?.includes('PASS') ? '✅ 通过' : '❌ 失败'} |
| 单元测试 | ${results.find(r => r.includes('单元测试'))?.includes('PASS') ? '✅ 通过' : '❌ 失败'} |
| 生产构建 | ${results.find(r => r.includes('生产构建'))?.includes('PASS') ? '✅ 通过' : '❌ 失败'} |
| 总体评分 | **${score}/10** |

## 高优先级问题

${highPriority.length ? highPriority.map(h => `- 🔴 ${h}`).join('\n') : '- 无高优先级问题 🎉'}

## 中优先级改进

${mediumPriority.length ? mediumPriority.map(m => `- 🟡 ${m}`).join('\n') : '- 无中优先级建议'}

## 低优先级优化

${lowPriority.length ? lowPriority.map(l => `- 🟢 ${l}`).join('\n') : '- 无低优先级建议'}

## 详细结果

${results.join('\n')}

---

## 评分标准

| 分数 | 说明 |
|------|------|
| 9-10 | 优秀，无需调整 |
| 7-8  | 良好，少量优化 |
| 5-6  | 一般，需关注 |
| 3-4  | 较差，需修复 |
| 1-2  | 严重问题 |

*报告生成时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}*
`

  const reportPath = join(REVIEWS_DIR, `review-${date}.md`)
  writeFileSync(reportPath, report, 'utf-8')
  log('审查报告', 'INFO', `已保存到 reviews/review-${date}.md`)

  console.log('\n' + '=' .repeat(50))
  console.log(`\n📊 总体评分: ${score}/10`)
  console.log(`📄 报告已保存: reviews/review-${date}.md\n`)

  // 输出摘要
  if (highPriority.length) {
    console.log('🔴 高优先级问题:')
    highPriority.forEach(h => console.log(`   - ${h}`))
  }
  if (mediumPriority.length) {
    console.log('\n🟡 中优先级改进:')
    mediumPriority.forEach(m => console.log(`   - ${m}`))
  }
}

function calculateScore(results) {
  let score = 10
  for (const r of results) {
    if (r.includes('[FAIL]')) score -= 2
    if (r.includes('[WARN]')) score -= 0.5
  }
  return Math.max(1, Math.round(score))
}

review().catch(e => {
  console.error('审查脚本出错:', e)
  process.exit(1)
})