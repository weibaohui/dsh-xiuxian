'use strict'

/**
 * Q 版形象引擎：从角色数据（name/alias/identity）提取特征，程序化生成专属 SVG 形象。
 *   xxAnalyze(c)  -> { kind, hue, sat, light, horns, dark, accessory }
 *   xxAvatarSVG(c) -> "<svg .../>" 字符串（内联进 .xx-pet 容器）
 *
 * 形态 kinds: insect 虫 | beast 兽 | puppet 傀儡 | ghost 鬼魂 | monk 僧人 |
 *             girl 女修 | child 孩童 | elder 老者 | cultivator 修士（默认）
 */

/* ---------- 关键词规则 ---------- */

const KIND_RULES = [
  ['insect', /虫|蜈蚣|蚁|蛛|蛾|蝶|螳|蝉|蝎/],
  ['beast', /兽|狼|狐|虎|豹|狮|鲸|蛟|龙|凤|雕|鹰|鹤|猿|猴|龟|鳖|蛇|蟒|熊|鹿|鼠|猫|鹏|鸦|鲲|貂|狈|獾|妖狐|灵宠/],
  ['puppet', /傀儡|人偶|木偶|机关/],
  ['ghost', /鬼灵|厉鬼|阴鬼|恶鬼|鬼卒|鬼修|亡魂|幽魂|魂体|阴灵|厉魄|冤魂|骷髅|僵尸/],
  ['monk', /僧|佛|和尚|老衲|禅师|罗汉|金刚|比丘|沙弥|菩萨|弥陀|菩提/],
  ['girl', /女|娘|妃|姬|仙子|夫人|娘子|嫂|婆|媳|姑|姨|妻|妇|嫔|媛|道姑|师姐|师妹|淑|婉|凝/],
  ['child', /童|孩|少年|幼|娃娃|小丫头|小子/],
  ['elder', /老|翁|公|叟|祖|长者|太上/],
]

const COLOR_RULES = [
  [/青/, 172, 62, 52], [/碧|翠/, 152, 58, 48], [/绿/, 125, 55, 46],
  [/紫/, 275, 52, 56], [/幽|冥/, 265, 38, 50],
  [/蓝/, 214, 60, 52], [/银/, 217, 18, 74],
  [/白|雪|霜/, 210, 16, 86],
  [/金|黄/, 45, 68, 56],
  [/橙|橘/, 28, 72, 56],
  [/粉|桃/, 330, 65, 70],
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
  for (const [val, re] of rules) {
    if (re.test(text)) return val
  }
  return undefined
}

/** 从角色数据提取形象特征。 */
function xxAnalyze(c) {
  const text = `${c.name || ''} ${c.alias || ''} ${c.identity || ''}`
  let kind = firstMatch(text, KIND_RULES) || 'cultivator'
  // 女修 vs 妖兽仲裁：文本带妖/兽/真身语境时兽形优先（如 银月=妖狼妃），否则女修形态（如 南宫婉=朱雀环女主）
  if (kind === 'beast' && /妃|姬|仙子|夫人|娘子|女修|道姑|师姐|师妹/.test(text) && !/妖|兽形|真身|原形|兽身/.test(text)) {
    kind = 'girl'
  }
  let hue = 160, sat = 60, light = 50
  for (const [re, h, s, l] of COLOR_RULES) {
    if (re.test(text)) { hue = h; sat = s; light = l; break }
  }
  if (hue === 160 && !/青|碧|绿/.test(text)) {
    // 无颜色关键词：名字哈希散列色相
    let n = 0
    for (const ch of String(c.name || '')) n = (n * 31 + ch.codePointAt(0)) % 360
    hue = n
  }
  const dark = DARK_RE.test(text)
  if (dark) { sat = Math.max(14, sat - 24); light = Math.min(36, light) }
  return {
    kind,
    hue, sat, light,
    horns: HORN_RE.test(text),
    dark,
    accessory: firstMatch(text, ACCESSORY_RULES),
    seal: (c.name || '仙')[0],
  }
}

/* ---------- SVG 组装 ---------- */

function el(tag, attrs, inner) {
  const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
  return `<${tag} ${a}>${inner || ''}</${tag}>`
}

