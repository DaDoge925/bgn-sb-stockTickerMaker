# Ticker JSON builder (tickerMaker)

Follow this file ONLY when I ask to build or update the monthly stock ticker JSON (e.g. "update the ticker", "build nov2026 json"). Ignore it for everything else.

## 1. CONFIG (the only block I edit each month)

```
CURR_MONTH = to be mentioned
PREV_MONTH = to be mentioned
CURR_MD    = to be mentioned
PREV_MD    = to be mentioned
PREV_JSON  =            # leave blank to use "tickerMaker/newsroom-stocks {PREV_MONTH}.json"; set it if that month has a "v2" or other variant
```

Derived, do not ask me for these:
- OUTPUT = `tickerMaker/newsroom-stocks {CURR_MONTH}.json`
- OLDER_JSONS = every other `tickerMaker/newsroom-stocks *.json`, sorted newest month first (ignore the output file itself)
- TILES = `tickerMaker/tiles/`

Find every file yourself with your own search tools. The aliases above are only hints: if a file is not attached, search the workspace for it (`tickerMaker/` first) by that name or month. Do not ask me for paths.

## 2. Working rules

- Use your own tools (file search, reading files, running terminal commands) to do the work. A script may help with the bulk parsing and arithmetic, but never rely on it blindly: spot-check its output against the markdown yourself, and use your search for anything it cannot match (names, icons, odd formatting).
- Read the files in portions to learn their format; do not paste whole markdown or JSON files into chat.
- Before the real run, assert these on the number parser: `900-1b`=950,000,000 | `1.6-1.8pb`=1,700,000,000 | `60–80m`=70,000,000 | `1-1.1b`=1,050,000,000 | `150-200k`=175,000 | `800m`=800,000,000.
- If something is ambiguous, pick the most reasonable reading, list it in the final report, and keep going. Do not stop to ask unless a file is missing.

## 3. Parsing the markdown (formats differ month to month)

Ignore / strip: code fences, `#` and `##` headings (use them only to detect the section), `[stable]`, `Stable`, `:x_arrow_up:`, `:x_arrow_down:`, `<:x_arrow_up:123...>` style Discord emoji, `~1` suffixes, replacement characters, trailing dots and colons, parenthetical notes like "(increasing)".

Sections to category (match headings loosely, e.g. "MVP ARMOUR SETS" / "MVP ARMORS" / "Armour sets"):
`ARMORS`, `WEAPONS` (MVP swords incl. "#1"/"#2"), `SEASONS` (VIP seasons), `TITLES`, `PETS` (normal and rare), `MVP ENCH` (DEF 1 sets), `OTHERS` (pet books/materials and "Other MVP").

Layouts to handle:
- Set items: a name line, then `4/4: price` and `5/5: price`. The colon may be missing (`5/5 3.5b`), and the `4/4` label may be missing (a bare price line right before the `5/5` line is the 4/4).
- Swords: `Normal:` and `Rare:` lines. Some items have only Normal.
- Pets: `P5:` ... `P10:` lines, or `5p` / `p5` styles. Normalize all to `P5`..`P10`. Rare pets appear as "Tiger Rare", "Shark Rare", "Narla/Narwhal (rare)" etc.
- Seasons: header `SEASON n: NAME`, then lines that hold two prices at once, e.g. `4/4: 25m   Sword: 20m` and `5/5: 40m   Bow: 5m` (Gun for S1 and S37). Split each into its own item.
- Titles and single-price items: name line, price on the next line (or the same line).
- Pet books: `Name`, then `Purple 100k`, `Yellow 40m` lines. Each colour is its own item.
- One line holding two different items (e.g. a base value and a "(Regain 4 hp)" value): split into two items; list it in the report.

### Prices
- Range = midpoint of low and high, rounded to an integer (JSON needs one number). Single value stays as is.
- Units: `k`=1e3, `m`=1e6, `b`=1e9; `pb` is a typo for `b`. Output plain integers, never strings.
- A bare number in a range takes the other end's unit, unless that makes low > high; then use the next smaller unit (`900-1b` is 900m to 1b).
- Treat `–`, `—`, `−`, and the replacement character as `-`.

## 4. Item names and aliases (match the existing JSON style)

