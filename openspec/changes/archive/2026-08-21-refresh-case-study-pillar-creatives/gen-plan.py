#!/usr/bin/env python3
"""Generate `lib/payload/pillar-refresh-plan.ts` from this change's plan.md.

The alt text for 88 new media rows exists in exactly one place — the per-image
plan the owner reviewed — and it has to reach the database character for
character, in two locales. Retyping it into TypeScript is where a review
becomes a typo, so it is read out of the markdown instead:

    python3 openspec/changes/refresh-case-study-pillar-creatives/gen-plan.py

Run from the repo root. Re-run after editing plan.md's alt blocks; the pillar
structure below is the part that lives here, because a markdown table of
`from`/`to` sets would be the fragile half of the same trade.
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CHANGE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "lib", "payload", "pillar-refresh-plan.ts")

# slug -> pillar index -> (dropped filenames, added filenames in order).
# Verified against the dev database on 2026-08-21: every drop below is present
# on that pillar, and every index carries the tag named in plan.md.
OPS = {
    "a1-karting": {
        0: (["a1-karting-gallery-1-cut.webp"], ["a1-karting-gallery-8.jpg"]),
        1: (["a1-karting-gallery-2-cut.webp"], ["a1-karting-gallery-9.jpg"]),
        2: (["a1-karting-gallery-3-cut.webp", "a1-karting-gallery-4-cut.webp"],
            ["a1-karting-gallery-10.jpg", "a1-karting-gallery-11.jpg"]),
        3: (["a1-karting-gallery-5-cut.webp", "a1-karting-gallery-6-cut.webp"],
            ["a1-karting-gallery-12.jpg", "a1-karting-gallery-13.jpg"]),
        4: (["a1-karting-gallery-7-cut.webp"], []),
    },
    "ariadna": {
        0: (["ariadna-gallery-1-cut.webp", "ariadna-gallery-2.jpg", "ariadna-gallery-3.jpg"],
            ["ariadna-gallery-11.jpg", "ariadna-gallery-12.jpg"]),
        1: (["ariadna-gallery-4-cut.webp"], ["ariadna-gallery-13.jpg"]),
        3: (["ariadna-gallery-9-cut.webp"], []),
        4: (["ariadna-gallery-10.jpg"], ["ariadna-gallery-14.jpg"]),
    },
    "asus": {
        0: (["asus-gallery-1-cut.webp"], []),
        2: (["asus-gallery-5-cut.webp"], []),
        4: (["asus-gallery-7.jpg", "asus-gallery-8.jpg"], []),
    },
    "breville": {
        0: (["breville-gallery-1.jpg"], ["breville-gallery-7.jpg", "breville-gallery-8.jpg"]),
        1: (["breville-gallery-2.jpg"], ["breville-gallery-9.jpg"]),
        3: (["breville-gallery-6.jpg"],
            ["breville-gallery-10.jpg", "breville-gallery-11.jpg", "breville-gallery-12.jpg"]),
    },
    "dolina-charlotty": {
        1: (["dolina-charlotty-gallery-2-cut.webp"], []),
    },
    "dynamic-development": {
        0: ([], ["dynamic-development-gallery-7.jpg"]),
        2: (["dynamic-development-gallery-4-cut.webp", "dynamic-development-gallery-5-cut.webp"],
            ["dynamic-development-gallery-8.jpg", "dynamic-development-gallery-9.jpg"]),
        3: (["dynamic-development-gallery-6-cut.webp"], ["dynamic-development-gallery-10.jpg"]),
    },
    "ed-invest": {
        1: (["ed-invest-gallery-2-cut.webp"], []),
    },
    "engie": {
        0: (["engie-gallery-1-anon-cut.webp"], ["engie-gallery-7.jpg", "engie-gallery-8.jpg"]),
        1: (["engie-gallery-2-anon-cut.webp"], ["engie-gallery-9.jpg", "engie-gallery-10.jpg"]),
        2: (["engie-gallery-3-anon-cut.webp"], []),
        4: (["engie-gallery-5-anon-cut.webp", "engie-gallery-6-anon-cut.webp"],
            ["engie-gallery-11.jpg", "engie-gallery-12.jpg"]),
    },
    "entelo": {
        2: (["entelo-gallery-4-cut.webp", "entelo-gallery-6-cut.webp"],
            ["entelo-gallery-10.jpg", "entelo-gallery-11.jpg"]),
        3: (["entelo-gallery-7-cut.webp", "entelo-gallery-8-cut.webp"],
            ["entelo-gallery-12.jpg", "entelo-gallery-13.jpg"]),
    },
    "fm-logistics": {
        3: (["fm-logistics-employerbranding-1.jpg"], ["fm-logistics-employerbranding-2.jpg"]),
    },
    "foodsaver": {
        0: (["foodsaver-gallery-1.jpg"],
            ["foodsaver-gallery-4.jpg", "foodsaver-gallery-5.jpg", "foodsaver-gallery-6.jpg"]),
        1: (["foodsaver-gallery-2.jpg"], ["foodsaver-gallery-7.jpg"]),
        2: (["foodsaver-gallery-3.jpg"], ["foodsaver-gallery-8.jpg", "foodsaver-gallery-9.jpg"]),
    },
    "kbp": {
        0: (["kbp-gallery-1.jpg", "kbp-gallery-2.jpg"], []),
    },
    "kohersen": {
        0: (["kohersen-gallery-1.jpg", "kohersen-gallery-2.jpg"],
            ["kohersen-gallery-9.jpg", "kohersen-gallery-10.jpg"]),
        1: (["kohersen-gallery-3.jpg"], ["kohersen-gallery-11.jpg", "kohersen-gallery-12.jpg"]),
        2: (["kohersen-gallery-4.jpg"], ["kohersen-gallery-13.jpg", "kohersen-gallery-14.jpg"]),
    },
    "kontigo": {
        2: (["kontigo-gallery-4.jpg"], []),
    },
    "las-vegans": {
        0: (["las-vegans-gallery-1.jpg", "las-vegans-gallery-2.jpg"], []),
        1: (["las-vegans-gallery-4.jpg"], []),
        2: (["las-vegans-gallery-6.jpg"], []),
        4: (["las-vegans-gallery-9.jpg", "las-vegans-gallery-10.jpg"], []),
    },
    "laurastar": {
        0: (["laurastar-gallery-1-cut.webp"],
            ["laurastar-gallery-5.jpg", "laurastar-gallery-6.jpg", "laurastar-gallery-7.jpg"]),
        1: (["laurastar-gallery-2.jpg"],
            ["laurastar-gallery-8.jpg", "laurastar-gallery-9.jpg", "laurastar-gallery-10.jpg"]),
        2: (["laurastar-gallery-4-cut.webp"], ["laurastar-gallery-11.jpg"]),
    },
    "mazurska-manufaktura-alkoholi": {
        2: (["mazurska-manufaktura-alkoholi-gallery-5.jpg"], []),
    },
    "mercator": {
        0: (["mercator-gallery-1.jpg", "mercator-gallery-2.jpg"],
            ["mercator-gallery-9.jpg", "mercator-gallery-10.jpg"]),
        1: (["mercator-gallery-3-cut.webp"],
            ["mercator-gallery-11.jpg", "mercator-gallery-12.jpg"]),
        2: (["mercator-gallery-4-cut.webp", "mercator-gallery-5-cut.webp"],
            ["mercator-gallery-13.jpg", "mercator-gallery-14.jpg", "mercator-gallery-15.jpg"]),
        3: (["mercator-gallery-6-cut.webp", "mercator-gallery-7-cut.webp"],
            ["mercator-gallery-16.jpg"]),
        4: (["mercator-gallery-8.jpg"], []),
    },
    "personal-effect": {
        0: (["personal-effect-gallery-1-cut.webp", "personal-effect-gallery-2-cut.webp"],
            ["personal-effect-gallery-11.jpg", "personal-effect-gallery-12.jpg"]),
        1: (["personal-effect-gallery-3.jpg", "personal-effect-gallery-4.jpg"],
            ["personal-effect-gallery-13.jpg", "personal-effect-gallery-14.jpg"]),
        3: (["personal-effect-gallery-7.jpg", "personal-effect-gallery-8.jpg"],
            ["personal-effect-gallery-15.jpg", "personal-effect-gallery-16.jpg"]),
        4: ([], ["personal-effect-gallery-17.jpg"]),
    },
    "pracuj-pl": {
        0: ([], ["pracuj-pl-gallery-1.jpg"]),
        2: ([], ["pracuj-pl-gallery-2.jpg", "pracuj-pl-gallery-3.jpg"]),
        3: ([], ["pracuj-pl-gallery-4.jpg", "pracuj-pl-gallery-5.jpg"]),
    },
    "power-elements": {
        0: (["power-elements-gallery-1-cut.webp", "power-elements-gallery-2-cut.webp"],
            ["power-elements-gallery-10.jpg", "power-elements-gallery-11.jpg",
             "power-elements-gallery-12.jpg"]),
        1: (["power-elements-gallery-3.jpg", "power-elements-gallery-4-cut.webp"],
            ["power-elements-gallery-13.jpg"]),
        2: (["power-elements-gallery-5-cut.webp", "power-elements-gallery-6-cut.webp"],
            ["power-elements-gallery-14.jpg", "power-elements-gallery-15.jpg"]),
        3: (["power-elements-gallery-7-cut.webp"], []),
    },
    "stadler-form": {
        0: (["stadler-form-gallery-1.jpg", "stadler-form-gallery-2.jpg"],
            ["stadler-form-gallery-11.jpg", "stadler-form-gallery-12.jpg"]),
        1: (["stadler-form-gallery-3.jpg", "stadler-form-gallery-4.jpg"], []),
        2: (["stadler-form-gallery-5.jpg", "stadler-form-gallery-6.jpg"],
            ["stadler-form-gallery-13.jpg"]),
        3: (["stadler-form-gallery-7.jpg", "stadler-form-gallery-8.jpg"],
            ["stadler-form-gallery-14.jpg", "stadler-form-gallery-15.jpg"]),
    },
    "vobis": {
        0: (["vobis-gallery-1.jpg", "vobis-gallery-2.jpg"],
            ["vobis-gallery-5.jpg", "vobis-gallery-6.jpg", "vobis-gallery-7.jpg"]),
        1: (["vobis-gallery-3.jpg"],
            ["vobis-gallery-8.jpg", "vobis-gallery-9.jpg", "vobis-gallery-10.jpg"]),
        2: (["vobis-gallery-4-cut.webp"], []),
    },
    "volvo": {
        0: (["volvo-vcw-post-anon-cut.webp"], ["volvo-gallery-1.jpg", "volvo-gallery-2.jpg"]),
        1: (["volvo-vcw-goracy-anon-cut.webp"], ["volvo-gallery-3.jpg"]),
        3: (["volvo-konkurs-warsztat.jpg"],
            ["volvo-gallery-4.jpg", "volvo-gallery-5.jpg", "volvo-gallery-6.jpg"]),
    },
}

# Target filename -> the Drive file it was encoded from. The spec requires an
# origin for every replacement and the script refuses a row without one.
SOURCES = {
    "a1-karting-gallery-8.jpg": "A1Karting/493327521_1082966043858780_8113436834600735712_n.jpg",
    "a1-karting-gallery-9.jpg": "A1Karting/754015532_1461547042667343_888926444298767976_n.jpg",
    "a1-karting-gallery-10.jpg": "A1Karting/Zrzut ekranu 2026-08-20 o 16.33.30.png",
    "a1-karting-gallery-11.jpg": "A1Karting/Zrzut ekranu 2026-08-20 o 16.34.33.png",
    "a1-karting-gallery-12.jpg": "A1Karting/712269032_1407337288088319_946689192639002079_n.jpg",
    "a1-karting-gallery-13.jpg": "A1Karting/772178535_1473141981507849_1507529529558535917_n.jpg",
    "ariadna-gallery-11.jpg": "Ariadna/Zrzut ekranu 2026-08-20 o 15.54.09.png",
    "ariadna-gallery-12.jpg": "Ariadna/Zrzut ekranu 2026-08-20 o 15.54.30.png",
    "ariadna-gallery-13.jpg": "Ariadna/Zrzut ekranu 2026-08-20 o 15.55.14.png",
    "ariadna-gallery-14.jpg": "Ariadna/Zrzut ekranu 2026-08-20 o 15.55.53.png",
    "breville-gallery-7.jpg": "breville/594451694_868924128840347_3914302290942699982_n.jpg",
    "breville-gallery-8.jpg": "breville/614379847_895334206199339_3030327512633791789_n.jpg",
    "breville-gallery-9.jpg": "breville/684163416_979154617817297_4249043625140901793_n.jpg",
    "breville-gallery-10.jpg": "breville/629603811_913456344387125_123559123812105571_n.jpg",
    "breville-gallery-11.jpg": "breville/658242185_956784276720998_1459880214767815199_n.jpg",
    "breville-gallery-12.jpg": "breville/Zrzut ekranu 2026-08-20 o 15.13.56.png",
    "dynamic-development-gallery-7.jpg": "dynamic development/Zrzut ekranu 2026-08-20 o 16.45.56.png",
    "dynamic-development-gallery-8.jpg": "dynamic development/Zrzut ekranu 2026-08-20 o 16.45.43.png",
    "dynamic-development-gallery-9.jpg": "dynamic development/Zrzut ekranu 2026-08-20 o 16.46.07.png",
    "dynamic-development-gallery-10.jpg": "dynamic development/Zrzut ekranu 2026-08-20 o 16.46.26.png",
    "engie-gallery-7.jpg": "ENGIE/644335809_1240339684743849_1469008170995568934_n.jpg",
    "engie-gallery-8.jpg": "ENGIE/684817931_1291753976269086_5464050851041201007_n.jpg",
    "engie-gallery-9.jpg": "ENGIE/1778669032195.jpeg",
    "engie-gallery-10.jpg": "ENGIE/723675201_1324318073012676_8683771351082000389_n.jpg",
    "engie-gallery-11.jpg": "ENGIE/sprzedaż 1",
    "engie-gallery-12.jpg": "ENGIE/sprzedaż 2",
    "entelo-gallery-10.jpg": "Entelo/497845600_1294255309371486_6911605043553350752_n.jpg",
    "entelo-gallery-11.jpg": "Entelo/505303906_1314879410642409_918236179533522748_n.jpg",
    "entelo-gallery-12.jpg": "Entelo/495154339_1286092116854472_3180218082671986073_n.jpg",
    "entelo-gallery-13.jpg": "Entelo/496811563_1292373459559671_1857210440861797481_n.jpg",
    "fm-logistics-employerbranding-2.jpg":
        "Pexels 10541203 — https://www.pexels.com/photo/a-man-in-a-suit-standing-by-the-windows-10541203/",
    "foodsaver-gallery-4.jpg": "Foodsaver/651894644_1766928704717851_4141036283063212305_n.jpg",
    "foodsaver-gallery-5.jpg": "Foodsaver/683098284_1810169040393817_5270922757677103277_n.jpg",
    "foodsaver-gallery-6.jpg": "Foodsaver/684551676_1810166860394035_7788305411739426616_n.jpg",
    "foodsaver-gallery-7.jpg": "Foodsaver/763894969_1905176504226403_3248176006712551741_n.jpg",
    "foodsaver-gallery-8.jpg": "Foodsaver/494541972_1490690212341703_3586641406543239619_n.jpg",
    "foodsaver-gallery-9.jpg": "Foodsaver/606030222_1702707397806649_236837690219173832_n.jpg",
    "kohersen-gallery-9.jpg": "Kohersen/494760074_960008592990816_9035161479361039769_n (1).jpg",
    "kohersen-gallery-10.jpg": "Kohersen/633150794_1174909284834078_6053914903375607648_n.jpg",
    "kohersen-gallery-11.jpg": "Kohersen/Zrzut ekranu 2026-08-20 o 16.28.26.png",
    "kohersen-gallery-12.jpg": "Kohersen/Zrzut ekranu 2026-08-20 o 16.29.20.png",
    "kohersen-gallery-13.jpg": "Kohersen/560419038_1085650400426634_903074528035576042_n.jpg",
    "kohersen-gallery-14.jpg": "Kohersen/694463165_1247275750930764_3297689314223062661_n.jpg",
    "laurastar-gallery-5.jpg": "Laurastar/492810376_1191602819642455_1767217643963503705_n.jpg",
    "laurastar-gallery-6.jpg": "Laurastar/653708465_1478107137658687_8107918694848651288_n.jpg",
    "laurastar-gallery-7.jpg": "Laurastar/Zrzut ekranu 2026-08-20 o 15.24.01.png",
    "laurastar-gallery-8.jpg": "Laurastar/547098270_1313686134100789_7283056964596199204_n.jpg",
    "laurastar-gallery-9.jpg": "Laurastar/686135776_1517794080356659_5905651035736405081_n (1).jpg",
    "laurastar-gallery-10.jpg": "Laurastar/773450217_1614346400701426_2927462322582943599_n.jpg",
    "laurastar-gallery-11.jpg": "Laurastar/748096758_1590458776423522_4761183726666844050_n (1).jpg",
    "mercator-gallery-9.jpg": "Mercator/735150241_1561436302658911_842602233470016960_n.jpg",
    "mercator-gallery-10.jpg": "Mercator/735734788_1564337499035458_1770879368995867526_n.jpg",
    "mercator-gallery-11.jpg": "Mercator/741606684_1568852315250643_7218793640481486217_n.jpg",
    "mercator-gallery-12.jpg": "Mercator/747903077_1576164457852762_1820636940554379488_n.jpg",
    "mercator-gallery-13.jpg": "Mercator/752648878_1581089394026935_7335826461306289271_n.jpg",
    "mercator-gallery-14.jpg": "Mercator/768347799_1602716195197588_6259082466092656869_n.jpg",
    "mercator-gallery-15.jpg": "Mercator/780501887_1608805504588657_3605529103065340802_n.jpg",
    "mercator-gallery-16.jpg": "Mercator/768258396_1595076079294933_8209174210178631438_n.jpg",
    "personal-effect-gallery-11.jpg": "personal effect]/709056679_1603540981772602_4053752207792590234_n.jpg",
    "personal-effect-gallery-12.jpg": "personal effect]/711289389_1607594708033896_6270974361413616138_n.jpg",
    "personal-effect-gallery-13.jpg": "personal effect]/740462137_1643218331138200_6266412414301942084_n.jpg",
    "personal-effect-gallery-14.jpg": "personal effect]/744184621_1654066250053408_1188409071286615365_n.jpg",
    "personal-effect-gallery-15.jpg": "personal effect]/749419664_1654069306719769_6039330936708922673_n.jpg",
    "personal-effect-gallery-16.jpg": "personal effect]/752488686_1654066960053337_53691220816297657_n.jpg",
    "personal-effect-gallery-17.jpg": "personal effect]/771013274_1673940588065974_7212049234922991292_n.jpg",
    "pracuj-pl-gallery-1.jpg": "Pracuj/FUNNY 2",
    "pracuj-pl-gallery-2.jpg": "Pracuj/EDU 2",
    "pracuj-pl-gallery-3.jpg": "Pracuj/blur 2",
    "pracuj-pl-gallery-4.jpg": "Pracuj/FUNNY 1",
    "pracuj-pl-gallery-5.jpg": "Pracuj/FUNNY 3",
    "power-elements-gallery-10.jpg": "Power elements/Zrzut ekranu 2026-08-20 o 16.19.44.png",
    "power-elements-gallery-11.jpg": "Power elements/Zrzut ekranu 2026-08-20 o 16.20.17.png",
    "power-elements-gallery-12.jpg": "Power elements/687847548_122120472531217882_1085430501469714465_n.jpg",
    "power-elements-gallery-13.jpg": "Power elements/708570950_122122845987217882_1902443638978879061_n.jpg",
    "power-elements-gallery-14.jpg": "Power elements/Zrzut ekranu 2026-08-20 o 16.18.18.png",
    "power-elements-gallery-15.jpg": "Power elements/Zrzut ekranu 2026-08-20 o 16.18.42.png",
    "stadler-form-gallery-11.jpg": "stadler form/Zrzut ekranu 2026-08-20 o 15.26.51.png",
    "stadler-form-gallery-12.jpg": "stadler form/Zrzut ekranu 2026-08-20 o 15.27.44.png",
    "stadler-form-gallery-13.jpg": "stadler form/Zrzut ekranu 2026-08-20 o 15.31.14.png",
    "stadler-form-gallery-14.jpg": "stadler form/Zrzut ekranu 2026-08-20 o 15.28.16.png",
    "stadler-form-gallery-15.jpg": "stadler form/Zrzut ekranu 2026-08-20 o 15.30.43.png",
    "vobis-gallery-5.jpg": "vobis/505158865_1112738304218549_2790371875953765235_n.jpg",
    "vobis-gallery-6.jpg": "vobis/532442295_1164456692380043_1687323584962164229_n.jpg",
    "vobis-gallery-7.jpg": "vobis/641115465_1323360486489662_1887726884410063712_n.jpg",
    "vobis-gallery-8.jpg": "vobis/645442464_1331444539014590_826427371036096827_n.jpg",
    "vobis-gallery-9.jpg": "vobis/740686631_1434382532054123_7966537560837324703_n.jpg",
    "vobis-gallery-10.jpg": "vobis/765769977_1461478362677873_2152396828897010356_n.jpg",
    "volvo-gallery-1.jpg": "Volvo/509971582_1245657084238156_8844092174364490013_n.jpg",
    "volvo-gallery-2.jpg": "Volvo/511140235_1248790593924805_98060554743243544_n.jpg",
    "volvo-gallery-3.jpg": "Volvo/Zrzut ekranu 2026-08-20 o 14.46.32.png",
    "volvo-gallery-4.jpg": "Volvo/konkurs 1",
    "volvo-gallery-5.jpg": "Volvo/konkurs 2",
    "volvo-gallery-6.jpg": "Volvo/konkurs 3",
}

# Cover swaps: a new row and a repoint of the study's `cover` field, so the
# displaced cover survives as an orphan the way every other detached creative
# does. (slug, new filename, source, altPl, altEn)
COVERS = [
    (
        "power-elements",
        "power-elements-cover-2.jpg",
        "supplied by the owner 2026-08-21 (brand asset, 814×473)",
        "Zbliżenie na zielony proszek ułożony w koncentryczne kręgi",
        "A close-up of green powder raked into concentric circles",
    ),
]

# Bytes replaced in place on rows that already exist. `alt` is listed only where
# the crop makes the old description wrong ("w telefonie", "Zrzut posta").
BYTE_REPLACES = [
    ("fm-logistics", "fm-logistics-greensupply-1-cut.webp", True, "post frame cut away"),
    ("fm-logistics", "fm-logistics-gallery-3.jpg", False, "post frame cut away"),
    ("fm-logistics", "fm-logistics-crossdock-2.png", True, "post frame cut away"),
    ("entelo", "entelo-gallery-5-cut.webp", False, "phone mockup cut away"),
    ("dolina-charlotty", "dolina-charlotty-gallery-3-cut.webp", True, "phone mockup cut away"),
    ("dolina-charlotty", "dolina-charlotty-gallery-4-cut.webp", True, "phone mockup cut away"),
    ("dolina-charlotty", "dolina-charlotty-gallery-5-cut.webp", True, "phone mockup cut away"),
]

# Pillar tags and current contents, read from the dev database on 2026-08-21.
# `from` is built from this: the guard has to compare against what the plan was
# written against, not against whatever the target database holds now.
STATE = {}


def read_state():
    """(slug, index) -> (tagPl, tagEn, [current filenames])."""
    text = open(os.path.join(CHANGE, "pillar-state.tsv"), encoding="utf-8").read()
    for line in text.splitlines():
        if not line or line.startswith("#"):
            continue
        slug, idx, pl, en, files = line.split("\t")
        STATE[(slug, int(idx))] = (pl, en, [f for f in files.split(",") if f])


def read_alts():
    """`filename -> (pl, en)` from plan.md's per-file alt blocks."""
    text = open(os.path.join(CHANGE, "plan.md"), encoding="utf-8").read()
    alts = {}
    pattern = re.compile(
        r"^- `([^`]+)`.*?\n\s+- PL: (.+?)\n\s+- EN: (.+?)$", re.M | re.S
    )
    for m in re.finditer(r"^- `([^`]+)`[^\n]*\n", text, re.M):
        name = m.group(1)
        rest = text[m.end():]
        pl = re.match(r"\s+- PL: (.+)", rest)
        if not pl:
            continue
        after = rest[pl.end():]
        en = re.match(r"\n\s+- EN: (.+)", after)
        if not en:
            continue
        alts[name] = (pl.group(1).strip(), en.group(1).strip())
    return alts


