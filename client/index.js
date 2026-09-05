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
@keyframes xx-eoblink{0%,88%,100%{opacity:1}92%,96%{opacity:0}}
@keyframes xx-ecblink{0%,88%,100%{opacity:0}92%,96%{opacity:1}}
.xx-ec{opacity:0}
.xx-pet:not(.xx-meditate) .xx-eo{animation:xx-eoblink 4.4s ease-in-out infinite}
.xx-pet:not(.xx-meditate) .xx-ec{animation:xx-ecblink 4.4s ease-in-out infinite}
.xx-meditate .xx-eo{opacity:0}
.xx-meditate .xx-ec{opacity:1}
.xx-svg{image-rendering:pixelated}
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
