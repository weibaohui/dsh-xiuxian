/**
 * Build `client/bundle.js` from `client/index.js`.
 *
 * 静态安装产物遵循 client-modules bundle 协议：
 * `window.__ModuleLoader__.load({ id, factory })` 注册一个惰性 CommonJS
 * 工厂，收到的 `require` 可解析平台模块（react）；本插件无其他依赖，全部内联。
 *
 * Run: `npm run build:client`
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const sourcePath = join(here, '..', 'client', 'index.js')
const bundlePath = join(here, '..', 'client', 'bundle.js')

const pkg = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8'))
const avatarSource = readFileSync(join(here, '..', 'client', 'avatar.js'), 'utf8')
const source = readFileSync(sourcePath, 'utf8')

const banner = `/* Generated from client/index.js by scripts/build-client.mjs — do not edit by hand.
 * Regenerate with: npm run build:client
 */
window.__ModuleLoader__.load({
  id: ${JSON.stringify(pkg.name)},
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
    var React = require("react")
`

const footer = `
    return module.exports
  }
})
`

const indent = (code) => code
  .split('\n')
  .map((line) => (line.length === 0 ? line : '    ' + line))
  .join('\n')

// avatar.js 定义形象引擎（xxAnalyze/xxAvatarSVG），内联进同一工厂作用域供 index.js 使用
writeFileSync(bundlePath, banner + indent(avatarSource) + '\n' + indent(source) + footer)
console.log(`built ${bundlePath} (${Buffer.byteLength(banner + indent(source) + footer, 'utf8')} bytes)`)
