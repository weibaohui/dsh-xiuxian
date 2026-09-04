'use strict'

/**
 * dsh-xiuxian — Host half
 *
 * 修仙陪伴：随机唤醒一位《凡人修仙传》角色，供 web 客户端的悬浮浮层消费。
 *
 * 数据集随 npm 包自带（`data/`：cards 2496 张人物卡片、skills 2055 份角色
 * 技能、bios 2060 份生平、stats.json、edges.json），开箱即用；也可用插件
 * 配置 `dataDir` 指向外部数据集（支持两种布局）：
 *   - 打包布局：dataDir 下直接是 cards/ skills/ bios/ stats.json
 *   - 工作区布局：dataDir 下是 人物卡片-合并版/ 对话系统/角色技能/ 数据/
 *
 * HTTP API（/dsh-xiuxian/api/*）：
 *   GET /roll            加权随机一位角色（Tier1 > 高出场 > 普通）
 *   GET /comment?name=   按角色原声给一条"写代码修行"点评
 *   GET /skill?name=     返回该角色的对话技能 prompt（纯文本）
 *   GET /bio?name=       返回该角色的生平（纯文本）
 *   GET /status          数据集概况
 *   GET /reload          重建内存索引（数据更新后调用）
 *
 * 零 npm 依赖：只用 node 内置模块，经注入的 `webServer` 挂路由。
 */

const fs = require('node:fs')
const path = require('node:path')
const { narrate, TOOLS, EVENTS, VOCAB } = require('./narration')

/** npm 包自带的数据集目录。 */
const BUNDLED_DATA_DIR = path.join(__dirname, '..', 'data')

/** 出场章数低于该值的角色不参与陪伴（太单薄）。 */
const MIN_CHAPTERS = 3

/** 每个角色最多缓存的语录条数。 */
const MAX_QUOTES = 12

/** "写代码即修行"的情境点评素材：情境名 + 修仙引子。 */
const SITUATIONS = [
  ['提交代码', '此刻正是突破契机——'],
  ['遇到难缠的bug', '心魔来袭，切忌心浮——'],
  ['重构旧代码', '旧法重炼，去芜存菁——'],
  ['新项目开工', '开辟洞府，先筑根基——'],
  ['写文档', '留玉简于后来者，功德无量——'],
  ['调参调优', '丹火文武，全在一念之间——'],
  ['翻看别人的代码', '他山之玉，可以攻石——'],
  ['久坐一个时辰', '周天滞涩，气血不畅，该起身了——'],
  ['想删库跑路', '入魔易，出魔难，道友慎之——'],
]

/** 把 dataDir 解析成各资源目录（兼容打包布局与工作区布局）。 */
function resolveLayout(dataDir) {
  if (fs.existsSync(path.join(dataDir, 'cards'))) {
    return {
      cardsDir: path.join(dataDir, 'cards'),
      skillsDir: path.join(dataDir, 'skills'),
      biosDir: path.join(dataDir, 'bios'),
      statsFile: path.join(dataDir, 'stats.json'),
      metaFile: path.join(dataDir, 'meta.json'),
      dataDir,
      layout: 'bundled',
    }
  }
  return {
    cardsDir: path.join(dataDir, '人物卡片-合并版'),
    skillsDir: path.join(dataDir, '对话系统', '角色技能'),
    biosDir: path.join(dataDir, '生平'),
    statsFile: path.join(dataDir, '数据', '统计合并版.json'),
    metaFile: undefined,
    dataDir,
    layout: 'workspace',
  }
}

/** 解析人物卡片 frontmatter 与语录区。 */
function parseCard(file) {
  const text = fs.readFileSync(file, 'utf8')
  const head = text.split('---')
  const fm = {}
  if (head.length >= 3) {
    for (const line of head[1].split('\n')) {
      const i = line.indexOf(':')
      if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }
  }
  const quoteBlock = text.match(/## 经典语录\n([\s\S]*?)(?=\n## |\s*$)/)
  const quotes = quoteBlock
    ? quoteBlock[1].split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('|') && !l.includes('---'))
        .map((l) => l.split('|').slice(2, -1).join('|').trim())
        .filter((q) => q.length > 8)
        .slice(0, MAX_QUOTES)
    : []
  return { fm, quotes }
}

