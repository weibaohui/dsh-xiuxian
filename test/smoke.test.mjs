import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const { CharacterStore, resolveLayout, narrate, SITUATIONS } = require(join(root, 'src/index.js')).__test
const { xxAnalyze, xxAvatarSVG } = require(join(root, 'client/avatar.js'))

test('打包数据集可构建角色索引', () => {
  const store = new CharacterStore(resolveLayout(join(root, 'data')))
  const n = store.build()
  assert.ok(n > 1000, `索引角色数应 > 1000，实际 ${n}`)
})

test('加权随机与具名查询', () => {
  const store = new CharacterStore(resolveLayout(join(root, 'data')))
  store.build()
  const c = store.roll()
  assert.ok(c.name && c.count >= 3)
  const hl = store.byName('韩立')
  assert.equal(hl.tier, 1, '韩立应为 Tier1')
})

test('修行话术组合', () => {
  const r = narrate({ tool: 'Bash', character: '韩立' })
  assert.match(r.line, /御剑术/)
  const e = narrate({ event: 'test', ok: true, character: '南宫婉' })
  assert.match(e.line, /试丹|丹成/)
  assert.ok(SITUATIONS.length >= 5)
})

test('形象引擎输出合法 SVG 且形态正确', () => {
  const hl = { name: '韩立', alias: '二愣子', identity: '山村贫家少年，持青竹蜂云剑' }
  const t = xxAnalyze(hl)
  assert.equal(t.accessory, 'sword')
  const out = xxAvatarSVG(hl)
  assert.ok(out.svg.startsWith('<svg') && out.svg.includes('</svg>'))
  const chong = xxAnalyze({ name: '噬金虫', identity: '上古群聚凶虫' })
  assert.equal(chong.kind, 'insect')
})

test('技能与生平文本可读取', () => {
  const store = new CharacterStore(resolveLayout(join(root, 'data')))
  store.build()
  const skill = store.skillText('南宫婉')
  assert.ok(skill && skill.length > 500)
  const bio = store.bioText('南宫婉')
  assert.ok(bio && bio.includes('生平'))
})
