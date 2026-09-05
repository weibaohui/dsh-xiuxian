'use strict'

/**
 * Q 版形象引擎 v4 —— 像素风（拓麻歌子式）。
 * 每形态一张 16×16 字符画（'.'空 | o描边 b主体 l亮 d暗 h发 s肤 e眼 w高光 p腮红 a金 m嘴）。
 * 眨眼 = 开眼/闭眼双帧切换；配色仍由角色卡数据（名字/身份关键词）驱动。
 * kinds: humanoid(修士/女修/老者/孩童/僧人共用) | beast | bird | insect | ghost | puppet
 */

const KIND_RULES = [
  ['insect', /虫|蜈蚣|蚁|蛛|蛾|蝶|螳|蝉|蝎/],
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

/* ── 16×16 字符画模板 ──
   . 空  o 描边  b 主体  l 亮部  d 暗部  h 发/深  s 肤  e 眼  w 眼高光  p 腮红  a 金  m 嘴 */

const T_HUMANOID = [
  '......oooo......',
  '....oohhhhoo....',
  '...ohhhhhhhho...',
  '..ohhhhhhhhhho..',
  '..ohssssssssho..',
  '..ohswweswwsho..',
  '..ohseeeeeeesh..',
  '..ohspsmmsspho..',
  '..ohssssssssho..',
  '...oossssssoo...',
  '..oobbbbbbbboo..',
  '.osobbaaaaaabos.',
  '.osobbaaaaaabos.',
  '..oobbbbbbbboo..',
  '...oodbbbbdoo...',
  '...ood....doo...',
]

const T_BEAST = [
  '................',
  '..oo........oo..',
  '.ohho.....oohho.',
  '.ohhho...ohhho..',
  '..ohhooooohho...',
  '..ohhhhhhhhhho..',
  '.ohewhhhhewhho..',
  '.ohhhhhhhhdmho..',
  '.ohhhdmmmmmdho..',
  '..ohhhhhhhhho...',
  '..oohhhhhhho.oo.',
  '..ohhbbbbbbhho..',
  '.ohbbbbbbbbbbho.',
  '.obbbbbbbbbbbbo.',
  '.obdoobdoobdoob.',
  '..oo.oo..oo.oo..',
]

const T_BIRD = [
  '................',
  '......oooo......',
  '.....obbbo......',
  '....obbbbbo.....',
  '...obbbbbbo.....',
  '..ooewbbwbo.....',
  '..oaabbbbbo.....',
  '..oaabbbbbo.....',
  '...obbbbbbo.....',
  '....obbbbbo.....',
  '...obbllbbbo....',
  '..obbllllbbboo..',
  '.obbbllllbbboo..',
  '.obbbbbbbbbbo...',
  '..obbbbbbbbo....',
  '...oa.oo.ao.....',
]

const T_INSECT = [
  '..oa........oa..',
  '...oa......oa...',
  '....oaaaaaao....',
  '...oobbbbbboo...',
  '..oobebwwbeboo..',
  '..oobebwwbeboo..',
  '..oobbbbbbbboo..',
  '...oobbbbbboo...',
  '....oobbbboo....',
  '.....oobbboo....',
  '....oobbbbboo...',
  '..oobbbbbbbbbbo.',
  '.oobbdbbbbdbbbo.',
  '.oobbdbbbbdbbbo.',
  '..oobbbbbbbbboo.',
  '...oo.oooo.oo...',
]

const T_GHOST = [
  '....oooooooo....',
  '..oobbbbbbbboo..',
  '..obbwwbwwbbbo..',
  '.obbbeebbeebbbo.',
  '.obbbbbbbbbbbbo.',
  '.obbbbppppbbbbo.',
  '.obbbbbaabbbbbo.',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbbbbbbbbo..',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obbobbbbobbbbo.',
  '.obboobbbboobbo.',
  '..oo.oooo.oo....',
]

const T_PUPPET = [
  '..oooooooooooo..',
  '..obbbbbbbbbbo..',
  '..obbwwbbwwbbbo.',
  '..obeewweeeebbo.',
  '..obbbbbbbbbbo..',
  '..obbbaaaabbbbo.',
  '..oooooooooooo..',
  '.ooobbbbbbbbooo.',
  'obbbbbbbbbbbbbbo',
  'obbbbbbaabbbbbbo',
  'obbbbbbaabbbbbbo',
  '.oobbbbbbbbbboo.',
  '..oodbbbbbbdoo..',
  '..obbo....obbo..',
  '..obbo....obbo..',
  '..oooo....oooo..',
]

const TEMPLATES = {
  humanoid: T_HUMANOID,
  girl: T_HUMANOID,
  elder: T_HUMANOID,
  child: T_HUMANOID,
  monk: T_HUMANOID,
  cultivator: T_HUMANOID,
  beast: T_BEAST,
  bird: T_BIRD,
  insect: T_INSECT,
  ghost: T_GHOST,
  puppet: T_PUPPET,
}

/* 肤色行替换：人形把 'b'（头区）换肤色由模板 's' 已处理；此处仅提供色板 */
function paletteOf(t) {
  const { hue, sat, light } = t
  return {
    o: `hsl(${hue},${Math.max(sat - 12, 15)}%,${Math.max(light - 27, 12)}%)`,
    b: `hsl(${hue},${sat}%,${light}%)`,
    l: `hsl(${hue},${Math.max(sat - 6, 10)}%,${Math.min(light + 24, 93)}%)`,
    d: `hsl(${hue},${Math.max(sat - 6, 12)}%,${Math.max(light - 15, 14)}%)`,
    h: `hsl(${hue},${Math.max(sat - 10, 12)}%,${Math.max(light - 8, 18)}%)`,
    s: '#ffe9d6',
    e: '#241d18',
    w: '#ffffff',
    p: '#ff9d9d',
    a: '#e8c05a',
    m: '#6b4a3a',
  }
}

/** 字符画 → SVG rects（横向游程合并减少节点）。游离的 w（白）归回主体色。 */
function gridToRects(grid, palette) {
  const at = (x, y) => (grid[y] && grid[y][x]) || '.'
  const rects = []
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y]
    let x = 0
    while (x < row.length) {
      let ch = row[x]
      if (ch === '.') { x++; continue }
      // 白高光只允许紧贴眼黑；游离白点视为主体色
      if (ch === 'w' && !((at(x - 1, y) === 'e') || (at(x + 1, y) === 'e') || (at(x, y - 1) === 'e') || (at(x, y + 1) === 'e'))) {
        ch = 'b'
      }
      let run = 1
      while (x + run < row.length && row[x + run] === ch) run++
      const fill = palette[ch] || `hsl(${(ch.charCodeAt(0) * 7) % 360},60%,50%)`
      rects.push(el('rect', { x, y, width: run, height: 1, fill }))
      x += run
    }
  }
  return rects.join('')
}

