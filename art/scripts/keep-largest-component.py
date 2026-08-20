#!/usr/bin/env python3
"""Remove detached pictograms/effects while preserving the connected mascot body."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def keep_largest(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    width, height = image.size
    seen: set[tuple[int, int]] = set()
    groups: list[list[tuple[int, int]]] = []
    for y in range(height):
        for x in range(width):
            if (x, y) in seen or alpha.getpixel((x, y)) <= 16:
                continue
            group: list[tuple[int, int]] = []
            queue = deque([(x, y)])
            seen.add((x, y))
            while queue:
                px, py = queue.popleft()
                group.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if not (0 <= nx < width and 0 <= ny < height):
                        continue
                    if (nx, ny) in seen or alpha.getpixel((nx, ny)) <= 16:
                        continue
                    seen.add((nx, ny))
                    queue.append((nx, ny))
            groups.append(group)
    if not groups:
        return
    keep = set(max(groups, key=len))
    pixels = image.load()
    for group in groups:
        for point in group:
            if point not in keep:
                pixels[point[0], point[1]] = (0, 0, 0, 0)
    image.save(path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("directory")
    args = parser.parse_args()
    directory = Path(args.directory).resolve()
    for path in sorted(directory.glob("*.png")):
        keep_largest(path)
    print(f"cleaned {directory}")


if __name__ == "__main__":
    main()
