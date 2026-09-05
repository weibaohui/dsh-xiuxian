'use strict'

/**
 * Q 版形象引擎 v5 —— Minecraft 风格。
 * 每形态一张方块化像素模板（头/身/臂/腿分件，经典 mob 造型）：
 *   humanoid = Steve 立正 | beast = 狼(侧) | bird = 鸡 | insect = 蜂 | ghost = 恶魂 | puppet = 铁傀儡
 * 马赛克噪点纹理 + 同款眨眼双帧。配色仍由角色卡数据关键词驱动。
 */

const KIND_RULES = [
  ['insect', /虫|蜈蚣|蚁|蜂|蛛|蛾|蝶|螳|蝉|蝎/],
  ['bird', /鸟|雕|鹰|鹤|鹏|鸦|隼|鸾|凤|燕|鸥|禽|翼|鹫|鹭/],
  ['beast', /兽|狼|狐|虎|豹|狮|鲸|蛟|龙|蛇|蟒|熊|鹿|鼠|猫|貂|獾|妖狐|灵宠|龟|鳌/],
  ['puppet', /傀儡|儡|人偶|木偶|机关/],
  ['ghost', /鬼灵|厉鬼|阴鬼|恶鬼|鬼卒|鬼修|亡魂|幽魂|魂体|阴灵|厉魄|冤魂|骷髅|僵尸/],
  ['monk', /僧|佛|和尚|老衲|禅师|罗汉|金刚|比丘|沙弥|菩萨|弥陀|菩提/],
  ['girl', /女|娘|妃|姬|仙子|夫人|娘子|嫂|婆|媳|姑|姨|妻|妇|嫔|媛|道姑|师姐|师妹|淑|婉|凝/],
  ['child', /童|孩|少年|幼|娃娃|小丫头|小子/],
  ['elder', /老|翁|公|叟|祖|长者|太上/],
]

const COLOR_RULES = [
  [/青/, 172, 62, 50], [/碧|翠/, 152, 58, 46], [/绿/, 125, 55, 44],
  [/紫/, 275, 52, 58], [/幽|冥/, 265, 38, 50],
  [/蓝/, 214, 60, 52], [/银/, 217, 18, 76],
  [/白|雪|霜/, 210, 16, 88],
  [/金|黄/, 45, 70, 56],
  [/橙|橘/, 28, 74, 56],
  [/粉|桃/, 330, 66, 72],
  [/红|赤|血|朱/, 2, 62, 50],
  [/墨|玄|乌|黑/, 258, 16, 34],
  [/灰/, 220, 8, 56],
]

const ACCESSORY_RULES = [
  ['sword', /剑|锋|刃/], ['gourd', /葫芦|酒/], ['scroll', /书|经|简|卷|谱/],
  ['ring', /环|轮|圈/], ['beads', /珠|念珠|佛珠/], ['cauldron', /炉|鼎|丹|药|医/],
  ['banner', /幡|旗/], ['bell', /铃|钟/], ['fan', /扇/], ['flute', /琴|箫|笛/],
  ['blade', /刀/], ['brush', /笔/], ['seal', /印/],
]

const HORN_RE = /魔族|圣祖|古魔|真魔|魔神|魔君|妖神|魔王/
const DARK_RE = /魔道|魔修|魔门|魔宗|黑煞|邪修|阴煞/

function firstMatch(text, rules) {
  for (const [val, re] of rules) if (re.test(text)) return val
  return undefined
}

function xxAnalyze(c) {
  const text = `${c.name || ''} ${c.alias || ''} ${c.identity || ''}`
  let kind = firstMatch(text, KIND_RULES) || 'humanoid'
  if ((kind === 'beast' || kind === 'bird') && /妃|姬|仙子|夫人|娘子|女修|道姑|师姐|师妹/.test(text) && !/妖|兽形|真身|原形|兽身/.test(text)) {
    kind = 'girl'
  }
  let hue = 160, sat = 60, light = 50
  for (const [re, h, s, l] of COLOR_RULES) {
    if (re.test(text)) { hue = h; sat = s; light = l; break }
  }
  if (hue === 160 && !/青|碧|绿/.test(text)) {
    let n = 0
    for (const ch of String(c.name || '')) n = (n * 31 + ch.codePointAt(0)) % 360
    hue = n
  }
  const dark = DARK_RE.test(text)
  if (dark) { sat = Math.max(14, sat - 24); light = Math.min(36, light) }
  return {
    kind, hue, sat, light,
    horns: HORN_RE.test(text),
    dark,
    accessory: firstMatch(text, ACCESSORY_RULES),
  }
}