/** 右侧手持法宝。 */
function accessorySVG(kind, hsl) {
  const g = (inner) => el('g', { transform: 'translate(97 58) rotate(-18)' }, inner)
  switch (kind) {
    case 'sword':
      return g(el('line', { x1: -9, y1: 14, x2: 9, y2: -14, stroke: '#d7e0ea', 'stroke-width': 3.6, 'stroke-linecap': 'round' })
        + el('line', { x1: -7, y1: 6, x2: -1, y2: 12, stroke: '#b48b3c', 'stroke-width': 3, 'stroke-linecap': 'round' })
        + el('circle', { cx: -9, cy: 15, r: 2, fill: '#b48b3c' }))
    case 'gourd':
      return g(el('circle', { cx: 0, cy: 6, r: 7.5, fill: '#b56a3a' })
        + el('circle', { cx: 0, cy: -4, r: 4.6, fill: '#c97f4a' })
        + el('rect', { x: -1.5, y: -11, width: 3, height: 5, fill: '#8a5427' })
        + el('line', { x1: -6, y1: 0, x2: 6, y2: 0, stroke: '#e8c98e', 'stroke-width': 1.6 }))
    case 'scroll':
      return g(el('rect', { x: -9, y: -12, width: 18, height: 24, rx: 2, fill: '#efe3c2', stroke: '#c9b684', 'stroke-width': 1.4 })
        + el('circle', { cx: 0, cy: -12, r: 3, fill: '#b48b3c' })
        + el('circle', { cx: 0, cy: 12, r: 3, fill: '#b48b3c' })
        + el('line', { x1: -5, y1: -4, x2: 5, y2: -4, stroke: '#a8926a', 'stroke-width': 1.2 })
        + el('line', { x1: -5, y1: 1, x2: 5, y2: 1, stroke: '#a8926a', 'stroke-width': 1.2 }))
    case 'ring':
      return g(el('circle', { cx: 0, cy: 0, r: 9, fill: 'none', stroke: `hsl(${hsl.hue},70%,60%)`, 'stroke-width': 3.4 })
        + el('circle', { cx: 0, cy: 0, r: 3, fill: '#ffe9a8' }))
    case 'beads':
      return g([0, 7, 14, 21].map((y) => el('circle', { cx: 0, cy: y - 10, r: 3, fill: '#8a6f3c' })).join(''))
    case 'cauldron':
      return g(el('ellipse', { cx: 0, cy: 2, rx: 9, ry: 6.5, fill: '#5a5f6b' })
        + el('rect', { x: -6, y: -7, width: 12, height: 3, rx: 1.5, fill: '#454a55' })
        + el('line', { x1: -5, y1: 8, x2: -7, y2: 13, stroke: '#454a55', 'stroke-width': 2 })
        + el('line', { x1: 5, y1: 8, x2: 7, y2: 13, stroke: '#454a55', 'stroke-width': 2 })
        + el('circle', { cx: 0, cy: -9, r: 2.4, fill: '#c7d5e8', opacity: .9 }))
    case 'banner':
      return g(el('line', { x1: -6, y1: 14, x2: -6, y2: -14, stroke: '#8a6f3c', 'stroke-width': 2.2 })
        + el('path', { d: 'M -6 -13 L 10 -9 L -6 -2 Z', fill: '#7a4a5a' }))
    case 'bell':
      return g(el('path', { d: 'M -7 6 Q -7 -8 0 -8 Q 7 -8 7 6 Z', fill: '#d4af3c' })
        + el('circle', { cx: 0, cy: 8, r: 2.2, fill: '#8a6f3c' }))
    case 'fan':
      return g(el('path', { d: 'M -9 10 L 9 10 L 2 -10 Z', fill: '#e8ddc0', stroke: '#c9b684', 'stroke-width': 1.2 }))
    case 'flute':
      return g(el('line', { x1: -11, y1: 6, x2: 11, y2: -6, stroke: '#7a5a3a', 'stroke-width': 3.4, 'stroke-linecap': 'round' })
        + el('circle', { cx: 2, cy: 0, r: 1.1, fill: '#3a2f22' })
        + el('circle', { cx: 6, cy: -2.4, r: 1.1, fill: '#3a2f22' }))
    case 'blade':
      return g(el('path', { d: 'M -8 12 Q 2 4 10 -12 Q 11 -2 4 10 Z', fill: '#c9d2dd' })
        + el('rect', { x: -10, y: 10, width: 5, height: 4, rx: 1, fill: '#b48b3c' }))
    case 'brush':
      return g(el('line', { x1: -8, y1: 10, x2: 8, y2: -8, stroke: '#7a5a3a', 'stroke-width': 2.6, 'stroke-linecap': 'round' })
        + el('path', { d: 'M 8 -8 Q 12 -14 6 -13 Z', fill: '#4a4a55' }))
    case 'seal':
      return g(el('rect', { x: -7, y: -7, width: 14, height: 14, rx: 2.5, fill: '#c9563c' })
        + el('rect', { x: -4, y: -4, width: 8, height: 8, rx: 1, fill: 'none', stroke: '#ffe9a8', 'stroke-width': 1.4 }))
    default:
      return g(el('text', { x: 0, y: 5, 'font-size': 14, 'text-anchor': 'middle' }, '✨'))
  }
}

