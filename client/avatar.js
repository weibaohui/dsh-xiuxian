'use strict'

/**
 * Q 版形象引擎 v3 —— 多原型形态版。
 *   人形（修士/女修/老者/孩童/僧人）：头+袍+手+脚的站立小人
 *   妖兽：四足兽（横身+兽头+竖耳+摇尾）
 *   鸟禽：圆身+喙+翅膀+细腿（鹤/雕/鹰/凤…）
 *   灵虫：分节+触角+复眼+虫腿
 *   傀儡：方块关节人偶；鬼魂：漂浮波浪下摆
 * 每个形象仍由角色卡数据驱动：形态/配色/法宝/肚印。
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
  let kind = firstMatch(text, KIND_RULES) || 'cultivator'
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
    seal: (c.name || '仙')[0],
  }
}

function el(tag, attrs, ...children) {
  const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
  return `<${tag} ${a}>${children.join('') || ''}</${tag}>`
}

function accessorySVG(kind, outline) {
  const g = (inner) => el('g', { transform: 'translate(100 60) rotate(-14)' }, inner)
  const o = outline
  switch (kind) {
    case 'sword':
      return g(el('line', { x1: -9, y1: 14, x2: 9, y2: -14, stroke: '#e3e9f2', 'stroke-width': 4, 'stroke-linecap': 'round' })
        + el('line', { x1: -9, y1: 14, x2: 9, y2: -14, stroke: '#ffffff', 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: .8 })
        + el('line', { x1: -7, y1: 6, x2: -1, y2: 12, stroke: '#d4a437', 'stroke-width': 3.4, 'stroke-linecap': 'round' })
        + el('circle', { cx: -9, cy: 15, r: 2.2, fill: '#d4a437', stroke: o, 'stroke-width': 1 }))
    case 'gourd':
      return g(el('ellipse', { cx: 0, cy: 6, rx: 7.5, ry: 6.5, fill: '#c97f4a', stroke: o, 'stroke-width': 2 })
        + el('circle', { cx: 0, cy: -4, r: 4.6, fill: '#d98f58', stroke: o, 'stroke-width': 2 })
        + el('rect', { x: -1.6, y: -11, width: 3.2, height: 5, fill: '#8a5427' })
        + el('line', { x1: -6, y1: 0, x2: 6, y2: 0, stroke: '#f0d9a8', 'stroke-width': 1.8 }))
    case 'scroll':
      return g(el('rect', { x: -8, y: -11, width: 16, height: 22, rx: 2, fill: '#f2e7c9', stroke: o, 'stroke-width': 1.8 })
        + el('line', { x1: -4, y1: -4, x2: 4, y2: -4, stroke: '#a8926a', 'stroke-width': 1.3 })
        + el('line', { x1: -4, y1: 1, x2: 4, y2: 1, stroke: '#a8926a', 'stroke-width': 1.3 })
        + el('line', { x1: -4, y1: 6, x2: 4, y2: 6, stroke: '#a8926a', 'stroke-width': 1.3 })
        + el('rect', { x: -10, y: -13, width: 3.4, height: 26, rx: 1.6, fill: '#b48b3c' })
        + el('rect', { x: 6.6, y: -13, width: 3.4, height: 26, rx: 1.6, fill: '#b48b3c' }))
    case 'ring':
      return g(el('circle', { cx: 0, cy: 0, r: 9, fill: 'none', stroke: 'hsl(45,75%,60%)', 'stroke-width': 4 })
        + el('circle', { cx: 0, cy: 0, r: 9, fill: 'none', stroke: '#fff2c4', 'stroke-width': 1.4 })
        + el('circle', { cx: 0, cy: 0, r: 2.8, fill: '#ffe9a8', stroke: o, 'stroke-width': 1 }))
    case 'beads':
      return g([0, 7, 14, 21].map((y) => el('circle', { cx: 0, cy: y - 10, r: 3, fill: '#9a7a44', stroke: o, 'stroke-width': 1.2 })).join(''))
    case 'cauldron':
      return g(el('ellipse', { cx: 0, cy: 3, rx: 9.5, ry: 7, fill: '#62697a', stroke: o, 'stroke-width': 2 })
        + el('rect', { x: -7, y: -7.5, width: 14, height: 3.4, rx: 1.7, fill: '#4a4f5c' })
        + el('line', { x1: -5, y1: 9, x2: -7.5, y2: 14, stroke: '#4a4f5c', 'stroke-width': 2.2 })
        + el('line', { x1: 5, y1: 9, x2: 7.5, y2: 14, stroke: '#4a4f5c', 'stroke-width': 2.2 })
        + el('circle', { cx: -3, cy: -10, r: 2, fill: '#cfe0f2', opacity: .95 })
        + el('circle', { cx: 2, cy: -13, r: 2.6, fill: '#cfe0f2', opacity: .7 }))
    case 'banner':
      return g(el('line', { x1: -6, y1: 14, x2: -6, y2: -14, stroke: '#8a6f3c', 'stroke-width': 2.4 })
        + el('path', { d: 'M -6 -13 L 11 -8 L -6 -1 Z', fill: '#8a5566', stroke: o, 'stroke-width': 1.4 }))
    case 'bell':
      return g(el('path', { d: 'M -7 6 Q -7 -8 0 -8 Q 7 -8 7 6 Z', fill: '#e8c05a', stroke: o, 'stroke-width': 1.8 })
        + el('circle', { cx: 0, cy: 8, r: 2.2, fill: '#9a7a44' })
        + el('line', { x1: -7, y1: 5, x2: 7, y2: 5, stroke: '#9a7a44', 'stroke-width': 1.6 }))
    case 'fan':
      return g(el('path', { d: 'M -9 10 L 9 10 L 2 -11 Z', fill: '#f0e5c8', stroke: o, 'stroke-width': 1.6 })
        + el('line', { x1: -5, y1: 3, x2: 0, y2: -7, stroke: '#c9b684', 'stroke-width': 1.1 }))
    case 'flute':
      return g(el('line', { x1: -11, y1: 6, x2: 11, y2: -6, stroke: '#8a6242', 'stroke-width': 3.8, 'stroke-linecap': 'round' })
        + el('circle', { cx: 2, cy: 0, r: 1.2, fill: '#3a2f22' })
        + el('circle', { cx: 6, cy: -2.4, r: 1.2, fill: '#3a2f22' }))
    case 'blade':
      return g(el('path', { d: 'M -8 12 Q 2 4 10 -12 Q 11 -2 4 10 Z', fill: '#d4dbe4', stroke: o, 'stroke-width': 1.6 })
        + el('rect', { x: -10, y: 10, width: 5.4, height: 4.4, rx: 1.2, fill: '#d4a437' }))
    case 'brush':
      return g(el('line', { x1: -8, y1: 10, x2: 8, y2: -8, stroke: '#8a6242', 'stroke-width': 2.8, 'stroke-linecap': 'round' })
        + el('path', { d: 'M 8 -8 Q 13 -15 5 -14 Z', fill: '#4a4a58' }))
    case 'seal':
      return g(el('rect', { x: -7, y: -7, width: 14, height: 14, rx: 2.5, fill: '#d4604a', stroke: o, 'stroke-width': 1.8 })
        + el('rect', { x: -4, y: -4, width: 8, height: 8, rx: 1, fill: 'none', stroke: '#ffe9a8', 'stroke-width': 1.5 }))
    default:
      return g(el('text', { x: 0, y: 5, 'font-size': 14, 'text-anchor': 'middle' }, '✨'))
  }
}

/** 萌眼（双层高光 + 渐变虹膜 + 上眼睑）。 */
function eyesSVG(t, cx1, cx2, cy, rx, ry, U) {
  const o = t.outline
  const one = (x) =>
    el('ellipse', { cx: x, cy, rx, ry, fill: `url(#${U}-iris)` }) +
    el('ellipse', { cx: x, cy: cy + ry * 0.18, rx: rx * 0.7, ry: ry * 0.6, fill: '#241d18' }) +
    el('circle', { cx: x - rx * 0.34, cy: cy - ry * 0.34, r: rx * 0.46, fill: '#ffffff' }) +
    el('circle', { cx: x + rx * 0.32, cy: cy + ry * 0.3, r: rx * 0.2, fill: '#ffffff', opacity: .85 })
  return el('g', { class: 'xx-eyes' }, one(cx1) + one(cx2))
}

