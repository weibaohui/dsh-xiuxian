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
@keyframes xx-svgaura{0%,100%{opacity:.5}50%{opacity:.85}}
@keyframes xx-aura{0%,100%{opacity:.45;transform:translate(-50%,-50%) scale(1)}50%{opacity:.8;transform:translate(-50%,-50%) scale(1.08)}}
.xx-eyes{transform-box:fill-box;transform-origin:center;animation:xx-blink 4.4s ease-in-out infinite}
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
.xx-bubble{position:fixed;right:18px;bottom:168px;width:340px;background:#fffdf6;color:#3a332a;
  border:2px solid #d4b06a;border-radius:16px;padding:12px 14px 10px;z-index:1199;
  box-shadow:0 10px 30px rgba(0,0,0,.35);animation:xx-pop .28s ease}
.xx-bubble::after{content:"";position:absolute;right:44px;bottom:-9px;width:14px;height:14px;background:#fffdf6;
  border-right:2px solid #d4b06a;border-bottom:2px solid #d4b06a;transform:rotate(45deg)}
.xx-btag{display:inline-block;background:#5a4a1e;color:#ffd97a;border-radius:8px;padding:1px 9px;
  font-size:11px;margin-bottom:6px}
.xx-btext{max-height:200px;overflow-y:auto;white-space:pre-wrap;font-size:13px;user-select:text}
.xx-bnote{color:#a08c5a;font-size:11px;margin-top:6px}
.xx-tools{display:flex;gap:6px;margin-top:10px;padding-top:8px;border-top:1px dashed #e3d5ae}
.xx-tbtn{flex:1;background:#f4ead0;border:1px solid #e0cd96;border-radius:10px;color:#6b5a26;
  font-size:15px;line-height:1;padding:6px 0;cursor:pointer;text-align:center}
.xx-tbtn:hover{background:#ffe9a8;transform:translateY(-1px)}
.xx-tbtn.on{background:#d4b06a;color:#fff}
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
        ['🔄', '换一位', reroll, false],
        ['💬', '指点一二', speak, false],
        ['📜', '复制技能', copySkill, false],
        ['📖', '生平', showBio, false],
        ['✨', '话术上身', copyIncantation, false],
        [meditate ? '🌅' : '🧘', meditate ? '出定' : '打坐', toggleBreak, meditate],
      ]

      return React.createElement(React.Fragment, null,

        open && React.createElement('div', { className: 'xx-bubble' },
          React.createElement('span', { className: 'xx-btag' }, msg.tag),
          React.createElement('div', { className: 'xx-btext' }, msg.text),
          msg.note && React.createElement('div', { className: 'xx-bnote' }, msg.note),
          React.createElement('div', { className: 'xx-tools' },
            tools.map(([icon, title, fn, on]) => React.createElement('button', {
              key: title, className: 'xx-tbtn' + (on ? ' on' : ''), title, onClick: fn,
            }, icon)))),

        React.createElement('div', {
          ref: stageRef, className: 'xx-stage',
          style: pos ? { right: 'auto', bottom: 'auto', left: pos.x, top: pos.y } : undefined,
        },
          React.createElement('div', {
            className: 'xx-pet' + (hop ? ' xx-hop' : '') + (meditate ? ' xx-meditate' : ''),
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
