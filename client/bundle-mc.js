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

    'use strict'

    /**
     * dsh-xiuxian — Client half（群宠版）
     * 屏幕角落 1-3 只 Q 版像素灵宠同屏，订阅真实会话事件流：
     *   - 每个新会话随机组队（角色互不重复，主要角色权重高）
     *   - 事件到来时按各自人设轮流出招/说话：道友发问→施法→心声道→天劫雷音→功行圆满
     *   - 👥 按钮切换组队人数（1/2/3）；透明度滑杆；打坐周期
     */

    const STYLE = `
    @keyframes xx-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    @keyframes xx-eoblink{0%,88%,100%{opacity:1}92%,96%{opacity:0}}
    @keyframes xx-ecblink{0%,88%,100%{opacity:0}92%,96%{opacity:1}}
    @keyframes xx-hop{0%{transform:translateY(0)}30%{transform:translateY(-10px) rotate(-4deg)}60%{transform:translateY(0)}80%{transform:translateY(-3px)}100%{transform:translateY(0)}}
    @keyframes xx-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px) rotate(-3deg)}50%{transform:translateX(3px) rotate(3deg)}75%{transform:translateX(-2px)}}
    @keyframes xx-pop{0%{transform:scale(.7) translateY(6px);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1) translateY(0);opacity:1}}
    @keyframes xx-tearfall{0%{transform:translateY(0);opacity:1}100%{transform:translateY(5px);opacity:0}}
    @keyframes xx-zzz{0%{transform:translateY(0);opacity:0}30%{opacity:.9}100%{transform:translateY(-12px) translateX(5px);opacity:0}}
    .xx-stage{position:fixed;right:26px;bottom:18px;z-index:1200;display:flex;gap:4px;align-items:flex-end;
      font:13px/1.6 "PingFang SC","Microsoft YaHei",sans-serif;user-select:none}
    .xx-petwrap{width:calc(var(--xx-pet-size) * 1px);text-align:center;cursor:grab;animation:xx-float 3.4s ease-in-out infinite}
    .xx-petwrap:active{cursor:grabbing}
    .xx-petwrap:nth-child(2){animation-delay:.4s}
    .xx-petwrap:nth-child(3){animation-delay:.8s}
    .xx-av{width:calc(var(--xx-pet-size) * 1px - 2px);height:calc(var(--xx-pet-size) * 1px + 6px)}
    .xx-name{color:#d4b06a;font-size:12px;font-weight:600;text-shadow:0 1px 3px rgba(0,0,0,.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .xx-stage.xx-hop .xx-av{animation:xx-hop .6s ease}
    .xx-stage.xx-cast .xx-av{filter:drop-shadow(0 0 10px #ffd97a) brightness(1.2)}
    .xx-stage.xx-shake .xx-av{animation:xx-shake .5s ease}
    .xx-bubble{position:fixed;right:20px;bottom:158px;width:252px;background:#fffdf6;color:#3a332a;
      border:1.5px solid #d4b06a;border-radius:12px;padding:8px 10px 7px;z-index:1199;
      box-shadow:0 8px 22px rgba(0,0,0,.32);animation:xx-pop .26s ease;font-size:11.5px;line-height:1.55}
    .xx-bubble::after{content:"";position:absolute;right:40px;bottom:-8px;width:13px;height:13px;background:#fffdf6;
      border-right:1.5px solid #d4b06a;border-bottom:1.5px solid #d4b06a;transform:rotate(45deg)}
    .xx-btag{display:inline-block;background:#5a4a1e;color:#ffd97a;border-radius:7px;padding:0 7px;font-size:10px;margin-bottom:4px}
    .xx-btext{max-height:126px;overflow-y:auto;white-space:pre-wrap;font-size:11.5px;user-select:text}
    .xx-bnote{color:#a08c5a;font-size:10px;margin-top:4px}
    .xx-tools{display:flex;gap:4px;margin-top:6px;padding-top:5px;border-top:1px dashed #e3d5ae}
    .xx-tbtn{flex:1;background:#f4ead0;border:1px solid #e0cd96;border-radius:8px;color:#6b5a26;
      font-size:13px;line-height:1;padding:4px 0;cursor:pointer;text-align:center}
    .xx-tbtn:hover{background:#ffe9a8}
    .xx-tbtn.on{background:#d4b06a;color:#fff}
    .xx-al{display:flex;align-items:center;gap:6px;margin-top:5px;color:#a08c5a;font-size:10px}
    .xx-al input[type=range]{flex:1;height:3px;accent-color:#d4b06a;cursor:pointer}
    .xx-trigger{display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;
      color:#9db4cc;font:12px/1 "PingFang SC",sans-serif;padding:6px 8px;border-radius:6px}
    .xx-trigger:hover{background:#222c39;color:#d4b06a}
    `

    const STYLE_VER = 'v5'
    function ensureStyle() {
      const id = `dsh-xiuxian-style-${STYLE_VER}`
      if (!document.getElementById(id)) {
        document.querySelectorAll('style[id^="dsh-xiuxian-style"]').forEach((n) => n.remove())
        const tag = document.createElement('style')
        tag.id = id
        tag.textContent = STYLE
        document.head.appendChild(tag)
      }
    }

    const api = (p) => fetch(`/dsh-xiuxian/api${p}`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })

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
    const pickQuote = (c) => (c && c.quotes && c.quotes.length)
      ? c.quotes[Math.floor(Math.random() * c.quotes.length)] : ''

    module.exports = {
      name: '@weibaohui/dsh-xiuxian',
      inject: ['slots'],

      apply(ctx) {
        const slots = ctx.get('slots')
        if (slots === undefined) return
        ensureStyle()

        function XiuxianPage() {
          const [party, setParty] = React.useState([])          // 角色数组（1-3）
          const [size, setSize] = React.useState(() => {
            const v = Number(localStorage.getItem('xx-party'))
            return [1, 2, 3].includes(v) ? v : 1
          })
          const [msg, setMsg] = React.useState(undefined)
          const [open, setOpen] = React.useState(false)
          const [meditate, setMeditate] = React.useState(false)
          const [linked, setLinked] = React.useState(true)
          const [alpha, setAlpha] = React.useState(() => {
            const v = parseFloat(localStorage.getItem('xx-alpha'))
            return Number.isFinite(v) ? Math.min(1, Math.max(0.35, v)) : 0.92
          })
          const [petSize, setPetSize] = React.useState(() => {
            const v = Number(localStorage.getItem('xx-pet-size'))
            return Number.isFinite(v) ? Math.min(200, Math.max(64, v)) : 132
          })
          const [fx, setFx] = React.useState('')
          const [mood, setMood] = React.useState('idle')   // idle | working | failed | sleep
          const [pos, setPos] = React.useState(undefined)
          const [drag, setDrag] = React.useState(undefined)
          const breakTimer = React.useRef(undefined)
          const hideTimer = React.useRef(undefined)
          const stageRef = React.useRef(undefined)
          const lastId = React.useRef(0)
          const lastBubbleAt = React.useRef(0)
          const speaker = React.useRef(0)                        // 轮流出场的角色下标

          const say = (m, ttl) => {
            setMsg(m)
            setOpen(true)
            if (hideTimer.current) clearTimeout(hideTimer.current)
            if (ttl !== 0) hideTimer.current = setTimeout(() => setOpen(false), ttl || 12000)
          }
          const nextSpeaker = () => {
            speaker.current = party.length ? (speaker.current + 1) % party.length : 0
            return party[speaker.current]
          }

          const loadParty = (n) => api(`/party?n=${n}`).then((r) => {
            setParty(r.characters)
            speaker.current = 0
            return r.characters
          }).catch(() => [])

          React.useEffect(() => { loadParty(size) }, [size])
          React.useEffect(() => {
            try { localStorage.setItem('xx-party', String(size)) } catch {}
          }, [size])

          const greet = (chars) => {
            const c = chars[0]
            if (!c) return
            say({ tag: `${c.name} 等附体`, text: chars.map((x) => `【${x.name}】${x.identity.slice(0, 40)}`).join('\n'),
                  note: '点宠物蹦跶，圆钮是法宝，👥可增减队友' })
          }

          const reroll = () => loadParty(size).then((chars) => greet(chars))
            .catch(() => say({ tag: '哎呀', text: '连不上修仙服务……' }))

          // ── 事件联动：多角色按事件轮流出招/说话 ──
          const react = (ev) => {
            if (!linked || !party.length) return
            const now = Date.now()
            if (ev.kind === 'tool_call') {
              if (now - lastBubbleAt.current < 900) { setFx('xx-hop'); return }
              lastBubbleAt.current = now
              const sp = spellOf(ev.tool)
              flash('xx-cast')
              if (party.length > 1) {
                const lines = party.map((c) => `【${c.name}】${sp.cast}`).join('\n')
                say({ tag: `群起施法 · ${sp.name}${ev.sub ? '（化身）' : ''}`, text: lines + (ev.arg ? `\n▸ ${ev.arg}` : '') }, 6000)
              } else {
                const who = party[0]
                say({ tag: `${sp.name}`, text: `${sp.cast}\n【${ev.tool}】${ev.arg || ''}` }, 6000)
              }
              return
            }
            const c = nextSpeaker()
            if (!c) return
            const q = pickQuote(c)
            switch (ev.kind) {
              case 'user_msg':
                setFx('xx-hop')
                say({ tag: '道友发问', text: (ev.text ? `“${ev.text}”\n\n` : '') + `【${c.name}】凝神细听……` }, 5000)
                break
              case 'assistant_msg':
                if (now - lastBubbleAt.current < 1200) return
                lastBubbleAt.current = now
                say({ tag: `${c.name} · 心声道`, text: `“${ev.text}”` }, 7000)
                break
              case 'tool_error':
                setMood('failed')
                setFx('xx-shake')
                say({ tag: '天劫雷音', text: `【${ev.tool || '法器'}】轰然炸响！\n${q ? `“${q}”` : `${c.name}：道友莫慌，且看如何补天。`}` }, 7000)
                break
              case 'turn_end':
                setMood('idle')
                setFx('xx-hop')
                say({ tag: '功行圆满', text: `【${c.name}】此局事了，道果+1。${q ? `“${q}”` : ''}` }, 6000)
                break
              case 'turn_abort':
                setMood('idle')
                say({ tag: '收势', text: `【${c.name}】道友收了神通？张弛有道。` }, 5000)
                break
            }
          }

          React.useEffect(() => {
            const tick = () => {
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

          const copyText = async (text, okNote) => {
            try { await navigator.clipboard.writeText(text); say({ tag: '法宝到手', text: okNote }) }
            catch { say({ tag: '哎呀', text: '剪贴板权限不给力……' }) }
          }
          const copySkill = () => {
            const c = party[speaker.current] || party[0]
            if (!c) return
            fetch(`/dsh-xiuxian/api/skill?name=${encodeURIComponent(c.name)}`).then((r) => r.text())
              .then((txt) => copyText(txt, `「${c.name}」的技能已进剪贴板——贴进会话即附体`))
          }
          const copyIncantation = () => {
            fetch('/dsh-xiuxian/api/incantation').then((r) => r.text())
              .then((t) => copyText(t, '话术已上身——贴进会话，agent 从此用法术腔干活'))
          }
          const showBio = () => {
            const c = party[speaker.current] || party[0]
            if (!c) return
            say({ tag: `${c.name} · 生平`, text: '玉简展开中……' }, 0)
            fetch(`/dsh-xiuxian/api/bio?name=${encodeURIComponent(c.name)}`)
              .then((r) => (r.ok ? r.text() : Promise.reject())).then((t) => setMsg((m) => ({ ...m, text: t })))
              .catch(() => setMsg((m) => ({ ...m, text: '（暂无生平玉简）' })))
          }
          const toggleBreak = () => {
            if (meditate) {
              if (breakTimer.current) clearTimeout(breakTimer.current)
              setMeditate(false)
              setMood('idle')
              say({ tag: '出定', text: '众灵宠收功，继续修行！' })
              return
            }
            const arm = () => {
              breakTimer.current = setTimeout(() => {
                const c = party[Math.floor(Math.random() * (party.length || 1))]
                say({ tag: '打坐周期', text: `【${c ? c.name : '灵宠'}】闭关已满一炷香（25分钟），道友起身活动周天～` })
                arm()
              }, 25 * 60 * 1000)
            }
            arm()
            setMeditate(true)
            setMood('sleep')
            say({ tag: '入定', text: '众灵宠盘坐运功……每 25 分钟提醒道友起身。' })
          }

          const petClick = (i) => {
            setFx('xx-hop')
            setTimeout(() => setFx(''), 640)
            if (open && msg) { setOpen(false); return }
            const c = party[i]
            if (c) {
              speaker.current = i
              say({ tag: `${c.name} 附体`, text: (c.identity ? c.identity + '\n\n' : '') + (pickQuote(c) ? `“${pickQuote(c)}”` : '') })
            }
          }

          const onDown = (e) => {
            const box = stageRef.current.getBoundingClientRect()
            setDrag({ dx: e.clientX - box.left, dy: e.clientY - box.top, moved: false })
          }
          React.useEffect(() => {
            if (!drag) return
            const move = (e) => { setDrag((d) => ({ ...d, moved: true })); setPos({ x: e.clientX - drag.dx, y: e.clientY - drag.dy }) }
            const up = () => setDrag(undefined)
            window.addEventListener('mousemove', move)
            window.addEventListener('mouseup', up)
            return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
          }, [drag])

          const tools = [
            ['👥', `组队${size + 1 > 3 ? 1 : size + 1}`, () => setSize((s) => (s % 3) + 1), false],
            ['🔄', '重掷全队', reroll, false],
            ['💬', '指点一二', () => {
              const c = party[speaker.current] || party[0]
              if (!c) return
              const q = pickQuote(c)
              say({ tag: `【${c.name}】指点一二`, text: q ? `“${q}”` : `${c.name}沉吟片刻，暂无一语。` }, 8000)
            }, false],
            ['📜', '复制技能', copySkill, false],
            ['📖', '生平', showBio, false],
            ['✨', '话术上身', copyIncantation, false],
            [meditate ? '🌅' : '🧘', meditate ? '出定' : '打坐', toggleBreak, meditate],
          ]

          return React.createElement(React.Fragment, null,

            open && msg && React.createElement('div', { className: 'xx-bubble', style: { opacity: alpha } },
              React.createElement('span', { className: 'xx-btag' }, msg.tag),
              React.createElement('div', { className: 'xx-btext' }, msg.text),
              msg.note && React.createElement('div', { className: 'xx-bnote' }, msg.note),
              React.createElement('div', { className: 'xx-tools' },
                tools.map(([icon, title, fn, on]) => React.createElement('button', {
                  key: title, className: 'xx-tbtn' + (on ? ' on' : ''), title, onClick: fn,
                }, icon))),
              React.createElement('div', { className: 'xx-al' },
                '大小',
                React.createElement('input', {
                  type: 'range', min: 64, max: 200, value: petSize,
                  onInput: (e) => {
                    const v = Number(e.target.value)
                    setPetSize(v)
                    try { localStorage.setItem('xx-pet-size', String(v)) } catch {}
                  },
                }),
                petSize + 'px'),
              React.createElement('div', { className: 'xx-al' },
                '透明度',
                React.createElement('input', {
                  type: 'range', min: 35, max: 100, value: Math.round(alpha * 100),
                  onInput: (e) => {
                    const v = Math.min(1, Math.max(0.35, Number(e.target.value) / 100 || 0.92))
                    setAlpha(v)
                    try { localStorage.setItem('xx-alpha', String(v)) } catch {}
                  },
                }))),

            React.createElement('div', {
              ref: stageRef,
              className: `xx-stage${fx ? ' ' + fx : ''}${meditate ? ' xx-meditate' : ''}`,
              style: Object.assign({ '--xx-pet-size': petSize }, pos ? { right: 'auto', bottom: 'auto', left: pos.x, top: pos.y } : {}),
              onMouseDown: onDown,
            },
              party.map((c, i) => React.createElement('div', {
                key: c.name, className: 'xx-petwrap',
                onClick: () => petClick(i),
                title: `${c.name}（点我说话）`,
              },
                React.createElement('div', { className: 'xx-av', dangerouslySetInnerHTML: { __html: xxAvatarSVG(c, mood).svg } }),
                React.createElement('div', { className: 'xx-name' }, c.name + (meditate ? ' · 定' : '')))),
              !party.length && React.createElement('div', { className: 'xx-petwrap', onClick: reroll },
                React.createElement('div', { className: 'xx-av' }),
                React.createElement('div', { className: 'xx-name' }, '唤醒中…'))),
          )
        }

        slots.inject('sidebar.footer.action', () => slots.register(
          { name: 'sidebar.footer.action', id: '@weibaohui/dsh-xiuxian', order: 99 },
          () => React.createElement(XiuxianPage, null)
        ))
      },
    }

    return module.exports
  }
})