/** 读取技能文件头部的 Tier 与出场章数标注。 */
function skillMeta(file) {
  try {
    const head = fs.readFileSync(file, 'utf8').slice(0, 300)
    const m = head.match(/Tier(\d)，出场(\d+)章/)
    return m ? { tier: Number(m[1]), count: Number(m[2]) } : undefined
  } catch {
    return undefined
  }
}

class CharacterStore {
  /** @param layout resolveLayout() 的产物 */
  constructor(layout) {
    this.layout = layout
    this.characters = []
    this.builtAt = undefined
    this.meta = undefined
    try {
      if (layout.metaFile && fs.existsSync(layout.metaFile)) {
        this.meta = JSON.parse(fs.readFileSync(layout.metaFile, 'utf8'))
      }
    } catch {}
  }

  build() {
    const { cardsDir, statsFile } = this.layout
    let stats = {}
    try { stats = JSON.parse(fs.readFileSync(statsFile, 'utf8')) } catch {}

    const list = []
    for (const entry of fs.readdirSync(cardsDir)) {
      if (!entry.endsWith('.md')) continue
      const name = entry.slice(0, -3)
      const stat = stats[name]
      const count = stat ? stat.count : 0
      if (count < MIN_CHAPTERS) continue
      const { fm, quotes } = parseCard(path.join(cardsDir, entry))
      const skill = skillMeta(path.join(this.layout.skillsDir, entry))
      list.push({
        name,
        alias: fm.aliases && fm.aliases !== '无' ? fm.aliases : '',
        identity: fm.identity || '',
        tier: skill ? skill.tier : 2,
        count: skill ? skill.count : count,
        quotes,
      })
    }
    this.characters = list
    this.builtAt = new Date().toISOString()
    return list.length
  }

  ensure() {
    if (this.characters.length === 0) this.build()
    return this.characters
  }

  roll() {
    const list = this.ensure()
    if (list.length === 0) return undefined
    const weights = list.map((c) => (c.tier === 1 ? 6 : c.count >= 80 ? 3 : c.count >= 20 ? 2 : 1))
    let total = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    for (let i = 0; i < list.length; i++) {
      r -= weights[i]
      if (r <= 0) return list[i]
    }
    return list[list.length - 1]
  }

  byName(name) {
    return this.ensure().find((c) => c.name === name)
  }

  comment(name) {
    const c = name ? this.byName(name) : this.roll()
    if (!c) return undefined
    const [situation, hook] = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)]
    return {
      name: c.name,
      situation,
      hook,
      quote: c.quotes.length ? c.quotes[Math.floor(Math.random() * c.quotes.length)] : '',
    }
  }

  readDoc(dir, name) {
    const file = path.join(dir, `${name}.md`)
    if (!dir || !fs.existsSync(file)) return undefined
    return fs.readFileSync(file, 'utf8')
  }

  skillText(name) {
    const text = this.readDoc(this.layout.skillsDir, name)
    if (text === undefined) return undefined
    const m = text.match(/```\n([\s\S]*?)\n```/)
    return m ? m[1] : text
  }

  bioText(name) {
    return this.readDoc(this.layout.biosDir, name)
  }
}

