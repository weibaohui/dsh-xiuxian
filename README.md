# @weibaohui/dsh-xiuxian

[![CI](https://github.com/weibaohui/dsh-xiuxian/actions/workflows/ci.yml/badge.svg)](https://github.com/weibaohui/dsh-xiuxian/actions/workflows/ci.yml)

![修仙陪伴宠物](docs/demo.gif)

dsh 插件 · 修仙陪伴。随机唤醒一位《凡人修仙传》角色，以悬浮浮层陪伴你写代码。

**数据集随包自带，开箱即用**：2496 张去重人物卡片（经历年表/口吻/语录/关系）+ 2055 份角色对话技能（Tier1 含开场白与专属守则）+ 2060 份生平 + 关系图数据。源自全书 2451 章逐章精读分析，经 183 对候选卡片逐一原文考证去重合并。

## Q 版形象引擎

每个角色的电子宠物形象由 `client/avatar.js` **特征驱动程序化生成**（分层 SVG）：
- **九类形态**：修士（发髻道冠）/女修（双丫髻+簪花）/老者（白发白须）/孩童（呆毛）/僧人（戒疤+念珠）/妖兽（兽耳+兽鼻）/灵虫（分节+触角+复眼）/傀儡（铆钉方身）/鬼魂（波浪下摆半透明）
- **十四系配色**：青碧绿紫蓝白银金黄橙粉红赤墨玄灰——从名字/别名/身份关键词提取（青竹蜂云剑→青、朱雀环→朱红、墨大夫→玄黑、银月→银白）
- **十三类法宝**：剑/环/经卷/葫芦/念珠/丹炉/幡/铃/扇/箫笛/刀/笔/印——身份持什么就捧什么
- **魔族犄角**：圣祖/古魔/真魔类自动长角，魔道暗色系
- 仲裁规则：女修 vs 妖兽（银月=妖狼妃→兽形；南宫婉=朱环女修→女形）、"向老鬼"式诨称不误判鬼物

## 能力

- **随机唤醒**：每个新会话（页面加载）自动加权随机一位角色——Tier1 主要角色权重最高；侧栏按钮直接显示 Ta 的名字
- **悬浮浮层**：侧栏底部 `☯ 角色名` 按钮点开，可拖动、置顶、半透明
- **指点一二**：按编码情境（提交=突破、bug=心魔、重构=重炼…）用**角色原话语录**点评
- **复制技能**：一键复制该角色的完整对话 system prompt，贴进任意会话即让角色"上身"
- **生平**：浮层内直接翻阅此人一生的分卷年表
- **打坐周期**：开启后每 25 分钟以角色口吻催你起身活动
- **修行话术体系**：工具=法术法器（Bash=御剑术·青竹蜂云剑、搜索=搜魂大法、子代理=身外化身）；事件=修行节点（构建=开炉炼丹·失败=炸炉、测试=试丹·全绿=丹成上品、bug=心魔、报错=天劫雷音、提交=凝结道果、部署=出山飞升）；丹药符箓词表（--force=破禁符、sudo=借来的上位法印、try/catch=护体罡罩）；"话术上身"一键让 agent 会话本身用法术腔播报

## 安装

```bash
dsh plugin add --profile <你的profile> @weibaohui/dsh-xiuxian   # npm 源
dsh plugin add --profile <你的profile> ~/projects/ts/dsh-plugins/dsh-xiuxian  # 本地目录
```

安装后重启对应 profile 即生效。

## 配置

| 键 | 默认 | 说明 |
|---|---|---|
| `dataDir` | 包内自带 `data/` | 可选。指向外部数据集以覆盖自带数据，支持两种布局：<br>① 打包布局：目录下直接是 `cards/ skills/ bios/ stats.json`<br>② 工作区布局：目录下是 `人物卡片-合并版/ 对话系统/角色技能/ 生平/ 数据/` |

外部数据更新后无需重启：`curl "http://127.0.0.1:port/dsh-xiuxian/api/reload"`。

## HTTP API

| 路由 | 说明 |
|---|---|
| `GET /dsh-xiuxian/api/roll` | 加权随机一位角色（含语录样本） |
| `GET /dsh-xiuxian/api/comment?name=` | 角色原声的编码情境点评 |
| `GET /dsh-xiuxian/api/skill?name=` | 角色对话技能 prompt（纯文本） |
| `GET /dsh-xiuxian/api/bio?name=` | 角色生平（纯文本） |
| `GET /dsh-xiuxian/api/status` | 数据集概况 |
| `GET /dsh-xiuxian/api/reload` | 重建内存索引 |
| `GET /dsh-xiuxian/api/narrate?event=&ok=&name=` | **修行话术**：把工程事件译成修仙叙事（事件+角色原声） |
| `GET /dsh-xiuxian/api/incantation` | "话术上身"提示词——贴进 agent 会话，agent 从此用法术腔播报干活 |
| `GET /dsh-xiuxian/api/lexicon` | 完整话术映射表（工具→法器法术 / 事件→话术 / 丹药符箓分身境界词表） |

## 发布

```bash
npm publish --access public
```

## 开发

```bash
npm run check          # 语法检查
npm run build:client   # 重建 client/bundle.js
```

离线冒烟（直测宿主，无需启动 dsh）：

```bash
node -e "const {CharacterStore,resolveLayout}=require('./src/index.js').__test;const s=new CharacterStore(resolveLayout('./data'));console.log(s.build(),s.roll().name)"
```
