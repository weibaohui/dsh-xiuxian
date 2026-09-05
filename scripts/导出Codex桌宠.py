# -*- coding: utf-8 -*-
"""
Codex pets 兼容导出：把 dsh-xiuxian 的程序化像素宠物导出为 Codex 桌宠包。
  python3 脚本/导出Codex桌宠.py 角色名 [输出目录]
产出（符合 Codex 官方规范）：
  <输出>/<角色名>/
    pet.json          # { id, displayName, description, spritesheetPath }
    spritesheet.webp  # 1536×1872 = 8列×9行，每帧 192×208
行语义（Codex 约定）：
  1 idle  2 running-right  3 running-left  4 waving  5 jumping
  6 failed  7 waiting  8 running(伏案)  9 review(睡)
我们用四状态引擎映射：idle→双帧 idle，run→working 双帧，failed→failed 双帧，sleep→sleep 双帧；
其余行用相邻状态填充（循环可播）。
"""
import subprocess, json, sys, os

AVATAR_JS = "/Users/mac/projects/ts/dsh-plugins/dsh-xiuxian/client/avatar.js"
CARD_DIR = "/Users/mac/Desktop/凡人修仙传-人物体系/人物卡片-合并版"
SCALE = 12  # 每像素格 → 12px（16格 → 192px 宽）

def render_frame_png(svg, out_png, size):
    """用浏览器无头渲染最稳，但无 node 依赖环境时退化为 rsvg/qlmanage；此处用 Chrome headless。"""
    html = f'<html><body style="margin:0"><div style="width:{size}px;height:{size}px">{svg}</div></body></html>'
    tmp = "/tmp/xx_frame.html"
    open(tmp, "w").write(html)
    subprocess.run([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless", "--disable-gpu", "--force-device-scale-factor=1",
        f"--window-size={size},{size}", "--screenshot=" + out_png,
        "file://" + tmp,
    ], capture_output=True, timeout=30)
    if not os.path.exists(out_png) or os.path.getsize(out_png) < 500:
        raise RuntimeError(f"渲染失败: {out_png}")

def main():
    from PIL import Image
    name = sys.argv[1] if len(sys.argv) > 1 else "韩立"
    outdir = sys.argv[2] if len(sys.argv) > 2 else f"/Users/mac/Desktop/凡人修仙传-人物体系/codex-pets/{name}"
    card_path = f"{CARD_DIR}/{name}.md"
    if not os.path.exists(card_path):
        print(f"卡片不存在: {card_path}"); return
    card = open(card_path).read()
    identity = (card.split("---")[2] if card.count("---") >= 2 else "")
    ident_line = ""
    for line in card.splitlines():
        if line.startswith("identity:"):
            ident_line = line.split(":", 1)[1].strip(); break

    # node 侧生成四状态 SVG
    script = f'''
const {{ xxAnalyze, xxAvatarSVG }} = require("{AVATAR_JS}")
const card = require("fs").readFileSync("{card_path}", "utf8")
const identity = (card.match(/identity:(.+)/) || ["", ""])[1].trim()
const alias = (card.match(/aliases:(.+)/) || ["", ""])[1].trim()
const c = {{ name: "{name}", alias, identity }}
const out = {{}}
for (const s of ["idle", "working", "failed", "sleep"]) {{
  out[s] = xxAvatarSVG(c, s).svg
}}
console.log(JSON.stringify(out))
'''
    r = subprocess.run(["node", "-e", script], capture_output=True, text=True)
    if r.returncode != 0:
        print("node 渲染失败:", r.stderr[:300]); return
    svgs = json.loads(r.stdout)

    os.makedirs(outdir, exist_ok=True)
    frame = 192
    tmp_dir = "/tmp/xx_codex_frames"
    os.makedirs(tmp_dir, exist_ok=True)

    # 9 行状态映射（每行 8 帧，从对应状态的 2 帧 + 微位移填充）
    row_state = ["idle", "working", "working", "idle", "idle", "failed", "idle", "working", "sleep"]
    sheet = Image.new("RGBA", (1536, 1872), (0, 0, 0, 0))
    for row, state in enumerate(row_state):
        svg = svgs[state]
        for col in range(8):
            out_png = f"{tmp_dir}/f.png"
            render_frame_png(svg, out_png, frame)
            img = Image.open(out_png).convert("RGBA")
            # 居中裁剪到 frame×frame
            w, h = img.size
            img = img.crop((max(0, (w-frame)//2), max(0, (h-frame)//2),
                            min(w, (w+frame)//2), min(h, (h+frame)//2)))
            sheet.paste(img, (col * frame, row * frame), img)
    sheet_path = os.path.join(outdir, "spritesheet.webp")
    sheet.save(sheet_path, "WEBP", quality=90)

    pet = {
        "id": name,
        "displayName": name,
        "description": f"dsh-xiuxian 像素风修仙桌宠：{ident_line[:80]}（程序化生成 by @weibaohui/dsh-xiuxian）",
        "spritesheetPath": "spritesheet.webp",
    }
    with open(os.path.join(outdir, "pet.json"), "w") as f:
        json.dump(pet, f, ensure_ascii=False, indent=2)
    print(f"已导出 Codex 桌宠包: {outdir}")
    print(f"  pet.json + spritesheet.webp ({os.path.getsize(sheet_path)//1024}KB)")
    print(f"  安装：复制到 %USERPROFILE%\\.codex\\pets\\{name}\\ 或 ~/.codex/pets/{name}/")

if __name__ == "__main__":
    main()
