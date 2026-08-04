# Refine home usługi media

## Why

The home services section still shows the July asset roster: the CONTENT tab's eight case-study screenshots and a three-clip KREACJE I WIDEO rail. Marketing delivered a fresh set of seven brand creatives (all 4:5 social-post exports) plus a new vertical reel, and wants the CONTENT collage rebuilt from them and the reel added as a fourth rail clip on desktop/tablet.

## What Changes

- **CONTENT panels — total replacement.** The eight mixed-ratio case-study screenshots give way to seven new 4:5 creatives (Burger King, Social Lama × DPD, Breville, pracuj.pl/iRobot/Vobis walentynki, Laurastar, Easy Egg, Kohersen). Because every new panel is 4:5 — much wider than the tall phone-screenshot ratios the current slots were tuned for — the desktop collage is re-laid-out as a 7-slot composition and the mobile trio geometry is retuned. Burger King takes the hero slot; Burger King, DPD and Breville form the mobile trio; the low-res Kohersen (576×720) lands in the smallest slot.
- **KREACJE I WIDEO — fourth clip on desktop/tablet.** The new reel (`ssstik.io_1785766720675.mp4`) joins the rail as the fourth clip, transcoded from HEVC to H.264 600×1066 with a poster and a tight ~12s trim to match its three siblings. Mobile keeps exactly today's three clips (the fourth is hidden below the desktop breakpoint).
- **Asset hygiene.** New images are optimized and land at `public/assets/content-<brand>.jpg` with descriptive PL alts and EN twins; the replaced panel sources stay untouched (they are live case-study gallery files).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `services-autoplay-tabs`: CONTENT stage roster changes from eight case-study screenshots to seven 4:5 brand creatives with a re-tuned collage; the video rail grows to four clips on desktop/tablet while mobile stays capped at three; the real-assets requirement now covers the new `content-*` images and the fourth transcoded clip.

## Impact

- `lib/content/home.ts` + `lib/content/home.en.ts` — CONTENT `panels` (8→7 entries, new srcs/dims/alts) and KREACJE `clips` (3→4 entries).
- `app/(frontend)/(home)/sections/services/services.module.css` — desktop CONTENT slot geometry (8→7 `nth-child` rules, 4:5-tuned), mobile trio widths, 4th `.phoneFrame` tilt rule, new mobile `.phoneFrame:nth-child(n + 4)` hide rule, low-desktop rail width nudge.
- `public/assets/content-*.jpg` (7 new optimized files), `public/clips/kreacje-*.mp4` + poster (1 new clip pair).
- No DB, no Payload schema, no route changes. Source files already downloaded to the session scratchpad (`scratchpad/uslugi-drive/`).
