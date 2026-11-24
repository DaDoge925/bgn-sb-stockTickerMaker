# Ticker JSON Agent Notes

## Target files

- For the November 2026 ticker, edit `newsroom-stocks nov2026.json`.
- Keep the unsuffixed monthly JSON as the full version; do not edit a suffixed variant unless explicitly asked.
- Keep each month's JSON aligned with its Markdown pricing source.

## Changes-only JSON variants

- A filename ending in `C` before `.json` is a changes-only version: include only items whose `prevPrice` and `currPrice` differ. For example, `newsroom-stocks nov2026 C.json`.
- A filename ending in `CS` before `.json` is a changes-only, shuffled version: apply the same filter as `C`, then shuffle item order within each category. For example, `newsroom-stocks nov2026 CS.json`.
- Preserve categories and their order when creating either variant. `CS` includes both the changes-only filter and the shuffle.

## VIP season pricing format

A season price line can contain two different items. Parse each label and value independently:

- `4/4: 60m  Sword: 25m` means 4/4 armor is 60m and the sword is 25m.
- `5/5: 80m  Bow: 25m` means 5/5 armor is 80m and the bow is 25m.
- Some seasons use `Gun` instead of `Bow`.
- A missing colon after `5/5` does not change the meaning.
- Do not assign the weapon price to the armor. Keep each as its own item, e.g. `S45 Gale Ninja 4/4`, `S45 Gale Ninja Sword`, `S45 Gale Ninja 5/5`, and `S45 Gale Ninja Bow`.
- Parse price ranges as their midpoint, rounded to an integer, using the specified units.

## Historical `prevPrice` checks

- Check earlier pricing Markdown files when reviewing season `prevPrice`; do not assume `prevPrice` should equal `currPrice` just because recent months show the same current price.
- If an earlier documented price differs from the existing `prevPrice`, use the historical value when it is supported by the source history and the user has asked for historical prices to take priority. If the historical value already equals `prevPrice`, leave it unchanged.
- In the November 2026 season review, July and August agree that Gale Ninja armor was 25m (4/4) and 45m (5/5). October and November list 60m and 80m. The user chose the older values for November's `prevPrice`; preserve 25,000,000 and 45,000,000 respectively, while keeping `currPrice` at 60,000,000 and 80,000,000.
- No other season items showed this same July/August discrepancy after parsing ranges correctly. The September 2026 pricing list has no season prices; July and August cover seasons 1-45.

## Category logo reference

When updating category logos for the November 2026 ticker, use these exact paths:

- `ARMORS`: `tickerMaker/classic/tiles/btn_weapon_strong2.png`
- `WEAPONS`: `tickerMaker/classic/tiles/btn_weapon_strong.png`
- `SEASONS`: `tickerMaker/classic/tiles/btn_survial.png`
- `TITLES`: `tickerMaker/classic/tiles/btn_world_vip.png`
- `PETS`: `tickerMaker/classic/tiles/btn_vip.png`
- `MVP ENCH`: `tickerMaker/classic/tiles/btn_task.png`
- `OTHERS`: `tickerMaker/classic/tiles/btn_shop.png`

When the user provides this reference for logo updates, modify only each category's `logo` value. Preserve all item names, icons, prices, category order, and other JSON fields.

## MVP sword icon variants

When resolving `icon` values for a new newsroom stock index (see `.github/copilot-instructions.md`, Section 6 "Icons"), items declared under MVP swords in the raw pricing Markdown (e.g., `MVP SWORDS` / `# MVP SWORDS #1` / `MVP swords #2` in `november2026pricing.md`, mapped to `WEAPONS`) often have both Normal and Rare (`(RR)`) entries. Swords declared under `SEASONS` (`VIP SECTION` in `november2026pricing.md`) are **not** included in this rule and are excluded from this `_1.png` / `_2.png` mapping:

- If `tickerMaker/tiles/` contains two sword variants ending in `_1.png` and `_2.png` (such as `g1048_suit_{name}_sword_1.png` and `g1048_suit_{name}_sword_2.png`), always assign `_1.png` to the Normal sword and `_2.png` to the `(RR)` sword.
- If the two variants are an unsuffixed `.png` and `_2.png` (such as `g1048_suit_aquaman_sword.png` and `g1048_suit_aquaman_sword_2.png` for `Poseidon Trident`), assign the unsuffixed `.png` to the Normal sword and `_2.png` to the `(RR)` sword.
- Do not reuse a `(RR)` item's `_2.png` icon for its Normal counterpart (or vice versa, e.g., in `Zeus Lightning` do not copy `g1048_suit_zeus_sword_2.png` onto the Normal item when `g1048_suit_zeus_sword_1.png` exists in `tickerMaker/tiles/`). Always check `tickerMaker/tiles/` for the matching `_1.png` and `_2.png` pair before falling back to another variant or an armor icon.