/* ── 模板（字符：. 空 | b 主色 | l 亮 | d 暗 | o 描边深 | h 发 | s 肤 |
      e 眼白 | p 瞳 | m 嘴 | w 白 | y 金 | r 红 | k 黑 | g 灰 | t 转折暗）── */

// Steve 式立正（20×26）
const T_HUMANOID = [
  '....hhhhhhhhhhhh....',
  '...hhhhhhhhhhhhhh...',
  '...hhhhhhhhhhhhhh...',
  '...hhhhhhhhhhhhhh...',
  '...hssssssssssssh...',
  '...hseewsssseewsh...',
  '...hseepsssseepsh...',
  '...hsssssnssssssh...',
  '...hssssmmmmssssh...',
  '....ssssssssssss....',
  '..bbbbbbbbbbbbbbbo..',
  '.bbbbbbbbbbbbbbbbbo.',
  '.bbllbbbbbbbbllbbbo.',
  '.bbllbbbbbbbbllbbbo.',
  '.bslbbbbbbbbbblbbso.',
  '.bslbbbbaabbbblbbso.',
  '.bslbbbbaabbbblbbso.',
  '.bslbbbbbbbbbslbboo.',
  '..sllddddddddlls oo..',
  '..dddddo..odddddd...',
  '..dddddo..odddddd...',
  '..dddddo..odddddd...',
  '..ooo oo..oo ooo....',
  '..yyyyo..oyyyyyo....',
  '..yyyyo..oyyyyyo....',
  '...ooo....ooooo.....',
]

// 狼（侧视 24×18）
const T_BEAST = [
  '........................',
  '..ooo...................',
  '.ohhho..................',
  '.ohhho.......oooo.......',
  '..ohhho....obbbbbbo.....',
  '..ohewho..obbbbbbbbbo...',
  '..ohepho..obllbbllbbo...',
  '..ohhhho.obbbbbbbbbboo..',
  '..ohhhhooobbbbbbbbbbbo..',
  '.ohhhhhbbbbbbbbbbbbbo...',
  '.ohhhhhbbbbbbbbbbbbo....',
  '.ohhhhhbbbbbbbbbbbo.....',
  '..ohhhhhbbbbbbbbbo......',
  '..ohhbbbbbbbbbbbo.......',
  '..ohbo.ohhbo..ohhbo.....',
  '..obbo.obbbo..obbbo.....',
  '..obbo.obbbo..obbbo.....',
  '..oooo.oooo...oooo......',
]

// 鸡（正面 20×20）
const T_BIRD = [
  '.......oooooooo.....',
  '......obbbbbboo.....',
  '......obbbbbbo......',
  '......obkbbbko......',
  '......obbbbbbo......',
  '.......oyyyyo.......',
  '........orryo.......',
  '....oooooooooooo....',
  '..oobbbbbbbbbbbboo..',
  '.obbbbbbbbbbbbbbboo.',
  '.obbggbbbbbbggbbbo..',
  '.obbggbbbbbbggbbbo..',
  '.obbbbbbbbbbbbbbo...',
  '..obbbbbbbbbbbbo....',
  '..obbbbbbbbbbbbo....',
  '...obbbbbbbbbbo.....',
  '....obbbbbbbbo......',
  '.....oyo..oyo.......',
  '.....oyo..oyo.......',
  '....oyyyooyyyo......',
]

// 蜂（侧视 24×14）
const T_INSECT = [
  '......gg......gg........',
  '.....gggg....gggg.......',
  '.....gggg....gggg.......',
  '........................',
  '...okkkbbbbbbbbbbbbboo..',
  '..okkkkkbbbbbbbbbbbbboo.',
  '..okkekkbbbbbbbbbbbbboo.',
  '..okkekkkkbbbbkkbbbbboo.',
  '...okkkkkbbbbkkbbbbbbo..',
  '...okkkkkbbbbkkbbbbbo...',
  '....ooooobbbbbbbbbo.....',
  '.........obbbbbbo.......',
  '..........okkko.........',
  '...........okko.........',
]

