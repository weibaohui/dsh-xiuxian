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
@keyframes xx-zzz{0%{transform:translateY(0);opacity:0}30%{opacity:.9}100%{transform:translateY(-12px) translateX(5px);opacity:0}}
.xx-stage{position:fixed;right:26px;bottom:18px;z-index:1200;display:flex;gap:4px;align-items:flex-end;
  font:13px/1.6 "PingFang SC","Microsoft YaHei",sans-serif;user-select:none}
.xx-petwrap{width:132px;text-align:center;cursor:grab;animation:xx-float 3.4s ease-in-out infinite}
.xx-petwrap:active{cursor:grabbing}
.xx-petwrap:nth-child(2){animation-delay:.4s}
.xx-petwrap:nth-child(3){animation-delay:.8s}
.xx-av{width:130px;height:138px}
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

function ensureStyle() {
  if (!document.getElementById('dsh-xiuxian-style')) {
    const tag = document.createElement('style')
    tag.id = 'dsh-xiuxian-style'
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
      const [fx, setFx] = React.useState('')
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
            setFx('xx-shake')
            say({ tag: '天劫雷音', text: `【${ev.tool || '法器'}】轰然炸响！\n${q ? `“${q}”` : `${c.name}：道友莫慌，且看如何补天。`}` }, 7000)
            break
          case 'turn_end':
            setFx('xx-hop')
            say({ tag: '功行圆满', text: `【${c.name}】此局事了，道果+1。${q ? `“${q}”` : ''}` }, 6000)
            break
          case 'turn_abort':
            say({ tag: '收势', text: `【${c.name}】道友收了神通？张弛有道。` }, 5000)
            break
        }
      }

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
          ref: stageRef,
          className: `xx-stage${fx ? ' ' + fx : ''}${meditate ? ' xx-meditate' : ''}`,
          style: Object.assign({ opacity: alpha }, pos ? { right: 'auto', bottom: 'auto', left: pos.x, top: pos.y } : {}),
          onMouseDown: onDown,
        },
          party.map((c, i) => React.createElement('div', {
            key: c.name, className: 'xx-petwrap',
            onClick: () => petClick(i),
            title: `${c.name}（点我说话）`,
          },
            React.createElement('div', { className: 'xx-av', dangerouslySetInnerHTML: { __html: xxAvatarSVG(c).svg } }),
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
