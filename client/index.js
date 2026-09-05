'use strict'

/**
 * dsh-xiuxian — Client half（v0.9 对话/控制剥离版）
 *  - 对话气泡 = 纯游戏对话框（角色名 + 文字，自动消散，无按钮）
 *  - 全部功能移入宠物右键菜单
 *  - 储物袋：收入的角色持久化；显示模式三选：随机 / 储物袋随机 / 固定
 */

const STYLE = `
@keyframes xx-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes xx-eoblink{0%,88%,100%{opacity:1}92%,96%{opacity:0}}
@keyframes xx-ecblink{0%,88%,100%{opacity:0}92%,96%{opacity:1}}
@keyframes xx-hop{0%{transform:translateY(0)}30%{transform:translateY(-10px) rotate(-4deg)}60%{transform:translateY(0)}80%{transform:translateY(-3px)}100%{transform:translateY(0)}}
@keyframes xx-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px) rotate(-3deg)}50%{transform:translateX(3px) rotate(3deg)}75%{transform:translateX(-2px)}}
@keyframes xx-pop{0%{transform:scale(.85) translateY(6px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}
@keyframes xx-zzz{0%{transform:translateY(0);opacity:0}30%{opacity:.9}100%{transform:translateY(-12px) translateX(5px);opacity:0}}
@keyframes xx-tearfall{0%{transform:translateY(0);opacity:1}100%{transform:translateY(5px);opacity:0}}
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
/* 游戏对话框：仅名字+文字 */
.xx-bubble{position:fixed;right:20px;bottom:196px;min-width:210px;max-width:300px;background:rgba(16,20,28,.94);
  color:#e8e2d0;border:1.5px solid #d4b06a;border-radius:4px 12px 12px 12px;padding:10px 13px 9px;z-index:1199;
  box-shadow:0 8px 26px rgba(0,0,0,.5);animation:xx-pop .22s ease;font-size:12.5px;line-height:1.7;user-select:text}
.xx-bubble::after{content:"";position:absolute;right:36px;bottom:-8px;width:13px;height:13px;background:rgba(16,20,28,.94);
  border-right:1.5px solid #d4b06a;border-bottom:1.5px solid #d4b06a;transform:rotate(45deg)}
.xx-who{color:#d4b06a;font-weight:700;font-size:12.5px;margin-bottom:3px;letter-spacing:1px}
.xx-btext{max-height:150px;overflow-y:auto;white-space:pre-wrap}
.xx-bnote{color:#8a7c52;font-size:10px;margin-top:4px}
/* 右键菜单 */
.xx-menu{position:fixed;z-index:1250;width:196px;background:#161c26;border:1px solid #3a4656;border-radius:10px;
  box-shadow:0 10px 32px rgba(0,0,0,.55);padding:5px;font:12.5px/1.5 "PingFang SC",sans-serif;color:#d8dee6;animation:xx-pop .16s ease}
.xx-mi{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;cursor:pointer;white-space:nowrap}
.xx-mi:hover{background:#26303e;color:#d4b06a}
.xx-mi .xx-ck{width:14px;text-align:center;color:#d4b06a}
.xx-msep{height:1px;background:#2a3441;margin:4px 6px}
.xx-mtitle{padding:5px 10px 2px;color:#5a6678;font-size:10.5px}
.xx-al{display:flex;align-items:center;gap:6px;margin:4px 8px 2px;color:#8a94a0;font-size:10.5px}
.xx-al input[type=range]{flex:1;height:3px;accent-color:#d4b06a;cursor:pointer}
/* 图鉴选宠面板 */
.xx-dex{position:fixed;inset:0;z-index:1300;background:rgba(8,11,16,.72);display:flex;align-items:center;justify-content:center}
.xx-dexbox{width:560px;max-height:78vh;background:#161c26;border:1px solid #3a4656;border-radius:14px;
  box-shadow:0 18px 60px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden}
.xx-dexhd{padding:12px 14px 8px;border-bottom:1px solid #2a3441}
.xx-dexhd h3{margin:0 0 8px;color:#d4b06a;font-size:15px;display:flex;justify-content:space-between;align-items:center}
.xx-dexhd h3 span{cursor:pointer;color:#7d8894;font-size:13px}
.xx-dexhd h3 span:hover{color:#d4b06a}
.xx-dexq{width:100%;padding:7px 10px;background:#0f141b;border:1px solid #2a3441;border-radius:7px;color:#d8dee6;font-size:12.5px;outline:none;margin-bottom:7px}
.xx-dexq:focus{border-color:#d4b06a}
.xx-dexbar{display:flex;gap:5px;align-items:center;font-size:11px;color:#7d8894}
.xx-dexbar .xx-mi{padding:4px 8px;font-size:11px}
.xx-dexbar .xx-sep{flex:1}
.xx-dexlist{flex:1;overflow-y:auto;padding:6px 10px}
.xx-row{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:8px;border-bottom:1px solid #1f2833}
.xx-row:hover{background:#1e2836}
.xx-row .xx-rn{width:120px;font-weight:600;color:#d4b06a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0}
.xx-row .xx-ri{flex:1;color:#8fa2b8;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.xx-row .xx-rc{color:#5a6678;font-size:10.5px;flex-shrink:0;width:52px;text-align:right}
.xx-row .xx-rb{flex-shrink:0;background:#f4ead0;border:1px solid #e0cd96;border-radius:6px;color:#6b5a26;
  font-size:10.5px;padding:2px 7px;cursor:pointer}
.xx-row .xx-rb:hover{background:#ffe9a8}
.xx-row .xx-rb.bagged{background:#26303e;color:#9db4cc;border-color:#3a4656;cursor:default}
.xx-dexempty{padding:30px;text-align:center;color:#5a6678}
`