def ts(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def main():
    read_state()
    alts = read_alts()
    missing = []

    pillar_rows = []
    new_rows = []
    seen_new = set()
    for slug in sorted(OPS):
        for idx in sorted(OPS[slug]):
            drops, adds = OPS[slug][idx]
            state = STATE.get((slug, idx))
            if not state:
                sys.exit(f"pillar-state.tsv has no row for {slug} pillar {idx}")
            tag_pl, tag_en, current = state
            for d in drops:
                if d not in current:
                    sys.exit(
                        f"{slug} pillar {idx}: plan drops {d}, which the pillar "
                        f"does not hold ({', '.join(current) or 'nothing'})"
                    )
            keep = [f for f in current if f not in drops]
            pillar_rows.append((slug, idx, tag_pl, tag_en, current, keep + adds))
            for file in adds:
                if file in seen_new:
                    continue
                seen_new.add(file)
                if file not in SOURCES:
                    missing.append(f"{file}: no source")
                if file not in alts:
                    missing.append(f"{file}: no alt in plan.md")
                    continue
                new_rows.append((file, slug, alts[file][0], alts[file][1], SOURCES.get(file, "")))

    if missing:
        sys.exit("plan is incomplete:\n  " + "\n  ".join(missing))

    out = ['''/**
 * The reviewed plan, as data. GENERATED — edit plan.md and re-run
 * `openspec/changes/refresh-case-study-pillar-creatives/gen-plan.py`.
 *
 * `from`/`to` are filenames rather than ids because ids are per-database: id 1
 * is `tiktok.png` on dev and `blog-1.png` on production. `from` is what the
 * pillar is expected to hold at write time, so a study edited since the review
 * reports stale instead of being overwritten.
 */

export type PillarOp = {
  slug: string
  /** Index into `approach`; the tags are asserted, the index is not trusted. */
  pillar: number
  tagPl: string
  tagEn: string
  /** Filenames expected now (the ones kept plus the ones detached). */
  from: string[]
  /** Filenames afterwards, in render order. */
  to: string[]
}

export type NewMedia = {
  file: string
  /** Folder under `public/case-studies/` holding the encoded bytes. */
  slug: string
  altPl: string
  altEn: string
  /** Drive path or licensed-photo URL. A row without one is never uploaded. */
  source: string
}

export type CoverSwap = {
  slug: string
  file: string
  altPl: string
  altEn: string
  source: string
}

export type ByteReplace = {
  file: string
  slug: string
  altPl?: string
  altEn?: string
  note: string
}
''']

    out.append("export const PILLAR_OPS: PillarOp[] = [")
    for slug, idx, tag_pl, tag_en, frm, to in pillar_rows:
        out.append(
            f"  {{\n    slug: {ts(slug)},\n    pillar: {idx},\n"
            f"    tagPl: {ts(tag_pl)},\n    tagEn: {ts(tag_en)},"
        )
        out.append(f"    from: [{', '.join(ts(d) for d in frm)}],")
        out.append(f"    to: [{', '.join(ts(a) for a in to)}],\n  }},")
    out.append("]\n")

    out.append("export const NEW_MEDIA: NewMedia[] = [")
    for file, slug, pl, en, src in new_rows:
        out.append(f"  {{\n    file: {ts(file)},\n    slug: {ts(slug)},")
        out.append(f"    altPl:\n      {ts(pl)},")
        out.append(f"    altEn:\n      {ts(en)},")
        out.append(f"    source: {ts(src)},\n  }},")
    out.append("]\n")

    out.append("export const COVERS: CoverSwap[] = [")
    for slug, file, src, pl, en in COVERS:
        out.append(f"  {{\n    slug: {ts(slug)},\n    file: {ts(file)},")
        out.append(f"    altPl: {ts(pl)},")
        out.append(f"    altEn: {ts(en)},")
        out.append(f"    source: {ts(src)},\n  }},")
    out.append("]\n")

    out.append("export const BYTE_REPLACES: ByteReplace[] = [")
    for slug, file, realt, note in BYTE_REPLACES:
        out.append(f"  {{\n    file: {ts(file)},\n    slug: {ts(slug)},")
        if realt:
            if file not in alts:
                sys.exit(f"{file}: marked for new alt but plan.md has none")
            out.append(f"    altPl:\n      {ts(alts[file][0])},")
            out.append(f"    altEn:\n      {ts(alts[file][1])},")
        out.append(f"    note: {ts(note)},\n  }},")
    out.append("]")

    open(OUT, "w", encoding="utf-8").write("\n".join(out) + "\n")
    print(
        f"{os.path.relpath(OUT, ROOT)}: {len(pillar_rows)} pillar ops, "
        f"{len(new_rows)} new media, {len(COVERS)} cover swap(s), "
        f"{len(BYTE_REPLACES)} byte replacements"
    )


if __name__ == "__main__":
    main()
