'use strict'

/**
 * Q 版形象引擎 v2（精美版）——按游戏萌系美术公式程序化生成 SVG：
 *   1. 二头身比例：大头圆身、梨形剪影、小爪子
 *   2. 眼睛大且低宽 + 双层高光 + 渐变虹膜 + 上眼睑
 *   3. 粗描边（比主体深的同色系）+ 赛璐璐分色（硬边高光/阴影块）
 *   4. 呼吸（挤压拉伸）、眨眼、兽耳摇尾、星光闪烁动画
 *   形态 kinds: insect 虫 | beast 兽 | puppet 傀儡 | ghost 鬼魂 | monk 僧人 |
 *               girl 女修 | child 孩童 | elder 老者 | cultivator 修士（默认）
 */

const KIND_RULES = [
  ['insect', /虫|蜈蚣|蚁|蛛|蛾|蝶|螳|蝉|蝎/],
  ['beast', /兽|狼|狐|虎|豹|狮|鲸|蛟|龙|凤|雕|鹰|鹤|猿|猴|龟|鳖|蛇|蟒|熊|鹿|鼠|猫|鹏|鸦|鲲|貂|獾/],
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
  if (kind === 'beast' && /妃|姬|仙子|夫人|娘子|女修|道姑|师姐|师妹/.test(text) && !/妖|兽形|真身|原形|兽身/.test(text)) {
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

/** 手持法宝（保留 v1 造型，统一描边色）。 */
function accessorySVG(kind, outline) {
  const g = (inner) => el('g', { transform: 'translate(99 56) rotate(-16)' }, inner)
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
      return g(el('circle', { cx: 0, cy: 0, r: 9, fill: 'none', stroke: `hsl(45,75%,60%)`, 'stroke-width': 4 })
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

/** 眼睛（萌系大眼 + 双层高光 + 渐变虹膜）。 */
function eyesSVG(t, cx1, cx2, cy, rx, ry, U) {
  const irisTop = `hsl(${t.hue}, ${Math.min(t.sat + 15, 90)}%, ${Math.max(t.light - 22, 14)}%)`
  const irisBot = `hsl(${(t.hue + 30) % 360}, 55%, 40%)`
  const o = t.outline
  const one = (x) =>
    el('ellipse', { cx: x, cy, rx, ry, fill: `url(#${U}-iris)` }) +
    el('ellipse', { cx: x, cy: cy + ry * 0.18, rx: rx * 0.72, ry: ry * 0.62, fill: '#241d18' }) +
    el('circle', { cx: x - rx * 0.34, cy: cy - ry * 0.34, r: rx * 0.44, fill: '#ffffff' }) +
    el('circle', { cx: x + rx * 0.3, cy: cy + ry * 0.3, r: rx * 0.2, fill: '#ffffff', opacity: .85 }) +
    el('path', { d: `M ${x - rx - 1.4} ${cy - ry * 0.72} Q ${x} ${cy - ry - 2.6} ${x + rx + 1.4} ${cy - ry * 0.72}`, stroke: o, 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' })
  return el('g', { class: 'xx-eyes' }, one(cx1) + one(cx2))
}

/** ω 猫嘴。 */
function mouthSVG(cx, cy, s = 1) {
  return el('path', { d: `M ${cx - 5 * s} ${cy} Q ${cx - 2.5 * s} ${cy + 3.6 * s} ${cx} ${cy} Q ${cx + 2.5 * s} ${cy + 3.6 * s} ${cx + 5 * s} ${cy}`,
    stroke: '#6b4a3a', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' })
}

/** 主体形象。 */
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

  const defs =
    el('defs', {},
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

  const inner = [defs]

  // 接地阴影
  inner.push(el('ellipse', { class: 'xx-groundShadow', cx: 60, cy: 121, rx: 30, ry: 5.5, fill: `url(#${U}-ground)` }))

  // 兽尾（兽形专属，身后摇摆）
  if (t.kind === 'beast') {
    inner.push(el('path', { class: 'xx-tail', d: 'M 88 96 Q 110 88 106 64 Q 104 82 86 88 Z', fill: main, stroke: outline, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }))
  }

  // 鬼魂：波浪下摆半透明体
  if (t.kind === 'ghost') {
    inner.push(el('path', {
      class: 'xx-bodyG',
      d: 'M 26 64 Q 26 20 60 20 Q 94 20 94 64 L 94 98 Q 87 90 79 98 Q 71 106 63 98 Q 55 90 47 98 Q 39 106 31 98 Q 28 95 26 98 Z',
      fill: `url(#${U}-bodyG)`, stroke: outline, 'stroke-width': 3, 'stroke-linejoin': 'round', opacity: .92,
    }))
  } else if (t.kind === 'insect') {
    // 灵虫：分节腹部 + 圆头
    inner.push(el('g', { class: 'xx-bodyG' },
      el('ellipse', { cx: 60, cy: 94, rx: 27, ry: 18, fill: deep, stroke: outline, 'stroke-width': 2.6 }),
      el('path', { d: 'M 36 90 Q 60 82 84 90', stroke: lite, 'stroke-width': 1.6, fill: 'none' }),
      el('path', { d: 'M 38 100 Q 60 94 82 100', stroke: lite, 'stroke-width': 1.4, fill: 'none', opacity: .7 }),
      el('circle', { cx: 60, cy: 58, r: 34, fill: `url(#${U}-bodyG)`, stroke: outline, 'stroke-width': 3 })))
  } else if (t.kind === 'puppet') {
    inner.push(el('g', { class: 'xx-bodyG' },
      el('rect', { x: 26, y: 26, width: 68, height: 70, rx: 18, fill: `url(#${U}-bodyG)`, stroke: outline, 'stroke-width': 3 }),
      el('line', { x1: 30, y1: 66, x2: 90, y2: 66, stroke: deep, 'stroke-width': 1.6, opacity: .7 }),
      el('circle', { cx: 34, cy: 34, r: 2.2, fill: deep }),
      el('circle', { cx: 86, cy: 34, r: 2.2, fill: deep }),
      el('circle', { cx: 34, cy: 88, r: 2.2, fill: deep }),
      el('circle', { cx: 86, cy: 88, r: 2.2, fill: deep })))
  } else {
    // 人形：梨形二头身
    inner.push(el('g', { class: 'xx-bodyG' },
      el('path', {
        d: 'M 60 18 C 90 18 99 44 97 70 C 95 98 82 108 60 108 C 38 108 25 98 23 70 C 21 44 30 18 60 18 Z',
        fill: `url(#${U}-bodyG)`, stroke: outline, 'stroke-width': 3.2, 'stroke-linejoin': 'round',
      }),
      // 赛璐璐：右上高光块 + 左下暗带（硬边）
      el('path', { d: 'M 40 30 Q 48 22 62 22 Q 54 32 50 44 Q 42 40 40 30 Z', fill: lite, opacity: .8 }),
      el('path', { d: 'M 84 78 Q 82 96 68 103 Q 78 88 78 72 Z', fill: deep, opacity: .45 }),
      el('ellipse', { cx: 60, cy: 90, rx: 18, ry: 13, fill: lite, opacity: .35 })))
    // 小爪子
    inner.push(el('ellipse', { cx: 44, cy: 104, rx: 7.5, ry: 5.2, fill: main, stroke: outline, 'stroke-width': 2.4 }))
    inner.push(el('ellipse', { cx: 76, cy: 104, rx: 7.5, ry: 5.2, fill: main, stroke: outline, 'stroke-width': 2.4 }))
  }

  // ── 头部装饰（按形态）──
  if (t.kind === 'beast') {
    inner.push(el('path', { d: 'M 33 34 Q 28 8 50 18 Q 40 22 39 34 Z', fill: main, stroke: outline, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }))
    inner.push(el('path', { d: 'M 87 34 Q 92 8 70 18 Q 80 22 81 34 Z', fill: main, stroke: outline, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }))
    inner.push(el('path', { d: 'M 35 30 Q 33 16 45 21 Z', fill: '#ffb8c8', opacity: .8 }))
    inner.push(el('path', { d: 'M 85 30 Q 87 16 75 21 Z', fill: '#ffb8c8', opacity: .8 }))
  } else if (t.kind === 'girl') {
    inner.push(el('circle', { cx: 26, cy: 32, r: 11, fill: deep, stroke: outline, 'stroke-width': 2.2 }))
    inner.push(el('circle', { cx: 94, cy: 32, r: 11, fill: deep, stroke: outline, 'stroke-width': 2.2 }))
    inner.push(el('circle', { cx: 60, cy: 20, r: 12, fill: deep, stroke: outline, 'stroke-width': 2.2 }))
    inner.push(el('circle', { cx: 60, cy: 12, r: 3.4, fill: '#ff9db8', stroke: outline, 'stroke-width': 1 }))
    inner.push(el('circle', { cx: 54, cy: 9, r: 2.8, fill: '#ffb8c8' }))
    inner.push(el('circle', { cx: 66, cy: 9, r: 2.8, fill: '#ffb8c8' }))
    inner.push(el('circle', { cx: 60, cy: 17, r: 2.2, fill: '#ffd97a', stroke: '#d4a437', 'stroke-width': .8 }))
  } else if (t.kind === 'elder') {
    inner.push(el('path', { d: 'M 32 40 Q 60 12 88 40 Q 60 28 32 40 Z', fill: '#eceae4', stroke: outline, 'stroke-width': 2 }))
    inner.push(el('path', { d: 'M 44 80 Q 60 100 76 80 Q 76 96 60 98 Q 44 96 44 80 Z', fill: '#eceae4', stroke: outline, 'stroke-width': 2 }))
  } else if (t.kind === 'child') {
    inner.push(el('path', { class: 'xx-tail', d: 'M 60 16 Q 54 4 68 2 Q 62 8 66 14 Z', fill: deep, stroke: outline, 'stroke-width': 1.6 }))
  } else if (t.kind === 'monk') {
    inner.push(el('circle', { cx: 51, cy: 30, r: 2, fill: '#8a5a3a' }))
    inner.push(el('circle', { cx: 60, cy: 28, r: 2, fill: '#8a5a3a' }))
    inner.push(el('circle', { cx: 69, cy: 30, r: 2, fill: '#8a5a3a' }))
  } else if (t.kind === 'cultivator') {
    inner.push(el('circle', { cx: 60, cy: 20, r: 8, fill: deep, stroke: outline, 'stroke-width': 2 }))
    inner.push(el('rect', { x: 51, y: 13, width: 18, height: 3.6, rx: 1.8, fill: t.dark ? '#c9b684' : '#f0e5c8', stroke: outline, 'stroke-width': 1.2 }))
  }

  // 魔族犄角
  if (t.horns) {
    inner.push(el('path', { d: 'M 36 26 Q 26 12 32 0 Q 40 12 44 22 Z', fill: '#efe8f8', stroke: outline, 'stroke-width': 2, 'stroke-linejoin': 'round' }))
    inner.push(el('path', { d: 'M 84 26 Q 94 12 88 0 Q 80 12 76 22 Z', fill: '#efe8f8', stroke: outline, 'stroke-width': 2, 'stroke-linejoin': 'round' }))
  }

  // 脸：眼睛低宽、腮红、ω嘴
  if (t.kind === 'insect') {
    inner.push(eyesSVG(t, 44, 76, 56, 7.5, 10.5, U))
  } else {
    inner.push(eyesSVG(t, 43, 77, 58, 7, 10, U))
  }
  inner.push(el('ellipse', { cx: 31, cy: 70, rx: 5, ry: 3, fill: '#ff9d9d', opacity: .65 }))
  inner.push(el('ellipse', { cx: 89, cy: 70, rx: 5, ry: 3, fill: '#ff9d9d', opacity: .65 }))
  if (t.kind !== 'beast') {
    inner.push(mouthSVG(60, t.kind === 'elder' ? 76 : 75, 1))
  }
  if (t.kind === 'beast') {
    inner.push(el('ellipse', { cx: 60, cy: 74, rx: 11, ry: 8, fill: lite, stroke: outline, 'stroke-width': 1.6 }))
    inner.push(el('ellipse', { cx: 60, cy: 71, rx: 3, ry: 2.2, fill: '#3a2f28' }))
    inner.push(mouthSVG(60, 77, .8))
  }

  // 僧人念珠
  if (t.kind === 'monk') {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (0.16 + 0.68 * (i / 6))
      inner.push(el('circle', { cx: 60 + 30 * Math.cos(a), cy: 78 + 20 * Math.sin(a), r: 2.5, fill: '#9a7a44', stroke: outline, 'stroke-width': 1 }))
    }
  }

  // 肚印
  if (t.kind !== 'ghost') {
    inner.push(el('circle', { cx: 60, cy: 90, r: 11.5, fill: '#f7d774', stroke: '#c9a02f', 'stroke-width': 1.6 }))
    inner.push(el('text', { x: 60, y: 95, 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: '#5b4208',
      'font-family': '"PingFang SC","Microsoft YaHei",sans-serif' }, t.seal))
  }

  // 魔角（画在最上层）
  if (t.horns) {
    inner.push(el('path', { d: 'M 36 24 Q 26 10 32 -2 Q 40 10 44 20 Z', fill: '#f2ecfa', stroke: outline, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }))
    inner.push(el('path', { d: 'M 84 24 Q 94 10 88 -2 Q 80 10 76 20 Z', fill: '#f2ecfa', stroke: outline, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }))
  }

  // 手持法宝
  if (t.accessory) inner.push(accessorySVG(t.accessory, outline))

  // 星光（Tier1 更亮更多）
  const spark = (x, y, s, cls) => el('path', {
    class: `xx-spark ${cls}`, d: `M ${x} ${y - 5 * s} Q ${x + 1.2 * s} ${y - 1.2 * s} ${x + 5 * s} ${y} Q ${x + 1.2 * s} ${y + 1.2 * s} ${x} ${y + 5 * s} Q ${x - 1.2 * s} ${y + 1.2 * s} ${x - 5 * s} ${y} Q ${x - 1.2 * s} ${y - 1.2 * s} ${x} ${y - 5 * s} Z`,
    fill: '#ffe9a8', stroke: '#d4a437', 'stroke-width': .8,
  })
  inner.push(spark(12, 34, 1, ''))
  inner.push(spark(108, 26, 1.2, 's2'))
  if (t.tier === 1) inner.push(spark(104, 78, 0.9, 's2'))

  const svg = el('svg', {
    class: 'xx-svg', viewBox: '-4 -6 128 134', width: '100%', height: '100%',
    xmlns: 'http://www.w3.org/2000/svg',
  }, inner.join(''))
  return { svg, traits: t }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { xxAnalyze, xxAvatarSVG }