function ensureStyle() {
  const id = 'dsh-xiuxian-style-v9'
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

/* ── 储物袋 & 显示模式（localStorage）── */
const bag = {
  list() { try { return JSON.parse(localStorage.getItem('xx-bag') || '[]') } catch { return [] } },
  save(list) { try { localStorage.setItem('xx-bag', JSON.stringify(list)) } catch {} },
  has(name) { return this.list().some((c) => c.name === name) },
  add(characters) {
    const cur = this.list()
    for (const c of characters) {
      if (!cur.some((x) => x.name === c.name)) cur.push({ name: c.name, identity: c.identity, tier: c.tier, count: c.count })
    }
    this.save(cur)
    return cur
  },
  remove(name) { this.save(this.list().filter((c) => c.name !== name)) },
}
const MODES = ['random', 'bag-random', 'fixed']
const MODE_LABEL = { random: '随机', 'bag-random': '储物袋随机', fixed: '固定队伍' }
const mode = {
  get() { const v = localStorage.getItem('xx-mode'); return MODES.includes(v) ? v : 'random' },
  set(v) { try { localStorage.setItem('xx-mode', v) } catch {} },
}

module.exports = {
  name: '@weibaohui/dsh-xiuxian',
  inject: ['slots'],

  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    ensureStyle()

    function XiuxianPage() {
      const [party, setParty] = React.useState([])
      const [size, setSize] = React.useState(() => {
        const v = Number(localStorage.getItem('xx-party'))
        return [1, 2, 3].includes(v) ? v : 1
      })
      const [curMode, setCurMode] = React.useState(mode.get())
      const [msg, setMsg] = React.useState(undefined)   // {who, text, note}
      const [bubbleOpen, setBubbleOpen] = React.useState(false)
      const [menu, setMenu] = React.useState(undefined) // {x, y}
      const [meditate, setMeditate] = React.useState(false)
      const [linked, setLinked] = React.useState(true)
      const [avatars, setAvatars] = React.useState([])        // 子代理化身宠物 {..char, sessionId, lastAt}
      const poolRef = React.useRef([])                        // 化身候选（随机替补）
      const [alpha, setAlpha] = React.useState(() => {
        const v = parseFloat(localStorage.getItem('xx-alpha'))
        return Number.isFinite(v) ? Math.min(1, Math.max(0.35, v)) : 0.94
      })
      const [petSize, setPetSize] = React.useState(() => {
        const v = Number(localStorage.getItem('xx-pet-size'))
        return Number.isFinite(v) ? Math.min(200, Math.max(64, v)) : 132
      })
      const [fx, setFx] = React.useState('')
      const [dex, setDex] = React.useState(undefined)      // {q, sort, filter, all}
      const [pos, setPos] = React.useState(undefined)
      const [drag, setDrag] = React.useState(undefined)
      const breakTimer = React.useRef(undefined)
      const hideTimer = React.useRef(undefined)
      const stageRef = React.useRef(undefined)
      const lastId = React.useRef(0)
      const lastBubbleAt = React.useRef(0)
      const speaker = React.useRef(0)
      const partyRef = React.useRef([])
      partyRef.current = party

      const say = (who, text, note, ttl) => {
        setMsg({ who, text, note })
        setBubbleOpen(true)
        if (hideTimer.current) clearTimeout(hideTimer.current)
        if (ttl !== 0) hideTimer.current = setTimeout(() => setBubbleOpen(false), ttl || 9000)
      }

      /** 按 显示模式 装载队伍。 */
      const loadParty = React.useCallback((n, m) => {
        const curMode2 = m || mode.get()
        if (curMode2 === 'fixed') {
          const saved = bag.list().slice(0, n)
          if (saved.length) { setParty(saved); speaker.current = 0; return Promise.resolve(saved) }
          // 储物袋为空则退化为随机
        }
        if (curMode2 === 'bag-random') {
          const pool = bag.list()
          if (pool.length) {
            const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, n)
            setParty(picked); speaker.current = 0
            return Promise.resolve(picked)
          }
        }
        return api(`/party?n=${n}`).then((r) => {
          setParty(r.characters); speaker.current = 0
          return r.characters
        }).catch(() => [])
      }, [])

      React.useEffect(() => { loadParty(size) }, [size, curMode, loadParty])
      React.useEffect(() => {
        api('/party?n=3').then((r) => { poolRef.current = r.characters || [] }).catch(() => {})
      }, [])

      const greet = (chars) => {
        const c = chars[0]
        if (!c) return
        say(c.name, chars.length > 1
          ? chars.map((x) => `【${x.name}】已入阵`).join('\n')
          : (pickQuote(c) ? `“${pickQuote(c)}”` : (c.identity || '')))
      }
      const reroll = () => loadParty(size).then((chars) => greet(chars))
        .catch(() => say('系统', '连不上修仙服务……'))

      // ── 事件联动 ──
      const flash = (cls) => { setFx(cls); setTimeout(() => setFx(''), 700) }
      const avatarsRef = React.useRef([])
      avatarsRef.current = avatars

      // 子代理活动 → 化身宠物现身（同 sessionId 复用；总量≤3）
      const ensureAvatar = (sessionId) => {
        if (avatarsRef.current.some((a) => a.sessionId === sessionId)) {
          setAvatars((prev) => prev.map((a) => (a.sessionId === sessionId ? { ...a, lastAt: Date.now() } : a)))
          return true
        }
        if (partyRef.current.length + avatarsRef.current.length >= 3) return false
        const cand = poolRef.current.find((c) =>
          !avatarsRef.current.some((a) => a.name === c.name) &&
          !partyRef.current.some((p) => p.name === c.name))
        if (!cand) return false
        poolRef.current = poolRef.current.filter((c) => c.name !== cand.name)
        setAvatars((prev) => [...prev, { ...cand, sessionId, lastAt: Date.now() }])
        return true
      }
      const clearAvatars = () => setAvatars([])
      const react = (ev) => {
        if (!linked || !partyRef.current.length) return
        if (ev.sub && ev.kind !== 'turn_end') {
          const appeared = ensureAvatar(ev.sessionId)
          if (appeared) {
            const c = avatarsRef.current.find((a) => a.sessionId === ev.sessionId)
            if (c) say(`${c.name} · 化身现身`, '身外化身自虚空迈步而出，协同作战！', undefined, 4500)
          }
        }
        if (ev.kind === 'tool_call') {
          setMoodRef.current && setMoodRef.current('working')
          if (now - lastBubbleAt.current < 900) { setFx('xx-hop'); return }
          lastBubbleAt.current = now
          const sp = spellOf(ev.tool)
          flash('xx-cast')
          const team = partyRef.current
          if (team.length > 1) {
            say(`群起施法 · ${sp.name}`, team.map((c) => `【${c.name}】${sp.cast}`).join('\n') + (ev.arg ? `\n▸ ${ev.arg}` : ''), undefined, 6000)
          } else {
            say(team[0].name, `${sp.cast}\n【${ev.tool}】${ev.arg || ''}`, undefined, 6000)
          }
          return
        }
        speaker.current = partyRef.current.length ? (speaker.current + 1) % partyRef.current.length : 0
        const c = partyRef.current[speaker.current]
        if (!c) return
        const q = pickQuote(c)
        switch (ev.kind) {
          case 'user_msg':
            setFx('xx-hop')
            say(c.name, (ev.text ? `“${ev.text}”\n\n` : '') + `凝神细听……`, undefined, 5000)
            break
          case 'assistant_msg':
            if (now - lastBubbleAt.current < 1200) return
            lastBubbleAt.current = now
            say(`${c.name} · 心声道`, `“${ev.text}”`, undefined, 7000)
            break
          case 'tool_error':
            setMoodRef.current && setMoodRef.current('failed')
            setFx('xx-shake')
            say('天劫雷音', `【${ev.tool || '法器'}】轰然炸响！\n${q ? `“${q}”` : `${c.name}：道友莫慌，且看如何补天。`}`, undefined, 7000)
            break
          case 'turn_end': {
            setMoodRef.current && setMoodRef.current('idle')
            setFx('xx-hop')
            if (avatarsRef.current.length) {
              const names = avatarsRef.current.map((a) => a.name).join('、')
              setAvatars([])
              poolRef.current = []
              say('化身归位', `【${names}】功成身退，化作流光归返虚空。`, undefined, 5000)
              break
            }
            say('功行圆满', `【${c.name}】此局事了，道果+1。${q ? `“${q}”` : ''}`, undefined, 6000)
            break
          }
          case 'turn_abort':
            setMoodRef.current && setMoodRef.current('idle')
            say('收势', `【${c.name}】道友收了神通？张弛有道。`, undefined, 5000)
            break
        }
      }
      // mood 由 CSS class 简化处理（failed 抖动/working 施法光晕已足够表达）
      const setMoodRef = { current: undefined }

      React.useEffect(() => {
        const tick = () => {
          api(`/feed?after=${lastId.current}`).then((r) => {
            for (const ev of r.events || []) {
              lastId.current = Math.max(lastId.current, ev.id)
              react(ev)
            }
            // 化身闲置 90 秒自动退场
            setAvatars((prev) => prev.filter((a) => Date.now() - a.lastAt < 90000))
          }).catch(() => {})
        }
        const iv = setInterval(tick, 1600)
        return () => clearInterval(iv)
      })

      const copyText = async (text, okNote) => {
        try { await navigator.clipboard.writeText(text); say('法宝到手', okNote) }
        catch { say('哎呀', '剪贴板权限不给力……') }
      }
      const copySkill = () => {
        const c = partyRef.current[speaker.current] || partyRef.current[0]
        if (!c) return
        fetch(`/dsh-xiuxian/api/skill?name=${encodeURIComponent(c.name)}`).then((r) => r.text())
          .then((txt) => copyText(txt, `「${c.name}」的技能已进剪贴板——贴进会话即附体`))
      }
      const copyIncantation = () => {
        fetch('/dsh-xiuxian/api/incantation').then((r) => r.text())
          .then((t) => copyText(t, '话术已上身——贴进会话，agent 从此用法术腔干活'))
      }
      const showBio = () => {
        const c = partyRef.current[speaker.current] || partyRef.current[0]
        if (!c) return
        say(`${c.name} · 生平`, '玉简展开中……', undefined, 0)
        fetch(`/dsh-xiuxian/api/bio?name=${encodeURIComponent(c.name)}`)
          .then((r) => (r.ok ? r.text() : Promise.reject())).then((t) => setMsg((m) => ({ ...m, text: t })))
          .catch(() => setMsg((m) => ({ ...m, text: '（暂无生平玉简）' })))
      }
      const toggleBreak = () => {
        if (meditate) {
          if (breakTimer.current) clearTimeout(breakTimer.current)
          setMeditate(false)
          say('出定', '众灵宠收功，继续修行！')
          return
        }
        const arm = () => {
          breakTimer.current = setTimeout(() => {
            const c = partyRef.current[Math.floor(Math.random() * (partyRef.current.length || 1))]
            say('打坐周期', `【${c ? c.name : '灵宠'}】闭关已满一炷香（25分钟），道友起身活动周天～`)
            arm()
          }, 25 * 60 * 1000)
        }
        arm()
        setMeditate(true)
        say('入定', '众灵宠盘坐运功……每 25 分钟提醒道友起身。')
      }
      const saveToBag = () => {
        const before = bag.list().length
        const after = bag.add(partyRef.current).length
        say('储物袋', `已收入 ${partyRef.current.map((c) => c.name).join('、')}。` +
          (after > before ? `储物袋现有 ${after} 位。` : '（已在袋中）'))
      }

      const petClick = (i) => {
        setFx('xx-hop')
        setTimeout(() => setFx(''), 640)
        if (bubbleOpen) { setBubbleOpen(false); return }
        const c = party[i]
        if (c) {
          speaker.current = i
          const q = pickQuote(c)
          say(c.name, (c.identity ? c.identity + '\n\n' : '') + (q ? `“${q}”` : ''), undefined, 9000)
        }
      }
      // 双击 = 切换到队内下一位角色（循环），TA 附体打招呼
      const petDblClick = (i) => {
        if (party.length < 2) return
        const nextIdx = (i + 1) % party.length
        const c = party[nextIdx]
        setFx('xx-hop')
        setTimeout(() => setFx(''), 640)
        speaker.current = nextIdx
        const q = pickQuote(c)
        say(`${c.name} 附体`, (c.identity ? c.identity + '\n\n' : '') + (q ? `“${q}”` : ''), undefined, 9000)
      }

      const openMenu = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setMenu({ x: Math.min(e.clientX, window.innerWidth - 210), y: Math.min(e.clientY, window.innerHeight - 320) })
      }
      React.useEffect(() => {
        if (!menu) return
        const close = () => setMenu(undefined)
        // 延迟挂载：跳过打开菜单的那次右键事件，否则菜单刚开即被同事件关闭
        const t = setTimeout(() => {
          window.addEventListener('click', close)
          window.addEventListener('contextmenu', close)
        }, 0)
        return () => { clearTimeout(t); window.removeEventListener('click', close); window.removeEventListener('contextmenu', close) }
      }, [menu])

      const onDown = (e) => {
        if (e.button !== 0) return
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

      const menuItem = (label, fn, checked) => React.createElement('div', {
        key: label, className: 'xx-mi',
        onClick: () => { setMenu(undefined); fn() },
      },
        React.createElement('span', { className: 'xx-ck' }, checked ? '✓' : ''),
        React.createElement('span', null, label))

      return React.createElement(React.Fragment, null,

        // 游戏对话框（纯文字）
        bubbleOpen && msg && React.createElement('div', { className: 'xx-bubble', style: { opacity: alpha } },
          React.createElement('div', { className: 'xx-who' }, msg.who),
          React.createElement('div', { className: 'xx-btext' }, msg.text),
          msg.note && React.createElement('div', { className: 'xx-bnote' }, msg.note)),

        // 右键菜单
        menu && React.createElement('div', { className: 'xx-menu', style: { left: menu.x, top: menu.y },
          onClick: (e) => e.stopPropagation() },
          React.createElement('div', { className: 'xx-mtitle' }, `显示模式（当前：${MODE_LABEL[curMode]}）`),
          MODES.map((m) => menuItem(`${mode.get() === m ? '✓' : ''} ${MODE_LABEL[m]}`, () => {
            mode.set(m); setCurMode(m); loadParty(size, m).then((chars) => greet(chars))
          })),
          React.createElement('div', { className: 'xx-msep' }),
          menuItem(`👥 队伍人数 ${size + 1 > 3 ? 1 : size +1}`, () => setSize((s) => (s % 3) + 1)),
          menuItem('🔄 换一批', reroll),
          menuItem('💬 指点一二', () => {
            const c = partyRef.current[speaker.current] || partyRef.current[0]
            if (!c) return
            const q = pickQuote(c)
            say(c.name, q ? `“${q}”` : '沉吟片刻，暂无一语。', undefined, 8000)
          }),
          React.createElement('div', { className: 'xx-msep' }),
          menuItem('🔍 图鉴选宠', async () => {
            say('图鉴', '翻开修仙界名册……', undefined, 4000)
            const r = await api('/list').catch(() => null)
            if (!r) { say('哎呀', '连不上修仙服务……'); return }
            setDex({ q: '', sort: 'count', filter: 'all', all: r.characters })
          }),
          React.createElement('div', { className: 'xx-msep' }),
          menuItem('📜 复制技能', copySkill),
          menuItem('📖 生平玉简', showBio),
          menuItem('✨ 话术上身', copyIncantation),
          React.createElement('div', { className: 'xx-msep' }),
          menuItem('🧘 ' + (meditate ? '出定' : '打坐'), toggleBreak),
          menuItem('📥 收入储物袋', saveToBag),
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
            '对话透明度',
            React.createElement('input', {
              type: 'range', min: 35, max: 100, value: Math.round(alpha * 100),
              onInput: (e) => {
                const v = Math.min(1, Math.max(0.35, Number(e.target.value) / 100 || 0.94))
                setAlpha(v)
                try { localStorage.setItem('xx-alpha', String(v)) } catch {}
              },
            }))),

        // 图鉴选宠面板
        dex && React.createElement('div', { className: 'xx-dex', onClick: () => setDex(undefined) },
          React.createElement('div', { className: 'xx-dexbox', onClick: (e) => e.stopPropagation() },
            React.createElement('div', { className: 'xx-dexhd' },
              React.createElement('h3', null,
                '修仙界名册',
                React.createElement('span', { onClick: () => setDex(undefined) }, '✕')),
              React.createElement('input', {
                className: 'xx-dexq', placeholder: '搜索名字 / 别名 / 身份…', autoFocus: true,
                value: dex.q, onInput: (e) => setDex({ ...dex, q: e.target.value }),
              }),
              React.createElement('div', { className: 'xx-dexbar' },
                [['all', '全部'], ['t1', '主要角色'], ['bag', '已存袋'], ['inparty', '已入队']].map(([f, label]) =>
                  React.createElement('div', {
                    key: f, className: 'xx-mi', style: dex.filter === f ? { background: '#26303e', color: '#d4b06a' } : undefined,
                    onClick: () => setDex({ ...dex, filter: f }),
                  }, label)),
                React.createElement('span', { className: 'xx-sep' }),
                React.createElement('div', { className: 'xx-mi', style: { color: '#d4b06a' },
                  onClick: () => setDex({ ...dex, sort: dex.sort === 'count' ? 'name' : (dex.sort === 'name' ? 'tier' : 'count') }),
                }, '排序: ' + (dex.sort === 'count' ? '出场↑' : dex.sort === 'name' ? '名字' : '主角优先')),
                React.createElement('span', null, `${(dex.filtered || dex.all).length} 只`)),
            ),
            React.createElement('div', { className: 'xx-dexlist' },
              (() => {
                const kw = dex.q.trim().toLowerCase()
                let rows = dex.all
                if (kw) rows = rows.filter((c) => (c.name + c.alias + ' ' + c.identity).toLowerCase().includes(kw))
                if (dex.filter === 't1') rows = rows.filter((c) => c.tier === 1)
                if (dex.filter === 'bag') rows = rows.filter((c) => bag.has(c.name))
                if (dex.filter === 'inparty') rows = rows.filter((c) => party.some((p) => p.name === c.name))
                rows = [...rows].sort((a, b) =>
                  dex.sort === 'name' ? a.name.localeCompare(b.name, 'zh') :
                  dex.sort === 'tier' ? (a.tier - b.tier) || (b.count - a.count) :
                  b.count - a.count)
                dex.filtered = rows
                if (!rows.length) return React.createElement('div', { className: 'xx-dexempty' }, '名册中无此角色')
                return rows.slice(0, 200).map((c) => React.createElement('div', { key: c.name, className: 'xx-row' },
                  React.createElement('span', { className: 'xx-rn' }, (c.tier === 1 ? '👑' : '') + c.name),
                  React.createElement('span', { className: 'xx-ri' }, c.identity || c.alias || ''),
                  React.createElement('span', { className: 'xx-rc' }, `${c.count}章`),
                  React.createElement('button', {
                    className: 'xx-rb' + (party.some((p) => p.name === c.name) ? ' bagged' : ''),
                    onClick: () => {
                      setParty((prev) => {
                        const next = [...prev]
                        const idx = next.findIndex((p) => p.name === c.name)
                        if (idx >= 0) next.splice(idx, 1)
                        else { if (next.length >= 3) next.pop(); next.push(c) }
                        speaker.current = 0
                        return next
                      })
                      say(c.name, `${c.name}入队！` + (pickQuote(c) ? ` “${pickQuote(c)}”` : ''), undefined, 5000)
                    },
                  }, party.some((p) => p.name === c.name) ? '离队' : '+入队'),
                  React.createElement('button', {
                    className: 'xx-rb' + (bag.has(c.name) ? ' bagged' : ''),
                    onClick: () => {
                      if (bag.has(c.name)) { bag.remove(c.name); setDex({ ...dex }) }
                      else { bag.add([c]); setDex({ ...dex }); say('储物袋', `${c.name}已收入袋中。`, undefined, 4000) }
                    },
                  }, bag.has(c.name) ? '已存袋' : '📥存袋'),
                ))
              })()),
          )),

        // 宠物舞台
        React.createElement('div', {
          ref: stageRef,
          className: `xx-stage${fx ? ' ' + fx : ''}${meditate ? ' xx-meditate' : ''}`,
          style: Object.assign({ '--xx-pet-size': petSize }, pos ? { right: 'auto', bottom: 'auto', left: pos.x, top: pos.y } : {}),
          onMouseDown: onDown,
          onContextMenu: openMenu,
        },
          [...party.map((c) => ({ ...c, isAvatar: false })),
           ...avatars.map((a) => ({ ...a, isAvatar: true }))].slice(0, 3).map((c, i) => React.createElement('div', {
            key: c.name, className: 'xx-petwrap',
            onClick: () => petClick(i),
            onDoubleClick: () => petDblClick(i),
            title: `${c.name}（左键说话，双击换人，右键菜单）`,
          },
            React.createElement('div', { className: 'xx-av', dangerouslySetInnerHTML: { __html: xxAvatarSVG(c).svg } }),
            React.createElement('div', { className: 'xx-name' },
              (c.isAvatar ? '🔮' : '') + c.name + (meditate ? ' · 定' : '')))),
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
