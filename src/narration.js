'use strict'

/**
 * 修仙话术映射库 —— 把编码事件翻译成《凡人修仙传》式修行叙事。
 *
 * 三张表：
 *   TOOLS   工具调用 → 法术/法器（tool 名支持前缀匹配）
 *   EVENTS  生命周期事件 → 话术（成功/失败双版）
 *   VOCAB   丹药·符箓·分身·境界等杂项词汇表
 *
 * narrate() 把一次事件组合成一句可播报的话术。
 */

/** 工具 → 法术法器。key 按小写前缀匹配（如 bash、read、web_fetch）。 */
const TOOLS = [
  { match: ['bash', 'shell', 'terminal'], kind: '法术', name: '御剑术', item: '青竹蜂云剑',
    cast: '剑光一闪，敕令已行——', done: '剑诀收势，尘归尘土归土。' },
  { match: ['read', 'view'], kind: '法术', name: '天眼术', item: '灵目',
    cast: '双目灵光流转，玉简字字入识——', done: '所见尽收识海。' },
  { match: ['write'], kind: '炼器', name: '开炉铸器', item: '本命法器坯',
    cast: '祭出丹炉，采八方灵材，铸器！——', done: '器成，灵光内蕴。' },
  { match: ['edit', 'patch'], kind: '炼器', name: '重炼法器', item: '旧器重熔',
    cast: '以真火重熔器身，修补纹路——', done: '纹路弥合，器灵安稳。' },
  { match: ['grep', 'search'], kind: '神通', name: '搜魂大法', item: '大衍诀推演',
    cast: '神识如潮，遍扫灵机脉络——', done: '气机锁定，纤毫毕现。' },
  { match: ['glob', 'find', 'ls'], kind: '神通', name: '周天星斗大衍术', item: '星盘',
    cast: '星盘转动，推演万物方位——', done: '诸物归位，一目了然。' },
  { match: ['websearch', 'web_search'], kind: '法术', name: '神游太虚', item: '千里传音符',
    cast: '元神出窍，神游太虚之外——', done: '携灵讯而归。' },
  { match: ['webfetch', 'fetch', 'web_reader'], kind: '法术', name: '摘星换月', item: '摄物袖',
    cast: '大袖一挥，摄天外灵物于掌中——', done: '灵物入手，细细观详。' },
  { match: ['task', 'agent', 'subagent'], kind: '秘术', name: '身外化身', item: '二裂分身',
    cast: '掐诀分魂，遣一具化身携法宝而行——', done: '化身归位，记忆回笼本尊。' },
  { match: ['todo'], kind: '心法', name: '道纲排定', item: '道碑',
    cast: '掐指推演，刻道碑以定行止——', done: '纲举目张。' },
  { match: ['memory'], kind: '心法', name: '识海刻录', item: '储物袋',
    cast: '指尖灵光没入识海，刻录记忆——', done: '他日翻检，历历在目。' },
  { match: ['skill'], kind: '神通', name: '施展神通', item: '本命神通',
    cast: '法诀掐动，神通轰然而出——', done: '神通已施。' },
  { match: ['diagnostic', 'lsp', 'problem'], kind: '医术', name: '诊脉术', item: '金针',
    cast: '金针度穴，探查经脉暗伤——', done: '病灶已明。' },
  { match: ['git'], kind: '法术', name: '刻碑术', item: '道碑',
    cast: '以岁月为凿，刻此一行进道碑——', done: '道碑留名，因果已录。' },
]

/** 生命周期事件 → 话术。ok 为 true/false 时取对应版本。 */
const EVENTS = {
  session_start: { title: '开坛', ok: ['灵坛已设，香火已燃，今日闭关写码。'], fail: [] },
  session_end: { title: '出关', ok: ['今日功行圆满，出关。'], fail: [] },
  build: { title: '开炉炼丹', ok: ['文武火轮转，药香四溢，此炉丹气醇正。'], fail: ['轰——炸炉了！药渣满地，灵烟呛人。'] },
  test: { title: '试丹', ok: ['丹成上品！丹香扑鼻，灵力圆满。'], fail: ['丹有青黑之色，丹毒暗藏——此丹废了，重炼。'] },
  commit: { title: '凝结道果', ok: ['道果入腹，道行又深一分，道碑+1。'], fail: [] },
  push: { title: '飞剑传书', ok: ['一封飞剑传书直上宗门，千里瞬至。'], fail: ['传音符半途灵光涣散——信道有阻。'] },
  pull: { title: '收取宗门传讯', ok: ['玉简传讯到手，同门近况尽知。'], fail: [] },
  merge: { title: '合籍双修', ok: ['两脉功法并行不悖，水乳交融。'], fail: ['道争！两股真气在经脉中撞了个满怀——须先化解。'] },
  deploy: { title: '出山', ok: ['功成出山，此器可镇一方。'], fail: ['出山途中法宝脱手——且慢，收回来重祭。'] },
  install: { title: '坊市采买', ok: ['灵材入袋，花销不菲但物有所值。'], fail: ['坊市掌柜说此材断货——灵网亦有不通时。'] },
  error: { title: '天劫雷音', ok: [], fail: ['咔嚓——天劫雷音炸响！探其源头，竟是自身道基之裂。'] },
  warning: { title: '禁制波动', ok: [], fail: ['护山禁制微微震颤，有隐患未平。'] },
  fix: { title: '斩心魔', ok: ['心魔授首，道心重归澄澈。'], fail: [] },
  refactor: { title: '重修炼法', ok: ['旧法拆去繁冗，重炼后运转如臂使指。'], fail: [] },
  restart: { title: '重开灵阵', ok: ['洞府灵阵重启，灵气复通。'], fail: ['灵阵启动失败——阵眼似乎堵了。'] },
  migrate: { title: '移山填海', ok: ['大袖一卷，山河易位，地基已换新。'], fail: ['移山途中灵脉断裂——回滚！'] },
  review: { title: '论道', ok: ['与同门论道，互相印证，各有进益。'], fail: [] },
  compress: { title: '炼化识海', ok: ['识海记忆去芜存菁，神识一轻。'], fail: [] },
}

