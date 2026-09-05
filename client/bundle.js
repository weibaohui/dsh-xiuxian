/* Generated from client/index.js by scripts/build-client.mjs — do not edit by hand.
 * Regenerate with: npm run build:client
 */
window.__ModuleLoader__.load({
  id: "@weibaohui/dsh-xiuxian",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
    var React = require("react")
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

    'use strict'

    /**
     * dsh-xiuxian — Client half（电子宠物版）
     *
     * 屏幕右下角趴一只 Q 版小灵宠：
     *   - 每个新会话随机唤醒一位《凡人修仙传》角色附体宠物（肚皮绣角色姓氏）
     *   - Tier1 主要角色：金圈光环 + ✨ + 👑
     *   - 点宠物：蹦一下 + 冒气泡说话；拖拽：挪窝
     *   - 气泡下方一排圆钮：🔄 换一位 / 💬 指点一二 / 📜 技能 / 📖 生平 / ✨ 话术 / 🧘 打坐
     *   - 打坐模式：闭眼入定，每 25 分钟催道友起身
     */

    const STYLE = `
    @keyframes xx-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes xx-blink{0%,91%,100%{transform:scaleY(1)}94%,97%{transform:scaleY(.06)}}
    @keyframes xx-hop{0%{transform:translateY(0) scale(1)}28%{transform:translateY(-16px) rotate(-7deg)}55%{transform:translateY(0) scaleY(.9)}75%{transform:translateY(-4px)}100%{transform:translateY(0) scale(1)}}
    @keyframes xx-pop{0%{transform:scale(.5) translateY(8px);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1) translateY(0);opacity:1}}
    @keyframes xx-zzz{0%{transform:translateY(0);opacity:0}30%{opacity:.9}100%{transform:translateY(-14px) translateX(6px);opacity:0}}
    @keyframes xx-breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(.99,1.03)}}
    @keyframes xx-wag{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(9deg)}}
    @keyframes xx-twinkle{0%,100%{opacity:.25;transform:scale(.7) rotate(0deg)}50%{opacity:1;transform:scale(1.2) rotate(22deg)}}
    @keyframes xx-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px) rotate(-5deg)}40%{transform:translateX(4px) rotate(5deg)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
    @keyframes xx-cast{0%{filter:none}40%{filter:drop-shadow(0 0 14px #ffd97a) brightness(1.25)}100%{filter:none}}
    @keyframes xx-svgaura{0%,100%{opacity:.5}50%{opacity:.85}}
    @keyframes xx-aura{0%,100%{opacity:.45;transform:translate(-50%,-50%) scale(1)}50%{opacity:.8;transform:translate(-50%,-50%) scale(1.08)}}
    .xx-eyes{transform-box:fill-box;transform-origin:center;animation:xx-blink 4.4s ease-in-out infinite}
    .xx-bodyG{transform-box:fill-box;transform-origin:50% 92%;animation:xx-breathe 2.6s ease-in-out infinite}
    .xx-tail{transform-box:fill-box;transform-origin:15% 85%;animation:xx-wag 2.1s ease-in-out infinite}
    .xx-spark{transform-box:fill-box;transform-origin:center;animation:xx-twinkle 1.8s ease-in-out infinite}
    .xx-spark.s2{animation-delay:.9s}
    .xx-svgAura{animation:xx-svgaura 3.2s ease-in-out infinite}
    .xx-av{position:absolute;left:50%;top:44px;transform:translateX(-50%);width:104px;height:104px}
    .xx-stage{position:fixed;right:30px;bottom:22px;z-index:1200;font:13px/1.6 "PingFang SC","Microsoft YaHei",sans-serif;user-select:none}
    .xx-pet{position:relative;width:104px;height:118px;cursor:grab;animation:xx-float 3.2s ease-in-out infinite}
    .xx-pet:active{cursor:grabbing}
    .xx-pet.xx-hop .xx-body{animation:xx-hop .62s ease}
    .xx-aura{position:absolute;left:50%;top:50%;width:86px;height:60px;transform:translate(-50%,-50%);
      border-radius:50%;filter:blur(9px);opacity:.5;animation:xx-aura 3.2s ease-in-out infinite}
    .xx-body{position:absolute;left:50%;top:44px;transform:translateX(-50%);width:78px;height:70px;
      border-radius:52% 52% 46% 46%;box-shadow:inset -6px -8px 12px rgba(0,0,0,.18),0 6px 14px rgba(0,0,0,.28)}
    .xx-eye{position:absolute;top:26px;width:11px;height:13px;background:#2b2320;border-radius:50%;
      animation:xx-blink 4.4s ease-in-out infinite}
    .xx-eye::after{content:"";position:absolute;left:2.5px;top:2px;width:4px;height:4px;background:#fff;border-radius:50%;opacity:.9}
    .xx-eye.l{left:22px}.xx-eye.r{right:22px}
    .xx-pet.xx-meditate .xx-eye{height:2.5px;top:32px;border-radius:2px;animation:none}
    .xx-blush{position:absolute;top:38px;width:8px;height:4.5px;background:#ff9d9d;border-radius:50%;opacity:.65}
    .xx-blush.l{left:15px}.xx-blush.r{right:15px}
    .xx-mouth{position:absolute;top:40px;left:50%;transform:translateX(-50%);width:12px;height:7px;
      border:2px solid #6b4a3a;border-top:none;border-radius:0 0 12px 12px}
    .xx-seal{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);width:24px;height:24px;
      background:radial-gradient(circle at 35% 30%,#ffe9a8,#d4a437);border:1.5px solid #a87f1f;border-radius:50%;
      color:#5b4208;font-size:13px;font-weight:700;line-height:22px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.3)}
    .xx-halo{position:absolute;left:50%;top:-4px;transform:translateX(-50%);font-size:15px;filter:drop-shadow(0 0 6px #ffd97a)}
    .xx-zzz{position:absolute;right:6px;top:2px;color:#bcd2ff;font-size:13px;font-weight:700;animation:xx-zzz 2.2s ease-out infinite}
    .xx-tier{position:absolute;left:0px;top:14px;font-size:13px;filter:drop-shadow(0 0 4px #ffd97a)}
    .xx-name{position:absolute;left:50%;bottom:-2px;transform:translateX(-50%);white-space:nowrap;
      color:#d4b06a;font-size:11px;text-shadow:0 1px 2px rgba(0,0,0,.6)}
    .xx-bubble{position:fixed;right:20px;bottom:150px;width:252px;background:#fffdf6;color:#3a332a;
      border:1.5px solid #d4b06a;border-radius:12px;padding:8px 10px 7px;z-index:1199;
      box-shadow:0 8px 22px rgba(0,0,0,.32);animation:xx-pop .28s ease;font-size:11.5px;line-height:1.55}
    .xx-bubble::after{content:"";position:absolute;right:34px;bottom:-9px;width:14px;height:14px;background:#fffdf6;
      border-right:2px solid #d4b06a;border-bottom:2px solid #d4b06a;transform:rotate(45deg)}
    .xx-btag{display:inline-block;background:#5a4a1e;color:#ffd97a;border-radius:7px;padding:0 7px;
      font-size:10px;margin-bottom:4px}
    .xx-btext{max-height:128px;overflow-y:auto;white-space:pre-wrap;font-size:11.5px;user-select:text}
    .xx-bnote{color:#a08c5a;font-size:10px;margin-top:4px}
    .xx-tools{display:flex;gap:4px;margin-top:6px;padding-top:5px;border-top:1px dashed #e3d5ae}
    .xx-tbtn{flex:1;background:#f4ead0;border:1px solid #e0cd96;border-radius:8px;color:#6b5a26;
      font-size:13px;line-height:1;padding:4px 0;cursor:pointer;text-align:center}
    .xx-tbtn:hover{background:#ffe9a8;transform:translateY(-1px)}
    .xx-tbtn.on{background:#d4b06a;color:#fff}
    .xx-al{display:flex;align-items:center;gap:6px;margin-top:5px;color:#a08c5a;font-size:10px}
    .xx-al input[type=range]{flex:1;height:3px;accent-color:#d4b06a;cursor:pointer}
    `

    function ensureStyle() {
      if (!document.getElementById('dsh-xiuxian-style')) {
        const tag = document.createElement('style')
        tag.id = 'dsh-xiuxian-style'
        tag.textContent = STYLE
        document.head.appendChild(tag)
      }
    }

    const TOOL_SPELL = [
      [/bash|shell|terminal/i, '御剑术', '剑光一闪，敕令已行——'],
      [/read|view/i, '天眼术', '灵光流转，玉简字字入识——'],
      [/write/i, '开炉铸器', '祭出丹炉，采八方灵材——'],
      [/edit|patch|multiedit/i, '重炼法器', '真火重熔器身，修补纹路——'],
      [/grep|search/i, '搜魂大法', '神识如潮，遍扫灵机脉络——'],
      [/glob|ls|find/i, '周天星斗大衍术', '星盘转动，推演万物方位——'],
      [/websearch|web_search/i, '神游太虚', '元神出窍，神游太虚之外——'],
      [/webfetch|fetch|reader/i, '摘星换月', '大袖一挥，摄天外灵物于掌中——'],
      [/task|agent/i, '身外化身', '掐诀分魂，遣化身携法宝而行——'],
      [/todo/i, '道纲排定', '刻道碑以定行止——'],
      [/skill/i, '施展神通', '法诀掐动，神通轰然而出——'],
      [/diagnostic|lsp/i, '诊脉术', '金针度穴，探查经脉暗伤——'],
      [/git/i, '刻碑术', '以岁月为凿，刻此一行进道碑——'],
    ]
    const spellOf = (tool) => {
      for (const [re, name, cast] of TOOL_SPELL) if (re.test(tool || '')) return { name, cast }
      return { name: '施展法术', cast: '法诀掐动，灵光乍现——' }
    }

    const api = (p) => fetch(`/dsh-xiuxian/api${p}`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })

    module.exports = {
      name: '@weibaohui/dsh-xiuxian',
      inject: ['slots'],

      apply(ctx) {
        const slots = ctx.get('slots')
        if (slots === undefined) return
        ensureStyle()

        function XiuxianPage() {
          const [cha, setCha] = React.useState(undefined)
          const [msg, setMsg] = React.useState(undefined)
          const [open, setOpen] = React.useState(false)
          const [meditate, setMeditate] = React.useState(false)
          const [hop, setHop] = React.useState(false)
          const [pos, setPos] = React.useState(undefined)
          const [drag, setDrag] = React.useState(undefined)
          const breakTimer = React.useRef(undefined)
          const hideTimer = React.useRef(undefined)
          const stageRef = React.useRef(undefined)
          const [linked, setLinked] = React.useState(true)   // 事件联动开关
          const lastId = React.useRef(0)
          const lastBubbleAt = React.useRef(0)
          const [fx, setFx] = React.useState('')             // 施法/受惊动画类
          const [alpha, setAlpha] = React.useState(() => {
            const v = parseFloat(localStorage.getItem('xx-alpha'))
            return Number.isFinite(v) ? Math.min(1, Math.max(0.35, v)) : 0.92
          })

          const say = (m, keepOpen) => {
            setMsg(m)
            setOpen(true)
            if (hideTimer.current) clearTimeout(hideTimer.current)
            if (!keepOpen) hideTimer.current = setTimeout(() => setOpen(false), 15000)
          }

          const greet = (c) => {
            const q = c.quotes && c.quotes.length ? c.quotes[Math.floor(Math.random() * c.quotes.length)] : ''
            say({ tag: `${c.name} 附体`, text: (c.identity ? c.identity + '\n\n' : '') + (q ? `“${q}”` : ''),
                  note: '点点我蹦跶～下面一排圆钮是法宝' })
          }

          const reroll = () => api('/roll').then((r) => { setCha(r.character); greet(r.character) })
            .catch(() => say({ tag: '哎呀', text: '连不上修仙服务了……' }))

          React.useEffect(() => {
            api('/roll').then((r) => setCha(r.character)).catch(() => {})
            return () => { if (breakTimer.current) clearTimeout(breakTimer.current) }
          }, [])

          const speak = () => {
            const qs = new URLSearchParams()
            if (cha) qs.set('name', cha.name)
            const evs = ['build', 'test', 'commit', 'push', 'merge', 'deploy', 'error', 'fix', 'refactor', 'install']
            qs.set('event', evs[Math.floor(Math.random() * evs.length)])
            qs.set('ok', Math.random() < 0.65 ? 'true' : 'false')
            api(`/narrate?${qs}`).then((r) => say({ tag: '修行实况', text: r.line }))
              .catch(() => say({ tag: '哎呀', text: '连不上修仙服务……' }))
          }

          const copyText = async (text, okNote) => {
            try { await navigator.clipboard.writeText(text); say({ tag: '法宝到手', text: okNote }) }
            catch { say({ tag: '哎呀', text: '剪贴板权限不给力……' }) }
          }
          const copySkill = () => {
            if (!cha) return
            fetch(`/dsh-xiuxian/api/skill?name=${encodeURIComponent(cha.name)}`)
              .then((r) => r.text()).then((t) => copyText(t, `「${cha.name}」的技能已进剪贴板——贴进会话即附体`))
          }
          const copyIncantation = () => {
            fetch('/dsh-xiuxian/api/incantation').then((r) => r.text())
              .then((t) => copyText(t, '话术已上身——贴进会话，agent 从此用法术腔干活'))
          }
          const showBio = () => {
            if (!cha) return
            say({ tag: `${cha.name} · 生平`, text: '玉简展开中……' }, true)
            fetch(`/dsh-xiuxian/api/bio?name=${encodeURIComponent(cha.name)}`)
              .then((r) => (r.ok ? r.text() : Promise.reject())).then((t) => setMsg((m) => ({ ...m, text: t })))
              .catch(() => setMsg((m) => ({ ...m, text: '（该角色暂无生平玉简）' })))
          }

          const toggleBreak = () => {
            if (meditate) {
              if (breakTimer.current) clearTimeout(breakTimer.current)
              setMeditate(false)
              say({ tag: '出定', text: '打坐结束，继续修行！' })
              return
            }
            const arm = () => {
              breakTimer.current = setTimeout(() => {
                say({ tag: '打坐周期', text: '闭关已满一炷香（25分钟），道友起身活动下周天，饮口灵茶～' })
                arm()
              }, 25 * 60 * 1000)
            }
            arm()
            setMeditate(true)
            say({ tag: '入定', text: `${cha ? cha.name : '灵宠'}盘坐运功……每 25 分钟提醒道友起身。` })
          }

          // ── 事件联动：不同消息类型 → 不同说话与动作 ──
          const flash = (cls) => {
            setFx(cls)
            setTimeout(() => setFx(''), 700)
          }
          const react = (ev) => {
            if (!linked || !cha) return
            const now = Date.now()
            const who = cha.name
            const subTag = ev.sub ? '（化身）' : ''
            switch (ev.kind) {
              case 'user_msg':
                flash('xx-hop')
                say({ tag: '道友发问', text: ev.text ? `“${ev.text}”\n\n${who}凝神细听……` : `${who}竖起了耳朵……` })
                break
              case 'tool_call': {
                if (now - lastBubbleAt.current < 900) { flash('xx-hop'); return }
                lastBubbleAt.current = now
                const sp = spellOf(ev.tool)
                flash('xx-cast')
                say({ tag: `${sp.name}${subTag}`, text: `${sp.cast}\n【${ev.tool}】${ev.arg || ''}` }, true)
                break
              }
              case 'tool_error':
                flash('xx-shake')
                say({ tag: '天劫雷音', text: `【${ev.tool || '法器'}】轰然炸响！道友莫慌，且看${who}如何补天。` })
                break
              case 'tool_ok':
                flash('xx-hop') // 不冒泡，避免刷屏
                break
              case 'assistant_msg':
                if (now - lastBubbleAt.current < 1200) return
                lastBubbleAt.current = now
                say({ tag: `${who} · 心声道${subTag}`, text: `“${ev.text}”` }, true)
                break
              case 'turn_end':
                flash('xx-hop')
                say({ tag: '功行圆满', text: `此局事了，道果+1。${who}满意地眯起了眼。` })
                break
              case 'turn_abort':
                say({ tag: '收势', text: '道友收了神通？也罢，张弛有道。' })
                break
            }
          }

          // 轮询事件流
          React.useEffect(() => {
            const tick = () => {
              if (document.visibilityState !== 'visible') return
              api(`/feed?after=${lastId.current}`).then((r) => {
                for (const ev of r.events || []) {
                  lastId.current = Math.max(lastId.current, ev.id)
                  react(ev)
                }
              }).catch(() => {})
            }
            const iv = setInterval(tick, 1600)
            return () => clearInterval(iv)
          })

          const petClick = () => {
            setHop(true)
            setTimeout(() => setHop(false), 660)
            if (open && msg) { setOpen(false); return }
            if (cha) greet(cha)
          }

          const onDown = (e) => {
            const box = stageRef.current.getBoundingClientRect()
            setDrag({ dx: e.clientX - box.left, dy: e.clientY - box.top, moved: false })
          }
          React.useEffect(() => {
            if (!drag) return
            const move = (e) => {
              setDrag((d) => ({ ...d, moved: true }))
              setPos({ x: e.clientX - drag.dx, y: e.clientY - drag.dy })
            }
            const up = () => setDrag(undefined)
            window.addEventListener('mousemove', move)
            window.addEventListener('mouseup', up)
            return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
          }, [drag])

          const av = cha ? xxAvatarSVG(cha) : undefined
          if (cha && av) { try { window.__xxKind = av.traits.kind } catch {} }

          const tools = [
            [linked ? '🎬' : '🎬', linked ? '联动开' : '联动关', () => setLinked((v) => !v), linked],
            ['🔄', '换一位', reroll, false],
            ['💬', '指点一二', speak, false],
            ['📜', '复制技能', copySkill, false],
            ['📖', '生平', showBio, false],
            ['✨', '话术上身', copyIncantation, false],
            [meditate ? '🌅' : '🧘', meditate ? '出定' : '打坐', toggleBreak, meditate],
          ]

          return React.createElement(React.Fragment, null,

            open && React.createElement('div', { className: 'xx-bubble', style: { opacity: alpha } },
              React.createElement('span', { className: 'xx-btag' }, msg.tag),
              React.createElement('div', { className: 'xx-btext' }, msg.text),
              msg.note && React.createElement('div', { className: 'xx-bnote' }, msg.note),
              React.createElement('div', { className: 'xx-tools' },
                tools.map(([icon, title, fn, on]) => React.createElement('button', {
                  key: title, className: 'xx-tbtn' + (on ? ' on' : ''), title, onClick: fn,
                }, icon))),
              React.createElement('div', { className: 'xx-al' },
                '透明度',
                React.createElement('input', {
                  type: 'range', min: 35, max: 100, value: Math.round(alpha * 100),
                  onInput: (e) => {
                    const v = Number(e.target.value) / 100
                    setAlpha(v)
                    try { localStorage.setItem('xx-alpha', String(v)) } catch {}
                  },
                }))),

            React.createElement('div', {
              ref: stageRef, className: 'xx-stage',
              style: Object.assign({ opacity: alpha }, pos ? { right: 'auto', bottom: 'auto', left: pos.x, top: pos.y } : {}),
            },
              React.createElement('div', {
                className: 'xx-pet' + (hop ? ' xx-hop' : '') + (meditate ? ' xx-meditate' : '') + (fx ? ` ${fx}` : ''),
                onMouseDown: onDown,
                onClick: () => { if (!drag || !drag.moved) petClick() },
                title: cha ? `${cha.name}（点我说话，拖我挪窝）` : '唤醒中…',
              },
                cha && React.createElement('div', {
                  className: 'xx-av',
                  dangerouslySetInnerHTML: { __html: av.svg },
                }),
                (cha && cha.tier === 1) && React.createElement('span', { className: 'xx-halo' }, '✨'),
                meditate && React.createElement('span', { className: 'xx-zzz' }, '〰'),
                (cha && cha.tier === 1) && React.createElement('span', { className: 'xx-tier' }, '👑'),
                cha && React.createElement('div', { className: 'xx-name' },
                  `${cha.name}${meditate ? ' · 打坐中' : ''}`)),
            ))
        }

        slots.inject('sidebar.footer.action', () => slots.register(
          {
            name: 'sidebar.footer.action',
            id: '@weibaohui/dsh-xiuxian',
            order: 99,
          },
          () => React.createElement(XiuxianPage, null)
        ))
      },
    }

    return module.exports
  }
})