function blushSVG(x1, x2, cy) {
  return el('ellipse', { cx: x1, cy, rx: 4.6, ry: 2.7, fill: '#ff9d9d', opacity: .6 })
    + el('ellipse', { cx: x2, cy, rx: 4.6, ry: 2.7, fill: '#ff9d9d', opacity: .6 })
}

function mouthSVG(cx, cy, s = 1) {
  return el('path', { d: `M ${cx - 5 * s} ${cy} Q ${cx - 2.5 * s} ${cy + 3.6 * s} ${cx} ${cy} Q ${cx + 2.5 * s} ${cy + 3.6 * s} ${cx + 5 * s} ${cy}`,
    stroke: '#6b4a3a', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' })
}

function sealSVG(cx, cy, ch) {
  return el('circle', { cx, cy, r: 11, fill: '#f7d774', stroke: '#c9a02f', 'stroke-width': 1.6 })
    + el('text', { x: cx, y: cy + 5, 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: '#5b4208',
        'font-family': '"PingFang SC","Microsoft YaHei",sans-serif' }, ch)
}

function sparkSVG(x, y, s, cls) {
  return el('path', {
    class: `xx-spark ${cls}`,
    d: `M ${x} ${y - 5 * s} Q ${x + 1.2 * s} ${y - 1.2 * s} ${x + 5 * s} ${y} Q ${x + 1.2 * s} ${y + 1.2 * s} ${x} ${y + 5 * s} Q ${x - 1.2 * s} ${y + 1.2 * s} ${x - 5 * s} ${y} Q ${x - 1.2 * s} ${y - 1.2 * s} ${x} ${y - 5 * s} Z`,
    fill: '#ffe9a8', stroke: '#d4a437', 'stroke-width': .8,
  })
}

/* ── 原型：人形（修士/女修/老者/孩童/僧人 共用骨架，装饰区分）── */
function humanoidSVG(t, U) {
  const o = t.outline
  const skin = '#ffe9d6'
  const hair = t.dark ? `hsl(${t.hue},20%,70%)` : `hsl(${t.hue},${Math.max(t.sat - 10, 12)}%,${Math.max(t.light - 8, 18)}%)`
  const g = []
  // 袍子（A 型道袍）
  g.push(el('path', {
    d: 'M 44 72 L 76 72 Q 84 74 88 96 Q 90 112 82 114 L 38 114 Q 30 112 32 96 Q 36 74 44 72 Z',
    fill: `url(#${U}-bodyG)`, stroke: o, 'stroke-width': 3, 'stroke-linejoin': 'round',
  }))
  // 衣领交襟
  g.push(el('path', { d: 'M 52 72 L 60 84 L 68 72', fill: 'none', stroke: o, 'stroke-width': 2, 'stroke-linecap': 'round' }))
  // 腰带
  g.push(el('rect', { x: 42, y: 88, width: 36, height: 5.5, rx: 2.7, fill: '#d4a437', stroke: o, 'stroke-width': 1.2 }))
  // 手
  g.push(el('circle', { cx: 39, cy: 86, r: 5, fill: skin, stroke: o, 'stroke-width': 2 }))
  g.push(el('circle', { cx: 81, cy: 86, r: 5, fill: skin, stroke: o, 'stroke-width': 2 }))
  // 脚
  g.push(el('ellipse', { cx: 48, cy: 116, rx: 7.5, ry: 4.5, fill: main2(t), stroke: o, 'stroke-width': 2.2 }))
  g.push(el('ellipse', { cx: 72, cy: 116, rx: 7.5, ry: 4.5, fill: main2(t), stroke: o, 'stroke-width': 2.2 }))
  // 头（大头贴脸）
  g.push(el('circle', { cx: 60, cy: 40, r: 27, fill: skin, stroke: o, 'stroke-width': 3 }))
  // 发饰（按形态）
  if (t.kind === 'girl') {
    g.push(el('path', { d: 'M 34 36 Q 34 12 60 12 Q 86 12 86 36 Q 74 24 60 24 Q 46 24 34 36 Z', fill: hair, stroke: o, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }))
    g.push(el('circle', { cx: 29, cy: 26, r: 9, fill: hair, stroke: o, 'stroke-width': 2.2 }))
    g.push(el('circle', { cx: 91, cy: 26, r: 9, fill: hair, stroke: o, 'stroke-width': 2.2 }))
    g.push(el('circle', { cx: 91, cy: 18, r: 3.2, fill: '#ff9db8', stroke: o, 'stroke-width': 1 }))
    g.push(el('circle', { cx: 29, cy: 18, r: 3.2, fill: '#ff9db8', stroke: o, 'stroke-width': 1 }))
  } else if (t.kind === 'elder') {
    g.push(el('path', { d: 'M 35 34 Q 36 16 60 16 Q 84 16 85 34 Q 60 24 35 34 Z', fill: '#eceae4', stroke: o, 'stroke-width': 2 }))
    g.push(el('path', { d: 'M 46 58 Q 60 78 74 58 Q 74 74 60 76 Q 46 74 46 58 Z', fill: '#eceae4', stroke: o, 'stroke-width': 2 }))
  } else if (t.kind === 'monk') {
    g.push(el('circle', { cx: 50, cy: 24, r: 2.2, fill: '#8a5a3a' }))
    g.push(el('circle', { cx: 60, cy: 22, r: 2.2, fill: '#8a5a3a' }))
    g.push(el('circle', { cx: 70, cy: 24, r: 2.2, fill: '#8a5a3a' }))
    g.push(el('path', { d: 'M 44 74 L 60 84 L 76 74 L 76 96 L 44 96 Z', fill: `hsl(${t.hue},45%,34%)`, stroke: o, 'stroke-width': 1.6, opacity: .55 }))
  } else if (t.kind === 'child') {
    g.push(el('path', { class: 'xx-tail', d: 'M 60 12 Q 54 0 68 -2 Q 62 4 66 10 Z', fill: hair, stroke: o, 'stroke-width': 1.6 }))
    g.push(el('path', { d: 'M 36 34 Q 38 16 60 16 Q 82 16 84 34 Q 60 26 36 34 Z', fill: hair, stroke: o, 'stroke-width': 2.2 }))
  } else {
    // 修士：束发道髻
    g.push(el('circle', { cx: 60, cy: 12, r: 8.5, fill: hair, stroke: o, 'stroke-width': 2.4 }))
    g.push(el('rect', { x: 50, y: 6, width: 20, height: 4, rx: 2, fill: '#f0e5c8', stroke: o, 'stroke-width': 1.4 }))
    g.push(el('path', { d: 'M 35 32 Q 38 18 60 18 Q 82 18 85 32 Q 60 22 35 32 Z', fill: hair, stroke: o, 'stroke-width': 2.2 }))
  }
  // 脸（眼低宽）
  g.push(eyesSVG(t, 47, 73, 44, 6.6, 9, U))
  g.push(blushSVG(37, 83, 54))
  if (t.kind !== 'elder') g.push(mouthSVG(60, 60, .9))
  return el('g', { class: 'xx-bodyG' }, g.join(''))
}

function main2(t) {
  return `hsl(${t.hue},${t.sat}%,${t.light}%)`
}

/* ── 原型：四足妖兽 ── */
function beastSVG(t, U) {
  const o = t.outline
  const g = []
  // 尾巴（摇摆）
  g.push(el('path', { class: 'xx-tail', d: 'M 92 84 Q 114 78 110 52 Q 108 74 88 78 Z', fill: main2(t), stroke: o, 'stroke-width': 2.8, 'stroke-linejoin': 'round' }))
  // 四腿
  for (const x of [40, 56, 74, 88]) {
    g.push(el('rect', { x, y: 96, width: 10, height: 20, rx: 4.5, fill: main2(t), stroke: o, 'stroke-width': 2.4 }))
  }
  // 身体（横椭圆）
  g.push(el('ellipse', { cx: 64, cy: 82, rx: 34, ry: 23, fill: `url(#${U}-bodyG)`, stroke: o, 'stroke-width': 3 }))
  // 背部高光
  g.push(el('path', { d: 'M 44 68 Q 60 58 82 66 Q 66 64 52 74 Z', fill: `hsl(${t.hue},${Math.max(t.sat - 6, 10)}%,${Math.min(t.light + 22, 90)}%)`, opacity: .8 }))
  // 头（前上方）
  g.push(el('circle', { cx: 32, cy: 54, r: 21, fill: `url(#${U}-bodyG)`, stroke: o, 'stroke-width': 3 }))
  // 耳朵
  g.push(el('path', { d: 'M 18 42 Q 14 20 34 28 Q 24 30 24 42 Z', fill: main2(t), stroke: o, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }))
  g.push(el('path', { d: 'M 46 38 Q 48 16 30 24 Q 40 28 40 38 Z', fill: main2(t), stroke: o, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }))
  // 吻部
  g.push(el('ellipse', { cx: 24, cy: 60, rx: 9, ry: 6.5, fill: `hsl(${t.hue},${Math.max(t.sat - 6, 10)}%,${Math.min(t.light + 20, 90)}%)`, stroke: o, 'stroke-width': 1.8 }))
  g.push(el('ellipse', { cx: 21, cy: 57, rx: 2, ry: 1.6, fill: '#3a2f28' }))
  g.push(eyesSVG(t, 27, 41, 48, 4.4, 6, U))
  g.push(blushSVG(16, 44, 58))
  g.push(sealSVG(72, 84, t.seal))
  return el('g', { class: 'xx-bodyG' }, g.join(''))
}

/* ── 原型：鸟禽 ── */
function birdSVG(t, U) {
  const o = t.outline
  const g = []
  // 尾羽
  g.push(el('path', { d: 'M 88 78 L 114 66 L 112 80 L 116 88 L 90 90 Z', fill: `hsl(${t.hue},${t.sat}%,${Math.max(t.light - 14, 20)}%)`, stroke: o, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }))
  // 细腿
  g.push(el('line', { x1: 54, y1: 104, x2: 52, y2: 118, stroke: '#d4a437', 'stroke-width': 3, 'stroke-linecap': 'round' }))
  g.push(el('line', { x1: 68, y1: 104, x2: 70, y2: 118, stroke: '#d4a437', 'stroke-width': 3, 'stroke-linecap': 'round' }))
  g.push(el('path', { d: 'M 46 120 L 58 120 M 64 120 L 76 120', stroke: '#d4a437', 'stroke-width': 2.4, 'stroke-linecap': 'round' }))
  // 身体
  g.push(el('ellipse', { cx: 64, cy: 80, rx: 27, ry: 24, fill: `url(#${U}-bodyG)`, stroke: o, 'stroke-width': 3 }))
  // 折叠翅膀
  g.push(el('path', { d: 'M 76 66 Q 96 74 88 94 Q 84 80 72 74 Z', fill: `hsl(${t.hue},${t.sat}%,${Math.max(t.light - 12, 22)}%)`, stroke: o, 'stroke-width': 2, 'stroke-linejoin': 'round' }))
  // 头
  g.push(el('circle', { cx: 52, cy: 42, r: 20, fill: `url(#${U}-bodyG)`, stroke: o, 'stroke-width': 3 }))
  // 冠羽
  g.push(el('path', { class: 'xx-tail', d: 'M 50 24 Q 48 8 62 6 Q 54 12 58 22 Z', fill: `hsl(${t.hue},${t.sat}%,${Math.max(t.light - 12, 22)}%)`, stroke: o, 'stroke-width': 2 }))
  // 喙
  g.push(el('path', { d: 'M 32 42 L 16 48 L 33 53 Q 30 47 32 42 Z', fill: '#f0a03c', stroke: o, 'stroke-width': 2, 'stroke-linejoin': 'round' }))
  g.push(eyesSVG(t, 45, 61, 40, 5, 7, U))
  g.push(blushSVG(38, 68, 50))
  g.push(sealSVG(64, 86, t.seal))
  // 小翅膀尖在身前
  g.push(el('path', { d: 'M 50 74 Q 62 70 72 76 Q 60 82 48 78 Z', fill: `hsl(${t.hue},${t.sat}%,${Math.min(t.light + 16, 86)}%)`, stroke: o, 'stroke-width': 1.8 }))
  return el('g', { class: 'xx-bodyG' }, g.join(''))
}

/* ── 原型：灵虫 ── */
function insectSVG(t, U) {
  const o = t.outline
  const g = []
  // 虫腿
  for (const [x, y, rot] of [[38, 96, -30], [50, 102, -12], [70, 102, 12], [82, 96, 30]]) {
    g.push(el('line', { x1: x, y1: y, x2: x - 4, y2: y + 14, stroke: o, 'stroke-width': 2.6, 'stroke-linecap': 'round', transform: `rotate(${rot} ${x} ${y})` }))
  }
  // 分节腹部
  g.push(el('ellipse', { cx: 60, cy: 96, rx: 28, ry: 18, fill: `hsl(${t.hue},${t.sat}%,${Math.max(t.light - 14, 18)}%)`, stroke: o, 'stroke-width': 2.6 }))
  g.push(el('path', { d: 'M 36 92 Q 60 84 84 92', stroke: `hsl(${t.hue},${t.sat}%,${Math.min(t.light + 18, 82)}%)`, 'stroke-width': 1.6, fill: 'none' }))
  g.push(el('path', { d: 'M 38 102 Q 60 96 82 102', stroke: `hsl(${t.hue},${t.sat}%,${Math.min(t.light + 18, 82)}%)`, 'stroke-width': 1.4, fill: 'none', opacity: .7 }))
  // 头
  g.push(el('circle', { cx: 60, cy: 56, r: 32, fill: `url(#${U}-bodyG)`, stroke: o, 'stroke-width': 3 }))
  // 触角
  g.push(el('path', { d: 'M 44 30 Q 34 12 22 8', stroke: o, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }))
  g.push(el('path', { d: 'M 76 30 Q 86 12 98 8', stroke: o, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }))
  g.push(el('circle', { cx: 22, cy: 8, r: 3.6, fill: '#ffd97a', stroke: o, 'stroke-width': 1.2 }))
  g.push(el('circle', { cx: 98, cy: 8, r: 3.6, fill: '#ffd97a', stroke: o, 'stroke-width': 1.2 }))
  // 复眼
  g.push(eyesSVG(t, 44, 76, 52, 8, 11, U))
  g.push(mouthSVG(60, 68, .9))
  g.push(sealSVG(60, 96, t.seal))
  return el('g', { class: 'xx-bodyG' }, g.join(''))
}

/* ── 原型：鬼魂 ── */
function ghostSVG(t, U) {
  const o = t.outline
  const g = []
  g.push(el('path', {
    class: 'xx-bodyG',
    d: 'M 26 64 Q 26 20 60 20 Q 94 20 94 64 L 94 98 Q 87 90 79 98 Q 71 106 63 98 Q 55 90 47 98 Q 39 106 31 98 Q 28 95 26 98 Z',
    fill: `url(#${U}-bodyG)`, stroke: o, 'stroke-width': 3, 'stroke-linejoin': 'round', opacity: .92,
  }))
  g.push(eyesSVG(t, 45, 75, 54, 6.4, 9, U))
  g.push(blushSVG(33, 87, 66))
  g.push(mouthSVG(60, 68, .9))
  g.push(sealSVG(60, 88, t.seal))
  return el('g', { class: 'xx-bodyG' }, g.join(''))
}

/* ── 原型：傀儡（方块关节人偶）── */
function puppetSVG(t, U) {
  const o = t.outline
  const g = []
  // 四肢
  g.push(el('rect', { x: 22, y: 52, width: 12, height: 34, rx: 5, fill: main2(t), stroke: o, 'stroke-width': 2.4 }))
  g.push(el('rect', { x: 86, y: 52, width: 12, height: 34, rx: 5, fill: main2(t), stroke: o, 'stroke-width': 2.4 }))
  g.push(el('rect', { x: 42, y: 96, width: 14, height: 24, rx: 5, fill: main2(t), stroke: o, 'stroke-width': 2.4 }))
  g.push(el('rect', { x: 64, y: 96, width: 14, height: 24, rx: 5, fill: main2(t), stroke: o, 'stroke-width': 2.4 }))
  // 方形躯干
  g.push(el('rect', { x: 34, y: 56, width: 52, height: 44, rx: 10, fill: `url(#${U}-bodyG)`, stroke: o, 'stroke-width': 3 }))
  // 方头
  g.push(el('rect', { x: 32, y: 12, width: 56, height: 44, rx: 14, fill: `url(#${U}-bodyG)`, stroke: o, 'stroke-width': 3 }))
  // 铆钉关节
  for (const [x, y] of [[28, 50], [92, 50], [49, 92], [71, 92]]) {
    g.push(el('circle', { cx: x, cy: y, r: 2.6, fill: deep2(t) }))
  }
  g.push(eyesSVG(t, 47, 73, 32, 6, 8.5, U))
  g.push(mouthSVG(60, 46, .85))
  g.push(sealSVG(60, 78, t.seal))
  return el('g', { class: 'xx-bodyG' }, g.join(''))
}

function deep2(t) {
  return `hsl(${t.hue},${t.sat}%,${Math.max(t.light - 16, 14)}%)`
}

function xxAvatarSVG(c) {
  const t = xxAnalyze(c)
  let uid = 0
  for (const ch of String(c.name || '')) uid = (uid * 31 + ch.codePointAt(0)) % 9973
  const U = `xx${uid}`
  const { hue, sat, light } = t
  const main = `hsl(${hue},${sat}%,${light}%)`
  const lite = `hsl(${hue},${Math.max(sat - 6, 10)}%,${Math.min(light + 24, 93)}%)`
  const deep = `hsl(${hue},${Math.max(sat - 6, 12)}%,${Math.max(light - 15, 14)}%)`
  const outline = `hsl(${hue},${Math.max(sat - 12, 15)}%,${Math.max(light - 27, 12)}%)`
  t.outline = outline
  t.main = main

  const defs = el('defs', {},
    el('radialGradient', { id: `${U}-bodyG`, cx: '36%', cy: '28%', r: '82%' },
      el('stop', { offset: '0%', 'stop-color': lite }),
      el('stop', { offset: '55%', 'stop-color': main }),
      el('stop', { offset: '100%', 'stop-color': deep })),
    el('radialGradient', { id: `${U}-iris`, cx: '40%', cy: '26%', r: '80%' },
      el('stop', { offset: '0%', 'stop-color': lite }),
      el('stop', { offset: '100%', 'stop-color': `hsl(${hue},50%,${Math.max(light - 20, 16)}%)` })),
    el('radialGradient', { id: `${U}-ground`, cx: '50%', cy: '50%', r: '50%' },
      el('stop', { offset: '0%', 'stop-color': `hsla(${hue},40%,20%,.4)` }),
      el('stop', { offset: '100%', 'stop-color': `hsla(${hue},40%,20%,0)` })))

  const inner = [defs, el('ellipse', { class: 'xx-groundShadow', cx: 60, cy: 122, rx: 30, ry: 5.5, fill: `url(#${U}-ground)` })]

  let body
  switch (t.kind) {
    case 'beast': body = beastSVG(t, U); break
    case 'bird': body = birdSVG(t, U); break
    case 'insect': body = insectSVG(t, U); break
    case 'ghost': body = ghostSVG(t, U); break
    case 'puppet': body = puppetSVG(t, U); break
    default: body = humanoidSVG(t, U)
  }
  inner.push(body)

  if (t.horns) {
    inner.push(el('path', { d: 'M 40 22 Q 30 8 36 -4 Q 44 8 48 18 Z', fill: '#f2ecfa', stroke: outline, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }))
    inner.push(el('path', { d: 'M 80 22 Q 90 8 84 -4 Q 76 8 72 18 Z', fill: '#f2ecfa', stroke: outline, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }))
  }
  if (t.accessory) inner.push(accessorySVG(t.accessory, outline))

  inner.push(sparkSVG(10, 36, 1, ''))
  inner.push(sparkSVG(110, 28, 1.2, 's2'))
  if (t.tier === 1) inner.push(sparkSVG(106, 84, 0.9, 's2'))

  const svg = el('svg', {
    class: 'xx-svg', viewBox: '-4 -8 128 138', width: '100%', height: '100%',
    xmlns: 'http://www.w3.org/2000/svg',
  }, inner.join(''))
  return { svg, traits: t }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { xxAnalyze, xxAvatarSVG }