module.exports = {
  name: 'dsh-xiuxian',
  inject: ['webServer'],

  __test: { parseCard, skillMeta, CharacterStore, resolveLayout, SITUATIONS, BUNDLED_DATA_DIR, narrate },

  apply(ctx, rawConfig) {
    const config = rawConfig && typeof rawConfig === 'object' ? rawConfig : {}
    const dataDir = config.dataDir || BUNDLED_DATA_DIR
    const layout = resolveLayout(dataDir)
    if (!fs.existsSync(layout.cardsDir)) {
      ctx.logger?.warn?.(`[dsh-xiuxian] dataDir 下未找到人物卡片目录：${layout.cardsDir}`)
    }
    const store = new CharacterStore(layout)

    const sendJson = (res, status, payload) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(payload))
    }

    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: '/dsh-xiuxian/api',
      handler: async (req, res) => {
        try {
          const url = new URL(req.url || '/', 'http://dsh.local')
          const p = url.pathname.replace(/\/+$/, '')
          if (req.method === 'GET' && p.endsWith('/dsh-xiuxian/api/roll')) {
            const c = store.roll()
            if (!c) { sendJson(res, 503, { error: '角色索引为空' }); return }
            sendJson(res, 200, { character: c })
            return
          }
          if (req.method === 'GET' && p.endsWith('/dsh-xiuxian/api/comment')) {
            const c = store.comment(url.searchParams.get('name') || undefined)
            if (!c) { sendJson(res, 404, { error: '角色不存在' }); return }
            sendJson(res, 200, c)
            return
          }
          if (req.method === 'GET' && p.endsWith('/dsh-xiuxian/api/skill')) {
            const text = store.skillText(url.searchParams.get('name') || '')
            if (text === undefined) { sendJson(res, 404, { error: '技能不存在' }); return }
            res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
            res.end(text)
            return
          }
          if (req.method === 'GET' && p.endsWith('/dsh-xiuxian/api/bio')) {
            const text = store.bioText(url.searchParams.get('name') || '')
            if (text === undefined) { sendJson(res, 404, { error: '生平不存在' }); return }
            res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
            res.end(text)
            return
          }
          if (req.method === 'GET' && p.endsWith('/dsh-xiuxian/api/narrate')) {
            const q = url.searchParams
            const character = q.get('name') || undefined
            const c = character ? store.byName(character) : store.roll()
            const quote = c && c.quotes.length && Math.random() < 0.6
              ? c.quotes[Math.floor(Math.random() * c.quotes.length)]
              : undefined
            // event 优先；无 event 时随机挑一个生活情境事件，让浮层常新
            const eventKeys = Object.keys(EVENTS)
            const event = q.get('event') || (q.get('tool') ? undefined : eventKeys[Math.floor(Math.random() * eventKeys.length)])
            const okParam = q.get('ok')
            const result = narrate({
              tool: q.get('tool') || undefined,
              event,
              ok: okParam === null ? undefined : okParam === 'true',
              character: c ? c.name : undefined,
              quote,
            })
            sendJson(res, 200, { ...result, character: c ? c.name : undefined })
            return
          }
          if (req.method === 'GET' && p.endsWith('/dsh-xiuxian/api/incantation')) {
            const file = path.join(layout.dataDir, 'incantation.md')
            if (!fs.existsSync(file)) { sendJson(res, 404, { error: '话术文件缺失' }); return }
            res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
            res.end(fs.readFileSync(file, 'utf8'))
            return
          }
          if (req.method === 'GET' && p.endsWith('/dsh-xiuxian/api/lexicon')) {
            sendJson(res, 200, { tools: TOOLS, events: EVENTS, vocab: VOCAB })
            return
          }
          if (req.method === 'GET' && p.endsWith('/dsh-xiuxian/api/status')) {
            const list = store.ensure()
            sendJson(res, 200, {
              dataDir,
              layout: layout.layout,
              characters: list.length,
              majors: list.filter((c) => c.tier === 1).length,
              dataset: store.meta?.counts || undefined,
              builtAt: store.builtAt,
            })
            return
          }
          if (req.method === 'GET' && p.endsWith('/dsh-xiuxian/api/reload')) {
            sendJson(res, 200, { characters: store.build(), builtAt: store.builtAt })
            return
          }
          sendJson(res, 404, { error: 'not found' })
        } catch (error) {
          sendJson(res, 400, { error: String((error && error.message) || error) })
        }
      },
    }), 'dsh-xiuxian: api route')
  },
}