/** 丹药·符箓·分身·境界 杂项词汇。 */
const VOCAB = {
  pills: [
    ['咖啡/浓茶', '凝神丹'],
    ['一次通过', '破境丹'],
    ['try/catch', '护体罡罩'],
    ['断点调试', '入定内视'],
    ['类型标注', '道纹加固'],
    ['注释', '留给后人的玉简洁注'],
  ],
  talismans: [
    ['alias / 快捷命令', '预制符箓，一催即发'],
    ['一次性脚本', '现炼的速效符，用后即焚'],
    ['--force', '破禁符——能破禁制，也能反噬，非危急勿用'],
    ['sudo', '借来的上位法印，权柄通天，落子需慎'],
    ['.gitignore', '隔音符：耳根清净，杂音不入'],
  ],
  avatars: {
    solo: '本尊亲自出手，一剑破万法。',
    parallel: '三头六臂法相！数具化身各执法宝，并行不悖。',
    subagent: '身外化身持本命法宝离洞而去，本尊闭目养神，静候识海传讯。',
  },
  realms: [
    ['初开会话', '炼气期·初入修行'],
    ['首次提交', '筑基——道基初成'],
    ['十次提交', '金丹——道果初凝'],
    ['测试全绿', '元婴——神通自生'],
    ['部署上线', '化神——言出法随'],
    ['一年无事故', '大乘——飞升可期'],
  ],
  context: [
    ['上下文将满', '识海将盈，神识发涨——该炼化记忆了'],
    ['灵石（token）', '灵石充盈，法力绵绵不绝；灵石告罄，巧妇难为无米之炊'],
  ],
}

/** 按前缀匹配一个工具的映射。 */
function findTool(name) {
  if (!name) return undefined
  const n = String(name).toLowerCase()
  return TOOLS.find((t) => t.match.some((m) => n.includes(m)))
}

/**
 * 组合一句修行话术。
 * @param {object} p
 * @param {string} [p.tool]     工具名（如 Bash、WebFetch）
 * @param {string} [p.event]    事件 key（EVENTS 的键，如 build/test/commit）
 * @param {boolean} [p.ok]      成败（缺省按事件只有单版则忽略）
 * @param {string} [p.character] 角色名（会带出"某某道：前缀的播报腔"）
 * @param {string} [p.quote]    角色原话语录，缀在末尾增味
 * @returns {{line: string, kind: string}}
 */
function narrate({ tool, event, ok, character, quote } = {}) {
  const who = character ? `${character}：` : ''
  const t = findTool(tool)
  if (t && !event) {
    const line = `${who}【${t.kind}·${t.name}】${t.cast}（${t.item}）` + (quote ? `\n“${quote}”` : '')
    return { line, kind: 'tool' }
  }
  const e = event && EVENTS[event]
  if (e) {
    const pool = ok === false && e.fail.length ? e.fail : (ok === true && e.ok.length ? e.ok : (e.ok.length ? e.ok : e.fail))
    const line = pool.length
      ? `${who}【${e.title}】${pool[Math.floor(Math.random() * pool.length)]}` + (quote ? `\n“${quote}”` : '')
      : `${who}【${e.title}】`
    return { line, kind: 'event' }
  }
  if (t) {
    const line = `${who}【${t.kind}·${t.name}】${t.cast}（${t.item}）` + (quote ? `\n“${quote}”` : '')
    return { line, kind: 'tool' }
  }
  return { line: `${who}道友今日道心坚定，修行不辍。`, kind: 'idle' }
}

module.exports = { TOOLS, EVENTS, VOCAB, findTool, narrate }