// 恶魂（20×22）
const T_GHOST = [
  '..oooooooooooooo.....',
  '.obbbbbbbbbbbbbbo....',
  '.obbbbbbbbbbbbbbo....',
  '.obbwwbbbbbbwwbbbo...',
  '.obbwwbbbbbbwwbbbo...',
  '.obbbbbbbbbbbbbbbo...',
  '.obbkkbbbbbbkkbbbo...',
  '.obbkkbbbbbbkkbbbo...',
  '.obbbbbbbbbbbbbbbo...',
  '.obbbbbbbbbbbbbbbbo..',
  '.obbbbbbbbbbbbbbbbo..',
  '..obbbbbbbbbbbbbbo...',
  '..obbbbbbbbbbbbbbo...',
  '..obbbbbbbbbbbbbbo...',
  '..oobbbbbbbbbbbboo...',
  '...obbobbbbbbobbo....',
  '...obbobbbbbbobbo....',
  '...obbobbbbbbobbo....',
  '...obboobbbboobbo....',
  '...obboobbbboobbo....',
  '....oo.oooooo.oo.....',
  '.....................',
]

// 铁傀儡式（20×26）
const T_PUPPET = [
  '....oooooooooo......',
  '....obbbbbbbbo......',
  '....obbbbbbbbo......',
  '....obbbbbbbbo......',
  '....obbboobbbo......',
  '....obbboobbbo......',
  '....obbbnnbbbbo.....',
  '....obbbnnbbbbo.....',
  '....obbbbbbbbo......',
  '..bbbbbbbbbbbbbb....',
  '.bbbbbbbbbbbbbbbbo..',
  '.bbllbbbbbbbbllbbo..',
  '.bbllbbbbbbbbllbbo..',
  '.bbllbbbaabbbbllbbo..',
  '.bbbbbbbaabbbbbbboo..',
  '.obbbbbbbaabbbbboo...',
  '..obbbbbbbbbbbboo....',
  '..obbbbbbbbbbbbo.....',
  '..obbbbo..obbbbo.....',
  '..obbbbo..obbbbo.....',
  '..obbbbo..obbbbo.....',
  '..obbbbo..obbbbo.....',
  '.oobbbbo..obbbboo....',
  '.oyyyyy...oyyyyyo....',
  '.oyyyyy...oyyyyyo....',
  '..oooo.....ooooo.....',
]

/* ── 状态变体（以基础模板为底，程序化变换）──
   idle: 默认（开眼）
   working: 头前倾 + 手抬起（敲键盘感）——手臂行前移
   failed: 倒地（整体旋转 90°）+ 流泪行
   sleep: 闭眼 + 眼行变肤色线 */

function variantWorking(grid) {
  // 把手臂行（含 s 肤色在身体两侧的行）的 s 左移一位，模拟举手敲击
  return grid.map((row) => {
    if (!row.includes('s') || row.indexOf('s') < 0) return row
    const i = row.indexOf('s')
    if (i === 0 || row[i - 1] === 's') return row
    return row.slice(0, i - 1) + 's' + row.slice(i - 1, i) + row.slice(i + 1)
  })
}

function variantFailed(grid) {
  // 整体顺时针倒地（转置+翻转），行宽归一
  const h = grid.length, w = grid[0].length
  const rot = []
  for (let x = 0; x < w; x++) {
    let newRow = ''
    for (let y = h - 1; y >= 0; y--) newRow += grid[y][x] === '.' ? '.' : grid[y][x]
    rot.push(newRow.slice(0, w).padEnd(w, '.'))
  }
  while (rot.length > h) rot.pop()
  while (rot.length < h) rot.push('.'.repeat(w))
  return rot
}

function variantSleep(grid) {
  // 全行闭眼：e→o(线) w→删除，并加 z 前缀行不行——直接闭眼即可
  return grid.map((row) => row.replace(/e/g, 'o').replace(/w/g, '.'))
}

const TEMPLATES = {
  humanoid: T_HUMANOID, girl: T_HUMANOID, elder: T_HUMANOID, child: T_HUMANOID, monk: T_HUMANOID, cultivator: T_HUMANOID,
  beast: T_BEAST, bird: T_BIRD, insect: T_INSECT, ghost: T_GHOST, puppet: T_PUPPET,
}

function paletteOf(t) {
  const { hue, sat, light } = t
  return {
    b: `hsl(${hue},${sat}%,${light}%)`,
    l: `hsl(${hue},${Math.max(sat - 6, 10)}%,${Math.min(light + 16, 90)}%)`,
    d: `hsl(${hue},${Math.max(sat - 6, 12)}%,${Math.max(light - 14, 15)}%)`,
    t: `hsl(${hue},${Math.max(sat - 8, 12)}%,${Math.max(light - 9, 16)}%)`,
    o: `hsl(${hue},${Math.max(sat - 12, 15)}%,${Math.max(light - 27, 12)}%)`,
    h: `hsl(${hue},${Math.max(sat - 8, 14)}%,${Math.max(light - 10, 16)}%)`,
    s: '#e8c49a',
    e: '#ffffff',
    p: (t.hue > 200 || t.light < 30) ? '#7a4a8a' : '#4a3b8a',
    m: '#8a5a4a',
    n: '#c9a02f',
    w: '#f4f4f4',
    y: '#e8c05a',
    r: '#c9564a',
    k: '#2a2422',
    g: '#b8c4cc',
  }
}