/** 主体形象（按 kind 分形态）。返回 SVG 内层字符串。 */
function xxAvatarSVG(c) {
  const t = xxAnalyze(c)
  const { hue, sat, light } = t
  const main = `hsl(${hue},${sat}%,${light}%)`
  const lite = `hsl(${hue},${Math.max(sat - 8, 10)}%,${Math.min(light + 22, 92)}%)`
  const deep = `hsl(${hue},${sat}%,${Math.max(light - 16, 12)}%)`
  const eye = t.dark ? '#e8b0b0' : '#2b2320'
  const inner = []

  // 光晕
  inner.push(el('ellipse', { class: 'xx-svgAura', cx: 60, cy: 74, rx: 46, ry: 30, fill: `hsla(${hue},80%,60%,.5)` }))

  // 形态主体
  if (t.kind === 'insect') {
    inner.push(el('ellipse', { cx: 60, cy: 92, rx: 26, ry: 17, fill: deep }))
    inner.push(el('path', { d: 'M 38 92 Q 60 84 82 92', stroke: lite, 'stroke-width': 1.6, fill: 'none' }))
    inner.push(el('circle', { cx: 60, cy: 62, r: 33, fill: main }))
    inner.push(el('path', { d: 'M 42 34 Q 34 16 22 12', stroke: deep, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }))
    inner.push(el('path', { d: 'M 78 34 Q 86 16 98 12', stroke: deep, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }))
    inner.push(el('circle', { cx: 22, cy: 12, r: 3.4, fill: deep }))
    inner.push(el('circle', { cx: 98, cy: 12, r: 3.4, fill: deep }))
  } else if (t.kind === 'ghost') {
    inner.push(el('path', {
      d: 'M 24 66 Q 24 26 60 26 Q 96 26 96 66 L 96 96 Q 88 88 80 96 Q 72 104 64 96 Q 56 88 48 96 Q 40 104 32 96 Q 28 92 24 96 Z',
      fill: main, opacity: .88,
    }))
  } else if (t.kind === 'puppet') {
    inner.push(el('rect', { x: 27, y: 30, width: 66, height: 62, rx: 16, fill: main }))
    inner.push(el('circle', { cx: 33, cy: 36, r: 2.2, fill: deep }))
    inner.push(el('circle', { cx: 87, cy: 36, r: 2.2, fill: deep }))
    inner.push(el('circle', { cx: 33, cy: 86, r: 2.2, fill: deep }))
    inner.push(el('circle', { cx: 87, cy: 86, r: 2.2, fill: deep }))
    inner.push(el('line', { x1: 27, y1: 64, x2: 93, y2: 64, stroke: deep, 'stroke-width': 1.4, opacity: .6 }))
  } else {
    // 人形通用身体（含 beast/monk/girl/child/elder/cultivator）
    const rx = t.kind === 'child' ? 32 : 36
    const ry = t.kind === 'child' ? 30 : 34
    inner.push(el('ellipse', { cx: 60, cy: 70, rx, ry, fill: main }))
    inner.push(el('ellipse', { cx: 46, cy: 56, rx: 12, ry: 8, fill: lite, opacity: .5 }))

    if (t.kind === 'beast') {
      inner.push(el('path', { d: 'M 32 34 Q 30 12 46 22 Q 38 26 38 34 Z', fill: main }))
      inner.push(el('path', { d: 'M 88 34 Q 90 12 74 22 Q 82 26 82 34 Z', fill: main }))
      inner.push(el('path', { d: 'M 34 32 Q 33 18 44 24 Z', fill: lite }))
      inner.push(el('path', { d: 'M 86 32 Q 87 18 76 24 Z', fill: lite }))
    } else if (t.kind === 'girl') {
      inner.push(el('circle', { cx: 27, cy: 36, r: 10, fill: deep }))
      inner.push(el('circle', { cx: 93, cy: 36, r: 10, fill: deep }))
      inner.push(el('circle', { cx: 60, cy: 24, r: 11, fill: deep }))
      inner.push(el('circle', { cx: 60, cy: 15, r: 3.2, fill: '#ff9db8' }))
      inner.push(el('circle', { cx: 55, cy: 12, r: 2.6, fill: '#ff9db8' }))
      inner.push(el('circle', { cx: 65, cy: 12, r: 2.6, fill: '#ff9db8' }))
      inner.push(el('circle', { cx: 60, cy: 19, r: 2.2, fill: '#ffd97a' }))
    } else if (t.kind === 'elder') {
      inner.push(el('path', { d: 'M 30 42 Q 60 14 90 42 Q 60 30 30 42 Z', fill: '#e8e4da' }))
      inner.push(el('path', { d: 'M 46 78 Q 60 96 74 78 Q 74 92 60 94 Q 46 92 46 78 Z', fill: '#e8e4da' }))
    } else if (t.kind === 'child') {
      inner.push(el('path', { d: 'M 60 20 Q 56 8 66 6 Q 62 12 66 16 Z', fill: deep }))
    } else if (t.kind === 'monk') {
      inner.push(el('circle', { cx: 52, cy: 36, r: 1.8, fill: '#8a5a3a' }))
      inner.push(el('circle', { cx: 60, cy: 34, r: 1.8, fill: '#8a5a3a' }))
      inner.push(el('circle', { cx: 68, cy: 36, r: 1.8, fill: '#8a5a3a' }))
    } else {
      // 默认修士：一缕发髻
      inner.push(el('circle', { cx: 60, cy: 26, r: 7.5, fill: deep }))
      inner.push(el('rect', { x: 52, y: 20, width: 16, height: 3.4, rx: 1.7, fill: t.dark ? '#c9b684' : '#e8dcc0' }))
    }
  }

  if (t.kind === 'beast') {
    inner.push(el('ellipse', { cx: 60, cy: 76, rx: 11, ry: 8, fill: lite }))
    inner.push(el('circle', { cx: 60, cy: 73, r: 2.4, fill: '#3a2f28' }))
    inner.push(el('path', { d: 'M 56 80 Q 60 83 64 80', stroke: '#3a2f28', 'stroke-width': 1.4, fill: 'none', 'stroke-linecap': 'round' }))
  }

  // 眼睛
  const eyeY = t.kind === 'child' ? 64 : 60
  const eyeRx = t.kind === 'insect' ? 7 : 5.4
  const eyeRy = t.kind === 'insect' ? 9 : 6.6
  inner.push(el('g', { class: 'xx-eyes' },
    el('ellipse', { cx: 45, cy: eyeY, rx: eyeRx, ry: eyeRy, fill: eye }),
    el('ellipse', { cx: 75, cy: eyeY, rx: eyeRx, ry: eyeRy, fill: eye }),
    el('circle', { cx: 43.4, cy: eyeY - 2.6, r: 1.9, fill: '#fff', opacity: .92 }),
    el('circle', { cx: 73.4, cy: eyeY - 2.6, r: 1.9, fill: '#fff', opacity: .92 })))

  // 腮红
  inner.push(el('ellipse', { cx: 36, cy: 70, rx: 4.4, ry: 2.6, fill: '#ff9d9d', opacity: .6 }))
  inner.push(el('ellipse', { cx: 84, cy: 70, rx: 4.4, ry: 2.6, fill: '#ff9d9d', opacity: .6 }))

  // 嘴 / 老者胡须 / 妖兽牙
  if (t.kind === 'elder') {
    inner.push(el('path', { d: 'M 54 72 Q 60 76 66 72', stroke: '#6b4a3a', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }))
  } else if (t.kind === 'beast') {
    // 已有兽鼻嘴
  } else {
    inner.push(el('path', { d: 'M 54 72 Q 60 78 66 72', stroke: '#6b4a3a', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }))
  }

  // 佛门念珠
  if (t.kind === 'monk') {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (0.18 + 0.64 * (i / 6))
      inner.push(el('circle', { cx: 60 + 30 * Math.cos(a), cy: 74 + 20 * Math.sin(a), r: 2.4, fill: '#8a5a3a' }))
    }
  }

  // 肚印（姓氏）
  inner.push(el('circle', { cx: 60, cy: 90, r: 11, fill: '#f7d774', stroke: '#c9a02f', 'stroke-width': 1.4 }))
  inner.push(el('text', { x: 60, y: 95, 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: '#5b4208',
    'font-family': '"PingFang SC","Microsoft YaHei",sans-serif' }, t.seal))

  // 魔族犄角
  if (t.horns) {
    inner.push(el('path', { d: 'M 36 28 Q 28 14 34 4 Q 40 14 44 24 Z', fill: '#e8e0f0', stroke: '#9a8ab0', 'stroke-width': 1.2 }))
    inner.push(el('path', { d: 'M 84 28 Q 92 14 86 4 Q 80 14 76 24 Z', fill: '#e8e0f0', stroke: '#9a8ab0', 'stroke-width': 1.2 }))
  }

  // 手持法宝
  if (t.accessory) inner.push(accessorySVG(t.accessory, { hue, sat, light }))

  const body = el('svg', {
    class: 'xx-svg', viewBox: '0 0 120 120', width: '100%', height: '100%',
    xmlns: 'http://www.w3.org/2000/svg',
  }, inner.join(''))
  return { svg: body, traits: t }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { xxAnalyze, xxAvatarSVG }