- Armor: `Wrath Demon 4/4`, `Saturn 5/5`. Sets in the Other section: `Martial Spirit 4/4`.
- Sword: `Apollo Sword`; rare: `Apollo Sword (RR)`.
- Title: `Valk TT`, `Jorm TT`, `Fool's TT`, `Skyblock Classic TT`, `Prime Fighter TT`.
- DEF 1: `Thor DEF 1 4/4`, `Fool DEF 1 5/5`.
- Pet: `Pegasus P5`; rare pet: `Pegasus P5 RR` (P number first, then RR). Every P level is a separate item; never merge them.
- Season: `S1 Necrotic 4/4`, `S1 Necrotic 5/5`, `S1 Necrotic Sword`, `S1 Necrotic Gun` (or `Bow`).
- Pet book: `Revive (Purple)`, `Revive (Yellow)`; single-price items use just the name.
- Remove everything inside `[]` and any `:emoji:` from names. Use proper capitalization.
- Known aliases (markdown name to JSON name): `Fools SW`/`Fools Sword` = `Fool's Sword`; `Terra sky sword`/`Terra sky's.` = `Terra Sword`; `Wraith Knight` armor = `Wraith`; `Magician sw` = `Magician Sword`; `Chariot sw` = `Chariot Sword`; `Escape Dominator Title` = `Escape Dominator TT`; rare pet headings map to the normal pet's full name, then `P5 RR` etc. is appended per level: `Dragon Rare` = `Magic Flame Dragon`; `Fox Rare` = `Nine-Tailed Fox`; `Scorpio Rare` = `Flame Scorpion`; `Centaur Rare` = `Gale Breaker Centaur`; `Shark Rare` = `Polar Ice Shark`; `Tiger Rare` = `Roar Flame Tiger`; `T-rex Rare` = `Blaze Rex` (so `Dragon Rare` p5 becomes `Magic Flame Dragon P5 RR`).
- An item that exists in a previous JSON keeps that JSON's exact name and category. Only items never seen before use the section to category mapping above. Names the script cannot map confidently go in the report.
- Names must be unique inside a category. Fail loudly on duplicates.

## 5. prevPrice rules

For every item in CURR_MD (keep ALL of them, changed or not):
1. `currPrice` = parsed price from CURR_MD.
2. `prevPrice` = `currPrice` of that item in PREV_JSON.
3. Not there: median price of that item in PREV_MD.
4. Not there: `currPrice` of that item in OLDER_JSONS, newest first.
5. Not found anywhere: new item, `prevPrice` = `currPrice`.
- Items that are in the previous JSON but missing from CURR_MD are dropped.
- If rule 2 and rule 3 disagree for an item, keep rule 2 and count it in the report.

## 6. Icons

Per item, first match wins:
1. Icon already used for the same item name in PREV_JSON, then OLDER_JSONS.
2. Icon of the same base item in another variant (4/4 and 5/5, sword and rare sword, other P levels, DEF 1 uses the armor icon).
3. Search `tickerMaker/tiles/` filenames. Normalize the item name to lowercase and underscores and use patterns, not exact names. Observed patterns: `g1048_suit_{name}_armor.png`, `g1048_suit_{name}_sword_1.png` (normal) and `_sword_2.png` (rare), `g1048_{name}_title.png`, pets `pet_egg_*.png`. Known name quirks: Winter=`chione`, Helheim=`hel`, Judgment=`judicator`, Mercurius=`mercury`, Fool=`the_fool`, Mjollnir=`thor`. Look through the tiles folder yourself with your file search and judge the best match. If you are unsure between candidates, pick the likeliest and list it in the report. Leave blank only if nothing plausible exists.
4. Nothing found: `"icon": ""`.
- Icon values are written as `tickerMaker/tiles/<file>.png`.

## 7. Output format

Write OUTPUT as UTF-8 JSON, 2-space indent, categories in this order: ARMORS, WEAPONS, SEASONS, TITLES, PETS, MVP ENCH, OTHERS. Items follow the order in CURR_MD.

```json
[
  {
    "category": "ARMORS",
    "logo": "tickerMaker/classic/tiles/diamond_helmet.png",
    "items": [
      { "name": "Wrath Demon 4/4", "icon": "tickerMaker/tiles/g1048_suit_wrath_armor.png", "prevPrice": 725000000, "currPrice": 600000000 }
    ]
  }
]
```

Logos: ARMORS `tickerMaker/classic/tiles/diamond_helmet.png`, WEAPONS `.../diamond_sword.png`, TITLES `.../diamond.png`, PETS `.../flower01_32.png`, MVP ENCH `.../bluehelmet.png`. Reuse the logo from the previous JSON if the category exists there; SEASONS and OTHERS use `""` until I set one.

## 8. Final report (short, do not dump the JSON)

- Output path, item count per category.
- Counts: up / down / unchanged, new items (prev = curr), items dropped from last month.
- Items with blank icons (names only).
- Ambiguous parses and unmapped names (max ~20 lines).
- Number of rule 2 vs rule 3 prevPrice conflicts.
- Check: the JSON parses, every price is a positive integer, no duplicate names.