/** 眨眼双帧：把模板中的 e/w 眼区替换为闭眼线。 */
function closedGrid(grid) {
  return grid.map((row) => row
    .replace(/[ew]/g, (ch) => (ch === 'w' ? '.' : 'o')))
}

function sparkRects(tier) {
  // 像素十字星光
  const plus = (x, y, c) => el('rect', { x, y, width: 1, height: 1, fill: c })
    + el('rect', { x: x - 1, y, width: 1, height: 1, fill: c })
    + el('rect', { x: x + 1, y, width: 1, height: 1, fill: c })
    + el('rect', { x, y: y - 1, width: 1, height: 1, fill: c })
    + el('rect', { x, y: y + 1, width: 1, height: 1, fill: c })
  const g1 = el('g', { class: 'xx-spark' }, plus(1, 5, '#ffe9a8'))
  const g2 = el('g', { class: 'xx-spark s2' }, plus(14, 3, '#ffe9a8'))
  return tier === 1 ? g1 + g2 + plus(13, 13, '#ffd97a') : g1 + g2
}

function el(tag, attrs, inner) {
  const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
  return `<${tag} ${a}>${inner || ''}</${tag}>`
}

function xxAvatarSVG(c) {
  const t = xxAnalyze(c)
  const palette = paletteOf(t)
  const grid = TEMPLATES[t.kind] || T_HUMANOID
  const open = gridToRects(grid, palette)
  const closed = gridToRects(closedGrid(grid), palette)
  const eyesOpen = grid.flatMap((row, y) => [...row].map((ch, x) => ({ ch, x, y })))
    .filter((p) => p.ch === 'e' || p.ch === 'w')
  void eyesOpen
  // 眨眼组：开眼帧（整帧）与闭眼帧（整帧）交替；此处简化为整帧替换
  const frameOpen = el('g', { class: 'xx-eo' }, open)
  const frameClosed = el('g', { class: 'xx-ec' }, gridToRects(closedGrid(grid), palette))
  void closed
  const inner = frameOpen + frameClosed + sparkRects(t.tier === 1 ? 1 : 0)
  const svg = el('svg', {
    class: 'xx-svg', viewBox: '0 0 16 16', width: '100%', height: '100%',
    'shape-rendering': 'crispEdges', xmlns: 'http://www.w3.org/2000/svg',
  }, inner)
  return { svg, traits: t }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { xxAnalyze, xxAvatarSVG }
