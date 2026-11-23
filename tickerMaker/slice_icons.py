"""Slice square sprite sheets into individual tiles.

Usage:
    python slice_icons.py
    python slice_icons.py --input icons --output icons/tiles --tile-size 32 --gap-x 1 --gap-y 1
"""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image


IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def slice_image(
    image_path: Path,
    output_root: Path,
    tile_size: int,
    offset_x: int,
    offset_y: int,
    gap_x: int,
    gap_y: int,
) -> int:
    with Image.open(image_path) as image:
        width, height = image.size
        if offset_x >= width or offset_y >= height:
            raise ValueError(
                f"Offset ({offset_x}, {offset_y}) is outside {image_path.name} ({width}x{height})."
            )

        columns = (width - offset_x + gap_x) // (tile_size + gap_x)
        rows = (height - offset_y + gap_y) // (tile_size + gap_y)
        output_dir = output_root / image_path.stem
        output_dir.mkdir(parents=True, exist_ok=True)

        tile_count = 0
        for row in range(rows):
            for column in range(columns):
                left = offset_x + column * (tile_size + gap_x)
                top = offset_y + row * (tile_size + gap_y)
                tile = image.crop((left, top, left + tile_size, top + tile_size))
                tile.save(output_dir / f"tile_r{row:02d}_c{column:02d}.png")
                tile_count += 1

    return tile_count


def main() -> None:
    parser = ArgumentParser(description="Slice images into square PNG tiles.")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("icons"),
        help="Folder containing source images (default: icons)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("icons") / "tiles",
        help="Folder for generated tile folders (default: icons/tiles)",
    )
    parser.add_argument(
        "--tile-size",
        type=int,
        default=32,
        help="Tile width and height in pixels (default: 32)",
    )
    parser.add_argument(
        "--offset-x",
        type=int,
        default=0,
        help="Starting horizontal pixel offset (default: 0)",
    )
    parser.add_argument(
        "--offset-y",
        type=int,
        default=0,
        help="Starting vertical pixel offset (default: 0)",
    )
    parser.add_argument(
        "--gap-x",
        type=int,
        default=1,
        help="Horizontal gap between tiles in pixels (default: 1)",
    )
    parser.add_argument(
        "--gap-y",
        type=int,
        default=1,
        help="Vertical gap between tiles in pixels (default: 1)",
    )
    args = parser.parse_args()

    if args.tile_size <= 0:
        parser.error("--tile-size must be greater than zero")
    if args.offset_x < 0 or args.offset_y < 0:
        parser.error("Offsets must be zero or greater")
    if args.gap_x < 0:
        parser.error("--gap-x must be zero or greater")
    if args.gap_y < 0:
        parser.error("--gap-y must be zero or greater")
    if not args.input.is_dir():
        parser.error(f"Input folder does not exist: {args.input}")

    image_paths = sorted(
        path
        for path in args.input.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )
    if not image_paths:
        parser.error(f"No supported images found in {args.input}")

    for image_path in image_paths:
        try:
            tile_count = slice_image(
                image_path,
                args.output,
                args.tile_size,
                args.offset_x,
                args.offset_y,
                args.gap_x,
                args.gap_y,
            )
        except (OSError, ValueError) as error:
            parser.error(str(error))
        print(f"{image_path.name}: wrote {tile_count} tiles")


if __name__ == "__main__":
    main()