/** 游程合并 + 马赛克噪点（MC 纹理感）。 */
function gridToRects(grid, palette) {
  const at = (x, y) => (grid[y] && grid[y][x]) || '.'
  // 自动裁边：算非空包围盒（+1 格呼吸边），让角色撑满画布
  let minX = 16, minY = 16, maxX = -1, maxY = -1
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const ch = grid[y][x]
      if (ch !== '.' && ch !== ' ') {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) { minX = 0; minY = 0; maxX = 15; maxY = Math.min(15, grid.length - 1) }
  minX = Math.max(0, minX - 1); minY = Math.max(0, minY - 1)
  maxX = Math.min(15, maxX + 1); maxY = Math.min(grid.length - 1, maxY + 1)
  const rects = []
  for (let y = minY; y <= maxY; y++) {
    const row = grid[y]
    let x = minX
    while (x <= maxX) {
      let ch = row[x]
      if (ch === '.' || ch === ' ') { x++; continue }
      // 眼白只许贴着眼黑，游离白点归主体色
      if (ch === 'w' && !((at(x - 1, y) === 'e') || (at(x + 1, y) === 'e') || (at(x, y - 1) === 'e') || (at(x, y + 1) === 'e'))) {
        ch = 'b'
      }
      let run = 1
      while (x + run <= maxX && row[x + run] === ch) run++
      let fill = palette[ch]
      if (!fill) fill = `hsl(${(ch.charCodeAt(0) * 7) % 360},60%,50%)`
      // MC 纹理噪点：主体/亮部按确定性抖动混入暗像素
      if ((ch === 'b' || ch === 'l') && (x * 13 + y * 7) % 9 === 0) fill = palette.d || fill
      rects.push(el('rect', { x: x - minX, y: y - minY, width: run, height: 1, fill }))
      x += run
    }
  }
  return rects.join('')
}

function el(tag, attrs, inner) {
  const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
  return `<${tag} ${a}>${inner || ''}</${tag}>`
}

/** 眨眼：把眼睛两行换成闭合线（肤色/暗色）。 */
function closedGrid(grid) {
  return grid.map((row) => row.replace(/[ep]/g, 's').replace(/[ew]w/g, 'ss'))
}

function xxAvatarSVG(c, state = 'idle') {
  const t = xxAnalyze(c)
  const palette = paletteOf(t)
  let grid = (TEMPLATES[t.kind] || T_HUMANOID).map((r) => (r + '................').slice(0, 16))
  if (state === 'working') grid = variantWorking(grid)
  else if (state === 'failed') grid = variantFailed(grid)
  else if (state === 'sleep') grid = variantSleep(grid)
  // 真·双帧待机：frameA 原画，frameB 整体下沉 1 格（FC 弹跳）
  const gridB = ['................', ...grid.slice(0, grid.length - 1)]
  const frameA = el('g', { class: 'xx-eo' }, gridToRects(grid, palette))
  const frameB = el('g', { class: 'xx-ec' }, gridToRects(closedGrid(grid), palette))
  const frameBounce = el('g', { class: 'xx-hopf' }, el('g', { transform: 'translate(0 1)' },
    el('g', { class: 'xx-eo' }, gridToRects(gridB, palette))))
  let tear = ''
  if (state === 'failed') {
    tear = el('g', { class: 'xx-tear' },
      el('rect', { x: 4, y: 7, width: 1, height: 1, fill: '#7ab8ff' }) +
      el('rect', { x: 11, y: 9, width: 1, height: 1, fill: '#7ab8ff' }))
  }
  const inner =
    el('g', { class: 'xx-fA' }, frameA + frameB) +
    el('g', { class: 'xx-fB' }, frameBounce) +
    tear
  const svg = el('svg', {
    class: 'xx-svg', viewBox: `0 0 ${grid[0].length} ${grid.length}`, width: '100%', height: '100%',
    'shape-rendering': 'crispEdges', xmlns: 'http://www.w3.org/2000/svg',
  }, inner)
  return { svg, traits: t }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { xxAnalyze, xxAvatarSVG }
