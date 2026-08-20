#!/usr/bin/env python3
"""Register two generated look rows to one coherent 16-direction family."""

from __future__ import annotations

import argparse
import importlib.util
import json
import statistics
import sys
from pathlib import Path

from PIL import Image


DIRECTIONS = [
    "000", "022.5", "045", "067.5", "090", "112.5", "135", "157.5",
    "180", "202.5", "225", "247.5", "270", "292.5", "315", "337.5",
]


def load_assembler(script_path: Path):
    sys.path.insert(0, str(script_path.parent))
    spec = importlib.util.spec_from_file_location("hatch_assemble", script_path)
    if spec is None or spec.loader is None:
        raise SystemExit(f"cannot load {script_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--row-9", required=True)
    parser.add_argument("--row-10", required=True)
    parser.add_argument("--assembler", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--json-out", required=True)
    parser.add_argument("--chroma-key", default="#00FF00")
    args = parser.parse_args()

    assembler = load_assembler(Path(args.assembler).resolve())
    row_9 = assembler.load_registered_row(Path(args.row_9).resolve())
    row_10 = assembler.extract_row_strip_cells(
        Path(args.row_10).resolve(), assembler.parse_hex_color(args.chroma_key), 96.0
    )

    row_9_geometry = [assembler.cell_geometry(cell) for cell in row_9]
    row_10_geometry = [assembler.cell_geometry(cell) for cell in row_10]
    if any(item is None for item in [*row_9_geometry, *row_10_geometry]):
        raise SystemExit("all look cells must contain visible pixels")

    row_9_geometry = [item for item in row_9_geometry if item is not None]
    row_10_geometry = [item for item in row_10_geometry if item is not None]
    target_height = statistics.median(item.height for item in row_9_geometry)
    source_height = statistics.median(item.height for item in row_10_geometry)
    target = assembler.CellGeometry(
        height=round(target_height),
        lower_center_x=statistics.median(item.lower_center_x for item in row_9_geometry),
        bottom=round(statistics.median(item.bottom for item in row_9_geometry)),
    )
    scale = target_height / source_height

    # Apply one family-wide scale to row 10 and keep a safety margin in each cell.
    max_width = max(cell.getbbox()[2] - cell.getbbox()[0] for cell in row_10)
    max_height = max(item.height for item in row_10_geometry)
    scale = min(scale, 182 / max_width, 198 / max_height)
    row_10_registered = [
        assembler.normalize_cell_to_geometry(cell, target, scale) for cell in row_10
    ]

    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    for direction, cell in zip(DIRECTIONS, [*row_9, *row_10_registered]):
        cell.save(output_dir / f"{direction}.png")

    manifest = {
        "ok": True,
        "directions": DIRECTIONS,
        "row9MedianHeight": target_height,
        "row10SourceMedianHeight": source_height,
        "row10AppliedScale": scale,
        "targetBottom": target.bottom,
        "targetLowerCenterX": target.lower_center_x,
    }
    json_path = Path(args.json_out).resolve()
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
