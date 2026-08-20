#!/usr/bin/env python3
"""Build the cover-review page: every candidate judged at the crops it renders in.

A cover is never seen whole. The listing card takes ~2.10 out of it (and as much
as 2.50 at 800-1024px viewports), the hero takes 1.78, the OG card takes 1.90 —
so a thumbnail tells you nothing about whether a picture survives. This renders
each candidate pre-cropped to the card and hero boxes, with the worst-case card
slice marked inside the card frame, next to the cover it would replace.

Everything is embedded as a data URI because the Artifact CSP blocks every
external host.

    python3 scripts/case-studies/cover_review_sheet.py --pexels DIR --current DIR \
        --new DIR --out review.html
"""

import base64
import html
import io
import json
import os
import sys

from PIL import Image

CARD_RATIO, CARD_TIGHT, HERO_RATIO = 2.10, 2.50, 1.78
CARD_W, HERO_W = 460, 230


def crop(im, ratio):
    w, h = im.size
    if w / h > ratio:
        nw, nh = round(h * ratio), h
    else:
        nw, nh = w, round(w / ratio)
    return im.crop(((w - nw) // 2, (h - nh) // 2, (w - nw) // 2 + nw, (h - nh) // 2 + nh))


def data_uri(im, width, ratio, quality=72):
    im = crop(im.convert("RGB"), ratio).resize((width, round(width / ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def plain_uri(path, width, quality=76):
    im = Image.open(path).convert("RGB")
    im = im.resize((width, round(width * im.height / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def png_uri(path, width=None):
    im = Image.open(path).convert("RGBA")
    if width and im.width != width:
        im = im.resize((width, round(width * im.height / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def frames(path):
    """(card crop, hero crop) as data URIs."""
    im = Image.open(path)
    return data_uri(im, CARD_W, CARD_RATIO), data_uri(im, HERO_W, HERO_RATIO)


def shot(slug, label, card, hero, meta="", pick=None, tone=""):
    ident = f' data-pick="{html.escape(pick)}"' if pick else ""
    cls = f"shot {tone}".strip()
    button = "button" if pick else "div"
    role = ' type="button"' if pick else ""
    inset = 100 * (1 - CARD_RATIO / CARD_TIGHT) / 2
    return f"""
        <{button} class="{cls}"{role} data-slug="{html.escape(slug)}"{ident}>
          <span class="frame">
            <img src="{card}" alt="{html.escape(label)} at the listing-card crop" loading="lazy" />
            <span class="tight" style="--inset:{inset:.1f}%"></span>
          </span>
          <span class="under">
            <span class="hero"><img src="{hero}" alt="{html.escape(label)} at the hero crop" loading="lazy" /></span>
            <span class="cap"><b>{html.escape(label)}</b>{f'<i>{html.escape(meta)}</i>' if meta else ''}</span>
          </span>
        </{button}>"""


def main():
    args, opts = sys.argv[1:], {}
    while args:
        a = args.pop(0)
        opts[a.lstrip("-")] = args.pop(0)
    pexels, current, new, out = opts["pexels"], opts["current"], opts["new"], opts["out"]
    briefs = json.load(open(opts["briefs"], encoding="utf-8"))
    manifest = json.load(open(os.path.join(pexels, "candidates.json"), encoding="utf-8"))
    # Slugs the publisher has already settled. They render as a confirmation
    # strip instead of a pick row, so a second round is about the studies still
    # open rather than a re-read of the whole set.
    decided = json.load(open(opts["decided"], encoding="utf-8")) if "decided" in opts else {}

    by_slug = {}
    for c in manifest:
        by_slug.setdefault(c["slug"], []).append(c)

    settled = build_settled(decided, by_slug, pexels, new, briefs)

    sections, nav, open_studies = [], [], 0
    if "laurastar" not in decided:
        nav.append('<a href="#laurastar">Laurastar</a><a href="#mercator">Mercator</a>')
        sections.append(build_client_photos(new, current))
        open_studies += 2
    for slug, cands in by_slug.items():
        if slug in decided:
            continue
        brief = briefs.get(slug, {})
        cur_card, cur_hero = frames(os.path.join(current, f"{slug}.jpg"))
        cur = Image.open(os.path.join(current, f"{slug}.jpg"))
        shots = [
            shot(
                slug,
                "current",
                cur_card,
                cur_hero,
                f"{cur.width}×{cur.height} · {cur.width / cur.height:.2f}:1",
                pick=f"{slug}=keep",
                tone="is-current",
            )
        ]
        for c in cands:
            card, hero = frames(os.path.join(pexels, c["file"]))
            shots.append(
                shot(slug, str(c["id"]), card, hero, c["photographer"], pick=f"{slug}={c['id']}")
            )
        extra = ""
        if slug in ("stadler-form",):
            rc, rh = frames(os.path.join(new, "stadler-form-cover-2.jpg"))
            shots.insert(1, shot(slug, "recrop", rc, rh, "faces cropped out", pick=f"{slug}=recrop", tone="is-alt"))
            extra = (
                "<p class='note'>The recrop clears every face and stays product-led, but the "
                "source is only 1400&#215;933 — the usable window is 984&#215;518, below the "
                "card's 1150px render width, and it measures softer than any approved cover.</p>"
            )
        nav.append(f'<a href="#{slug}">{html.escape(brief.get("client", slug))}</a>')
        open_studies += 1
        sections.append(f"""
      <section class="study" id="{slug}">
        <header class="studyhead">
          <h3>{html.escape(brief.get("client", slug))}</h3>
          <p class="slug">{html.escape(slug)}</p>
          <p class="brief">{html.escape(brief.get("excerpt", ""))}</p>
          <p class="query">query <b>{html.escape(cands[0]["query"])}</b></p>
          {extra}
        </header>
        <div class="shots">{"".join(shots)}</div>
      </section>""")

    chrome = build_chrome(opts)

    doc = TEMPLATE.format(
        nav="".join(nav),
        chrome=chrome,
        settled=settled,
        sections="".join(sections),
        count=open_studies,
        done=len(decided),
    )
    with open(out, "w", encoding="utf-8") as f:
        f.write(doc)
    print(
        f"{out}  {os.path.getsize(out) / 1024 / 1024:.1f} MB  "
        f"{open_studies} open, {len(decided)} settled"
    )


def build_settled(decided, by_slug, pexels, new, briefs):
    """The already-chosen covers, at the card crop, for confirmation only."""
    if not decided:
        return ""
    tiles = []
    for slug, choice in decided.items():
        # A file this change encoded wins over the raw download: where both
        # exist the encoded one is what actually ships (a1-karting's frame is
        # the Pexels image with its SODi marks blurred out, not the original).
        local = os.path.join(new, f"{slug}-cover-2.jpg")
        match = next((c for c in by_slug.get(slug, []) if str(c["id"]) == str(choice)), None)
        path = local if os.path.exists(local) else None
        if path is None and match:
            path = os.path.join(pexels, match["file"])
        if not path or not os.path.exists(path):
            continue
        card = data_uri(Image.open(path), 300, CARD_RATIO)
        name = briefs.get(slug, {}).get("client", slug)
        tiles.append(
            f'<figure class="done"><img src="{card}" alt="{html.escape(name)} cover" '
            f'loading="lazy" /><figcaption><b>{html.escape(name)}</b>'
            f'<span>{html.escape(str(choice))}</span></figcaption></figure>'
        )
    return f"""
      <section class="chrome" id="settled">
        <h2>Settled — {len(tiles)} covers</h2>
        <p class="lede">Locked in from round one, shown at the card crop. Say the word on any of
        them and it goes back in the pile.</p>
        <div class="figs done">{"".join(tiles)}</div>
      </section>"""


def build_client_photos(new, current):
    """Laurastar and Mercator: the client's own photo against the cover it replaces."""
    rows = []
    for slug, label, cap in (
        ("laurastar", "Laurastar", "client photo — IGGI steamer, 2752×1536 source"),
        ("mercator", "Mercator", "client photo — nitrylex boxes, 2752×1536 source"),
    ):
        cc, ch = frames(os.path.join(current, f"{slug}.jpg"))
        nc, nh = frames(os.path.join(new, f"{slug}-cover-2.jpg"))
        rows.append(
            f"""
      <section class="study" id="{slug}">
        <header class="studyhead"><h3>{label}</h3><p class="slug">{slug}</p>
        <p class="brief">{cap}</p></header>
        <div class="shots">
          {shot(slug, "current", cc, ch, "", pick=f"{slug}=keep", tone="is-current")}
          {shot(slug, "client photo", nc, nh, "1920×1011", pick=f"{slug}=client", tone="is-alt")}
        </div>
      </section>"""
        )
    return "".join(rows)


def build_chrome(opts):
    assets = opts["assets"]
    logos = "".join(
        f'<figure><img src="{png_uri(os.path.join(assets, f))}" alt="{name}" /><figcaption>{name}</figcaption></figure>'
        for f, name in (
            ("pracuj-pl-main.png", "pracuj.pl on main — 47%"),
            ("pracuj-pl-now.png", "pracuj.pl with boost 1.35 — 67%"),
            ("irobot-now.png", "iRobot — 54%"),
            ("engie-now.png", "ENGIE — 81%"),
        )
    )
    volvo = "".join(
        f'<figure><img src="{png_uri(os.path.join(assets, f))}" alt="{name}" /><figcaption>{name}</figcaption></figure>'
        for f, name in (
            ("volvo-main.png", "Dom Volvo on main — 231×61"),
            ("volvo-now.png", "Dom Volvo regenerated — 272×63"),
        )
    )
    subhead = "".join(
        f'<figure class="wide"><img src="{plain_uri(os.path.join(assets, f), 620)}" alt="{name}" /><figcaption>{name}</figcaption></figure>'
        for f, name in (("subhead-pl.png", "PL, 1440px"), ("subhead-en.png", "EN, 1440px"))
    )
    return f"""
      <section class="chrome" id="chrome">
        <h2>Listing chrome — decided</h2>
        <div class="panel">
          <h3>Card mark — pracuj.pl</h3>
          <p>The card normaliser counts the navy pill as ink, so the mark shrank to 47% of the canvas
          and read small beside its neighbours. A per-slug boost of 1.35 — the value the homepage belt
          already uses for this brand, for the same reason — puts it at 67%, between iRobot (54%) and
          ENGIE (81%).</p>
          <div class="figs">{logos}</div>
        </div>
        <div class="panel warn">
          <h3>Withdrawing Adamed re-normalises the whole set</h3>
          <p>The card marks are scaled against <b>the set's own median optical mass</b>, so the set
          is an input. Adamed sat below that median; taking its study out lifts the median 8.5%, and
          every mark still pinned at the clamp grows <b>4%</b> — 23 files, uniformly. Nothing is
          re-tuned and nothing is arbitrary: this is the normaliser reporting a smaller roster.
          iRobot and ENGIE above show it (51%→54%, 78%→81%).</p>
          <p>They ship with the change. <code>refresh-case-study-logos.ts</code> rewrites every
          study's row on each run and the CDN purge is already in the plan, so the marginal cost is
          nil — and leaving them stale would put the committed files out of step with the script
          again, which is the bug <code>0e1cd3e1</code> just fixed upstream.</p>
        </div>
        <div class="panel warn">
          <h3>Dom Volvo — the one that is not a 4% step</h3>
          <p>Separate, older drift: in the review that landed on 20 Aug, <code>volvo-logo.png</code>
          was overwritten with the homepage belt's own 280×88 render, while the shipped mono was not
          rebuilt from it. The regenerated mark is <b>18% larger</b> and width-bound against the
          canvas — not the uniform 4% the rest of the set moves by.</p>
          <div class="figs">{volvo}</div>
          <p class="ask">I've shipped it, since the whole set re-normalises in this change anyway
          and pinning one slug is what made the pipeline unreproducible in the first place. Say the
          word if you want the old file back instead.</p>
        </div>
        <div class="panel">
          <h3>Subhead</h3>
          <p>The dash clause now opens its own line in both locales, and “Social&nbsp;Lama” is tied
          so no wrap can split it.</p>
          <div class="figs">{subhead}</div>
        </div>
      </section>"""


TEMPLATE = """<title>Social Lama Cover Picks</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Exo+2:wght@600;800&family=Manrope:wght@400;500;700&display=swap" />
<style>
  :root {{
    --ground: #faf9f5;
    --surface: #ffffff;
    --edge: #e0ddd3;
    --ink: #2b1f24;
    --muted: #6d5c62;
    --plum: #913155;
    --orange: #f09b39;
    --shadow: 0 1px 2px rgba(43, 31, 36, .08), 0 8px 24px rgba(43, 31, 36, .06);
    --display: 'Exo 2', 'Trebuchet MS', sans-serif;
    --body: Manrope, 'Segoe UI', system-ui, sans-serif;
  }}
  @media (prefers-color-scheme: dark) {{
    :root:not([data-theme="light"]) {{
      --ground: #161216;
      --surface: #211a1e;
      --edge: #3b2f34;
      --ink: #f2ece9;
      --muted: #b3a1a8;
      --plum: #d98aa8;
      --shadow: 0 1px 2px rgba(0, 0, 0, .5), 0 8px 24px rgba(0, 0, 0, .35);
    }}
  }}
  :root[data-theme="dark"] {{
    --ground: #161216;
    --surface: #211a1e;
    --edge: #3b2f34;
    --ink: #f2ece9;
    --muted: #b3a1a8;
    --shadow: 0 1px 2px rgba(0, 0, 0, .5), 0 8px 24px rgba(0, 0, 0, .35);
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    background: var(--ground);
    color: var(--ink);
    font-family: var(--body);
    font-size: 15px;
    line-height: 1.55;
  }}
  .wrap {{ max-width: 1180px; margin: 0 auto; padding: 0 24px 160px; }}
  header.top {{ padding: 56px 0 28px; border-bottom: 2px solid var(--ink); }}
  h1 {{
    font-family: var(--display); font-weight: 800; font-size: clamp(2rem, 5vw, 3.1rem);
    line-height: .98; letter-spacing: -.02em; margin: 0 0 12px; text-wrap: balance;
  }}
  .lede {{ margin: 0; max-width: 62ch; color: var(--muted); }}
  .lede b {{ color: var(--ink); }}
  nav.jump {{
    display: flex; flex-wrap: wrap; gap: 6px 8px; padding: 18px 0 0;
    font-size: 12px; letter-spacing: .04em; text-transform: uppercase;
  }}
  nav.jump a {{ color: var(--muted); text-decoration: none; border-bottom: 1px solid var(--edge); }}
  nav.jump a:hover, nav.jump a:focus-visible {{ color: var(--plum); border-color: var(--plum); }}
  h2 {{
    font-family: var(--display); font-weight: 800; font-size: 1.5rem; letter-spacing: -.01em;
    margin: 56px 0 18px; padding-bottom: 8px; border-bottom: 1px solid var(--edge);
  }}
  .study, .panel {{ margin: 40px 0 0; }}
  .studyhead h3, .panel h3 {{
    font-family: var(--display); font-weight: 600; font-size: 1.15rem; margin: 0;
  }}
  .slug {{
    margin: 2px 0 8px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
    color: var(--plum);
  }}
  .brief {{ margin: 0 0 6px; max-width: 78ch; color: var(--muted); }}
  .query {{ margin: 0; font-size: 13px; color: var(--muted); }}
  .query b {{ color: var(--ink); font-weight: 500; }}
  .note {{ margin: 8px 0 0; max-width: 78ch; font-size: 13px; color: var(--ink);
    border-left: 3px solid var(--orange); padding-left: 10px; }}
  .shots {{
    display: grid; gap: 14px; margin-top: 14px;
    grid-template-columns: repeat(auto-fit, minmax(196px, 1fr));
  }}
  .shot {{
    display: block; padding: 8px; border: 1px solid var(--edge);
    border-radius: 4px; background: var(--surface); box-shadow: var(--shadow);
    font: inherit; color: inherit; text-align: left; cursor: pointer;
  }}
  .shot .frame {{ position: relative; display: block; }}
  .shot img {{ display: block; width: 100%; height: auto; border-radius: 2px; }}
  .shot .tight {{
    position: absolute; inset: var(--inset) 0; border: 1px dashed rgba(255, 255, 255, .9);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .3), inset 0 0 0 1px rgba(0, 0, 0, .3);
    pointer-events: none;
  }}
  .under {{ display: flex; gap: 8px; align-items: flex-start; margin-top: 6px; }}
  .shot .hero {{ display: block; flex: 0 0 52%; }}
  .cap {{
    display: flex; flex-direction: column; min-width: 0;
    font-size: 12px; font-variant-numeric: tabular-nums; line-height: 1.3;
  }}
  .cap i {{ font-style: normal; color: var(--muted); overflow: hidden; text-overflow: ellipsis;
    white-space: nowrap; }}
  .shot.is-current {{ border-color: var(--plum); }}
  .shot.is-current .cap b::before {{ content: "▸ "; color: var(--plum); }}
  .shot.is-alt {{ border-color: var(--orange); }}
  .shot[aria-pressed="true"] {{ outline: 3px solid var(--orange); outline-offset: 2px; }}
  .shot:focus-visible {{ outline: 3px solid var(--plum); outline-offset: 2px; }}
  .panel {{ border: 1px solid var(--edge); border-radius: 4px; padding: 18px;
    background: var(--surface); box-shadow: var(--shadow); }}
  .panel.warn {{ border-left: 4px solid var(--orange); }}
  .panel p {{ max-width: 78ch; }}
  .ask {{ font-weight: 700; }}
  .figs {{
    display: grid; gap: 14px; margin-top: 12px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }}
  figure {{ margin: 0; }}
  figure img {{ display: block; width: 100%; background: #fff; border: 1px solid var(--edge);
    border-radius: 3px; }}
  figure.wide img {{ background: var(--plum); }}
  figcaption {{ margin-top: 4px; font-size: 12px; color: var(--muted); }}
  .figs.done {{ grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }}
  figure.done img {{ border-color: var(--plum); }}
  figure.done figcaption {{ display: flex; justify-content: space-between; gap: 8px; }}
  figure.done b {{ color: var(--ink); }}
  figure.done span {{ font-variant-numeric: tabular-nums; }}
  code {{ font-family: ui-monospace, monospace; font-size: .92em; }}
  .tray {{
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 5;
    background: var(--surface); border-top: 2px solid var(--ink); box-shadow: var(--shadow);
    padding: 10px 24px; display: flex; gap: 14px; align-items: center;
  }}
  .tray output {{
    flex: 1; font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.4;
    max-height: 64px; overflow-y: auto; color: var(--ink);
  }}
  .tray .n {{ font-family: var(--display); font-weight: 800; font-size: 1.2rem; color: var(--plum);
    font-variant-numeric: tabular-nums; }}
  .tray button {{
    font: inherit; font-weight: 700; padding: 7px 14px; border-radius: 3px; cursor: pointer;
    border: 1px solid var(--ink); background: var(--ink); color: var(--ground);
  }}
  .tray button.ghost {{ background: transparent; color: var(--ink); }}
  @media (prefers-reduced-motion: no-preference) {{ html {{ scroll-behavior: smooth; }} }}
</style>

<div class="wrap">
  <header class="top">
    <h1>Cover picks</h1>
    <p class="lede"><b>{done} settled, {count} still open.</b> The open ones are re-shot against
    your briefs — every candidate is shown <b>at the crops it renders in</b>: the big frame is the
    listing card (2.10), the dashed inset is where the card slices it at 800–1024px, the small frame
    is the hero (1.78). The first tile in each row is the cover on the site today. <b>Click a tile
    to pick it</b>; the tray at the bottom collects the list to paste back to me. Nothing is
    uploaded until you do.</p>
    <nav class="jump"><a href="#settled">Settled</a>{nav}<a href="#chrome">Listing chrome</a></nav>
  </header>
  {settled}
  <h2>Round two — {count} open</h2>
  {sections}
  {chrome}
</div>

<div class="tray">
  <span class="n" id="count">0</span>
  <output id="picks">no picks yet</output>
  <button type="button" id="copy">Copy list</button>
  <button type="button" class="ghost" id="clear">Clear</button>
</div>

<script>
  const picks = new Map()
  const out = document.getElementById('picks')
  const n = document.getElementById('count')
  function render() {{
    n.textContent = picks.size
    out.textContent = picks.size ? [...picks.values()].join('\\n') : 'no picks yet'
  }}
  for (const el of document.querySelectorAll('.shot[data-pick]')) {{
    el.setAttribute('aria-pressed', 'false')
    el.addEventListener('click', () => {{
      const slug = el.dataset.slug
      for (const sib of document.querySelectorAll(`.shot[data-slug="${{slug}}"]`)) {{
        sib.setAttribute('aria-pressed', 'false')
      }}
      if (picks.get(slug) === el.dataset.pick) picks.delete(slug)
      else {{ picks.set(slug, el.dataset.pick); el.setAttribute('aria-pressed', 'true') }}
      render()
    }})
  }}
  document.getElementById('copy').addEventListener('click', async (e) => {{
    await navigator.clipboard.writeText(out.textContent)
    e.target.textContent = 'Copied'
    setTimeout(() => {{ e.target.textContent = 'Copy list' }}, 1200)
  }})
  document.getElementById('clear').addEventListener('click', () => {{
    picks.clear()
    for (const el of document.querySelectorAll('.shot[data-pick]')) el.setAttribute('aria-pressed', 'false')
    render()
  }})
</script>
"""


if __name__ == "__main__":
    main()
