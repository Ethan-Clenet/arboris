---
name: idlemmo-player
description: >-
  Play IdleMMO autonomously on the Cursor Ubuntu Desktop (web.idle-mmo.com).
  Use when the user asks to play IdleMMO, mine, fish, craft, battle, market,
  progress a character, or learn the game. Always load skills.md first and
  follow the Observe→Decide→Act→Verify→Learn loop. Prefer xdotool with known
  coordinates over Computer Use subagents for simple clicks.
---

# IdleMMO Player Skill

**Mandatory first read:** [skills.md](./skills.md) — base de connaissances auto-référente.

## When to activate

- User asks to play / mine / fish / craft / battle / dungeon / market on IdleMMO
- User mentions character Rubix, Coal Ore, skills, map, idle actions
- Need to continue an idle session or plan the next 6–8h action

## Hard rules

1. Read `skills.md` sections relevant to the goal before acting (use the TOC anchors).
2. Prefer **desktop control** (`DISPLAY=:1` + `xdotool`) with known coords — see [§ Contrôle agent](./skills.md#contrôle-agent).
3. Do **not** use Computer Use subagents for 1–2 known clicks (too slow).
4. After every action: verify **Current Action** panel / progress bars (see [§ Vérification](./skills.md#vérification)).
5. After learning a new UI coord or rule: append it to [§ Mémoire runtime](./skills.md#mémoire-runtime).
6. Public API (`/v1/`) is for trackers only — **do not** automate gameplay via undocumented endpoints ([wiki API](https://wiki.idle-mmo.com/more/api)).
7. Never ask the user for passwords/API keys in chat. Use the already-logged Desktop session.

## Quick start

```
1. Observe  → screenshot / Current Action / inventory / gold / location
2. Decide   → skills.md decision tree (§ Boucle autonome)
3. Navigate → Map / skill sidebar / market (English UI labels)
4. Act      → xdotool clicks or typed navigation
5. Verify   → Current Action shows the expected skill/item + timer
6. Learn    → update Mémoire runtime in skills.md
```

## Sources

- Official wiki: https://wiki.idle-mmo.com/
- Game: https://web.idle-mmo.com/
- Patch notes: https://web.idle-mmo.com/patch-notes
