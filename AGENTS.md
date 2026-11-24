# Ticker JSON Agent Notes

## Target files

- For the November 2026 ticker, edit `newsroom-stocks nov2026.json`.
- Do not edit `newsroom-stocks nov2026C.json` unless explicitly asked; it is the wrong variant.
- Keep each month's JSON aligned with its Markdown pricing source.

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
