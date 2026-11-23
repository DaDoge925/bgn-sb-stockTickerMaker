#!/usr/bin/env python3
"""
slice_classic.py

Splits the "classic" items sprite sheet (items.png + items.json, TexturePacker
"hash" atlas format) into individual tile images, using the "frame", "offset",
and "sourceSize" data from the JSON to crop and (if needed) pad each tile back
to its original, un-trimmed size.

Note: this atlas is NOT a uniform fixed-size grid -- most frames are 32x32,
but a handful (e.g. "bucket_empty", "flint_and_steel") are 32x36, which
throws off any fixed row/column pitch. This script therefore reads each
frame's exact x/y/w/h straight from the JSON rather than computing tile
positions from grid math, so it works regardless of packing irregularities.

Usage:
    python slice_classic.py <image.png> <atlas.json> [output_dir]

Example:
    python slice_classic.py items.png items.json tiles_classic/
"""

import json
import os
import sys

from PIL import Image


def sanitize_filename(name: str) -> str:
    """Make a frame name safe to use as a filename."""
    keep = "-_.() "
    safe = "".join(c if c.isalnum() or c in keep else "_" for c in name)
    return safe.strip() or "unnamed"


def slice_sprite_sheet(image_path: str, json_path: str, output_dir: str) -> None:
    with open(json_path, "r", encoding="utf-8") as f:
        atlas = json.load(f)

    frames = atlas.get("frames", {})
    if not frames:
        print("No frames found in JSON.")
        return

    sheet = Image.open(image_path).convert("RGBA")

    os.makedirs(output_dir, exist_ok=True)

    manifest = {}  # keeps a record of what was produced, for reference

    for name, data in frames.items():
        frame = data["frame"]
        offset = data.get("offset", {"x": 0, "y": 0})
        source_size = data.get("sourceSize", {"w": frame["w"], "h": frame["h"]})
        rotated = data.get("rotated", False)
        trimmed = data.get("trimmed", False)

        fx, fy, fw, fh = frame["x"], frame["y"], frame["w"], frame["h"]

        # Crop the exact region out of the sheet using this frame's own
        # x/y/w/h -- no grid math, since this atlas is irregularly packed.
        tile = sheet.crop((fx, fy, fx + fw, fy + fh))

        # Some atlases store rotated regions (w/h swapped in the sheet).
        # Rotate back if the atlas says so.
        if rotated:
            tile = tile.rotate(90, expand=True)

        # If the sprite was trimmed (transparent edges removed) or the
        # cropped frame doesn't already match the full sourceSize, place
        # it onto a canvas of sourceSize using offset.x/offset.y, so the
        # output tile matches the original, un-trimmed sprite dimensions.
        # (This atlas's "offset" objects also carry redundant w/h fields
        # mirroring sourceSize -- only offset.x/offset.y are used here.)
        sw, sh = source_size.get("w", fw), source_size.get("h", fh)
        ox, oy = offset.get("x", 0), offset.get("y", 0)

        if trimmed or (sw, sh) != (fw, fh):
            canvas = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
            canvas.paste(tile, (ox, oy), tile)
            tile = canvas

        safe_name = sanitize_filename(name)
        out_path = os.path.join(output_dir, f"{safe_name}.png")

        # Avoid collisions if sanitizing produced a duplicate name.
        counter = 1
        base_out_path = out_path
        while os.path.exists(out_path):
            root, ext = os.path.splitext(base_out_path)
            out_path = f"{root}_{counter}{ext}"
            counter += 1

        tile.save(out_path)

        manifest[name] = {
            "file": os.path.basename(out_path),
            "frame": frame,
            "offset": offset,
            "sourceSize": source_size,
            "rotated": rotated,
            "trimmed": trimmed,
        }

    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"Extracted {len(frames)} tiles to '{output_dir}'")
    print(f"Manifest written to '{manifest_path}'")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    image_path = sys.argv[1]
    json_path = sys.argv[2]
    output_dir = sys.argv[3] if len(sys.argv) > 3 else "tiles_classic"

    slice_sprite_sheet(image_path, json_path, output_dir)


if __name__ == "__main__":
    main()