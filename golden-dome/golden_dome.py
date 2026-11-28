#!/usr/bin/env python3
"""Procedural golden dome terminal art. Python 3.10+, NumPy only."""
from __future__ import annotations

import argparse
import math
import shutil
import signal
import sys
import time
from dataclasses import dataclass

import numpy as np

RESET = "\x1b[0m"
HIDE_CURSOR = "\x1b[?25l"
SHOW_CURSOR = "\x1b[?25h"
CLEAR = "\x1b[2J"
HOME = "\x1b[H"
CHARS = " .,:;irsXA253hMHGS#9B&@"


@dataclass
class Scene:
    width: int
    height: int
    frame: int = 0

    def __post_init__(self) -> None:
        self.width = max(40, int(self.width))
        self.height = max(18, int(self.height))
        self.zbuf = np.full((self.height, self.width), -1e9, dtype=np.float32)
        self.rgb = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        self.glyph = np.full((self.height, self.width), " ", dtype="<U1")
        self.aspect = (self.width / self.height) * 0.48

    def plot(self, x: np.ndarray, y: np.ndarray, depth: np.ndarray,
             light: np.ndarray, glyph: np.ndarray | str = "@") -> None:
        xi = np.rint(x).astype(np.int32)
        yi = np.rint(y).astype(np.int32)
        valid = (np.isfinite(xi) & np.isfinite(yi) & np.isfinite(depth)
                 & (xi >= 0) & (xi < self.width) & (yi >= 0) & (yi < self.height))
        if not np.any(valid):
            return
        xi, yi, depth, light = xi[valid], yi[valid], depth[valid], light[valid]
        idx = depth > self.zbuf[yi, xi]
        xi, yi, light = xi[idx], yi[idx], np.clip(light[idx], 0, 1)
        if not len(xi):
            return
        self.zbuf[yi, xi] = depth[idx]
        # Warm gold palette, with amber shadows and near-white specular highlights.
        r = 105 + 150 * light
        g = 48 + 160 * np.power(light, 1.35)
        b = 8 + 54 * np.power(light, 2.0)
        self.rgb[yi, xi] = np.stack((r, g, b), axis=1).astype(np.uint8)
        levels = np.minimum((light * (len(CHARS) - 1)).astype(int), len(CHARS) - 1)
        if isinstance(glyph, str):
            self.glyph[yi, xi] = glyph
        else:
            self.glyph[yi, xi] = glyph[valid][idx]

    def surface(self, radius: np.ndarray, z: np.ndarray, angle: np.ndarray,
                camera: float, spin: float, material: str = "gold") -> None:
        # Coordinates: z is vertical; camera rotates around the shrine.
        a = angle + spin
        xx = radius * np.cos(a)
        yy = radius * np.sin(a)
        ca, sa = math.cos(camera), math.sin(camera)
        vx = xx * ca - yy * sa
        vy = xx * sa + yy * ca
        # Surface normal from finite differences in the profile and azimuth.
        eps = 0.002
        if material == "dome":
            rp = dome_radius(np.clip(z + eps, 0, 1))
            rm = dome_radius(np.clip(z - eps, 0, 1))
            slope = (rp - rm) / (2 * eps)
            nx = np.cos(a)
            ny = np.sin(a)
            nz = -slope
            norm = np.sqrt(nx * nx + ny * ny + nz * nz)
            nx, ny, nz = nx / norm, ny / norm, nz / norm
        else:
            nx, ny, nz = np.cos(a), np.sin(a), np.zeros_like(a)
        # Rotate normals into camera coordinates.
        nnx = nx * ca - ny * sa
        nny = nx * sa + ny * ca
        # Fixed elevated key light plus animated reflection.
        lx, ly, lz = -0.42, -0.68, 0.78
        diffuse = np.maximum(0, nnx * lx + nny * ly + nz * lz)
        view = np.maximum(0, nny * -0.2 + nz * 0.98)
        spec = np.power(np.maximum(0, diffuse), 18)
        shimmer = 0.055 * (0.5 + 0.5 * np.sin(a * 17 + self.frame * 0.075 + z * 31))
        light = 0.16 + 0.66 * diffuse + 0.28 * spec + shimmer + 0.08 * view
        # Perspective projection with gentle camera elevation.
        elev = 0.22
        py = vy * math.sin(elev) + z * math.cos(elev)
        pz = vy * math.cos(elev) - z * math.sin(elev)
        focal = 3.2
        scale = focal / np.maximum(1.0, focal - pz)
        sx = self.width * 0.5 + vx * scale * self.width * 0.42
        sy = self.height * 0.79 - py * scale * self.height * 0.68
        self.plot(sx, sy, pz, light)

    def render(self, frame: int = 0) -> str:
        self.frame = frame
        self.zbuf.fill(-1e9)
        self.rgb.fill(0)
        self.glyph.fill(" ")
        cam = 0.22 * math.sin(frame * 0.018)
        spin = frame * 0.003
        # Architectural drum and stepped cornice.
        for z0, z1, rad in [(0.02, 0.13, 0.72), (0.13, 0.17, 0.78),
                            (0.17, 0.22, 0.70), (0.22, 0.28, 0.62)]:
            zz, aa = np.meshgrid(np.linspace(z0, z1, 12), np.linspace(0, 2*np.pi, 220))
            rr = np.full_like(zz, rad)
            self.surface(rr, zz, aa, cam, spin)
        # Main onion-shaped dome, sampled densely for a smooth terminal silhouette.
        zz, aa = np.meshgrid(np.linspace(0.27, 1.52, 170), np.linspace(0, 2*np.pi, 360))
        zn = (zz - 0.27) / 1.25
        rr = dome_radius(zn) * 0.82
        self.surface(rr, zn, aa, cam, spin, "dome")
        # Fine vertical ribs: narrow raised meridians following the dome profile.
        for k in range(16):
            ang = 2*np.pi*k/16
            zline = np.linspace(0.30, 1.49, 180)
            znl = (zline - 0.27) / 1.25
            rline = dome_radius(znl) * 0.82 + 0.012
            al = np.full_like(zline, ang)
            self.surface(rline, znl, al, cam, spin)
        # Decorative horizontal bands around the lower dome.
        for zn_band in (0.08, 0.13, 0.20, 0.28):
            a = np.linspace(0, 2*np.pi, 420)
            z = np.full_like(a, zn_band)
            r = dome_radius(z) * 0.824
            self.surface(r, z, a, cam, spin)
        # Finial stem and crescent, drawn as bright point curves.
        self._curve(np.array([[0, 0, 1.51], [0, 0, 1.60], [0, 0, 1.67]]), cam, spin, 1.0)
        t = np.linspace(-1.2, 1.2, 100)
        crescent = np.column_stack((0.12*np.sin(t), np.zeros_like(t), 1.77 + 0.15*np.cos(t)))
        self._curve(crescent, cam, spin, 1.0)
        inner = np.column_stack((0.09*np.sin(t)+0.045, np.zeros_like(t), 1.77 + 0.15*np.cos(t)))
        self._curve(inner, cam, spin, 0.82)
        # Small star above the crescent.
        self._curve(np.array([[0,0,1.96], [0,0,2.02]]), cam, spin, 1.0)
        return self.to_ansi()

    def _curve(self, points: np.ndarray, camera: float, spin: float, brightness: float) -> None:
        x, y, z = points.T
        ca, sa = math.cos(camera), math.sin(camera)
        vx = x*ca - y*sa
        vy = x*sa + y*ca
        py = vy*0.22 + z*math.cos(0.22)
        pz = vy*math.cos(0.22) - z*0.22
        scale = 3.2 / np.maximum(1.0, 3.2-pz)
        sx = self.width*0.5 + vx*scale*self.width*0.42
        sy = self.height*0.79 - py*scale*self.height*0.68
        self.plot(sx, sy, pz+0.01, np.full_like(sx, brightness), "+")

    def to_ansi(self) -> str:
        # Group adjacent cells with identical RGB values to reduce terminal writes.
        out: list[str] = []
        for y in range(self.height):
            row = self.glyph[y]
            colors = self.rgb[y]
            last = None
            for x, ch in enumerate(row):
                col = tuple(int(v) for v in colors[x])
                if col != last:
                    out.append(f"\x1b[38;2;{col[0]};{col[1]};{col[2]}m")
                    last = col
                out.append(ch)
            out.append(RESET)
            if y != self.height - 1:
                out.append("\n")
        return "".join(out)


def dome_radius(t: np.ndarray) -> np.ndarray:
    """Smooth onion profile, interpolated through architectural control points."""
    knots = np.array([0.0, 0.08, 0.18, 0.32, 0.48, 0.64, 0.78, 0.90, 1.0])
    radii = np.array([0.68, 0.82, 0.98, 1.00, 0.91, 0.72, 0.48, 0.22, 0.025])
    return np.interp(np.clip(t, 0, 1), knots, radii)


def main() -> int:
    parser = argparse.ArgumentParser(description="Golden Dome — procedural terminal art")
    parser.add_argument("--static", action="store_true", help="render one still frame")
    parser.add_argument("--width", type=int, default=0, help="terminal render width")
    parser.add_argument("--height", type=int, default=0, help="terminal render height")
    parser.add_argument("--fps", type=float, default=18.0, help="animation frame rate")
    args = parser.parse_args()
    if args.fps <= 0:
        parser.error("--fps must be greater than zero")
    running = True

    def stop(_sig: int, _frame: object) -> None:
        nonlocal running
        running = False

    signal.signal(signal.SIGINT, stop)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, stop)

    def dimensions() -> tuple[int, int]:
        size = shutil.get_terminal_size((100, 34))
        w = args.width or max(40, size.columns)
        h = args.height or max(18, size.lines - 1)
        return min(w, 220), min(h, 90)

    frame = 0
    try:
        if not args.static and sys.stdout.isatty():
            sys.stdout.write(HIDE_CURSOR + CLEAR)
        while running:
            w, h = dimensions()
            scene = Scene(w, h)
            art = scene.render(frame)
            sys.stdout.write(HOME + art + RESET + "\n")
            sys.stdout.flush()
            if args.static or not sys.stdout.isatty():
                break
            frame += 1
            time.sleep(1.0 / args.fps)
    finally:
        if sys.stdout.isatty():
            sys.stdout.write(RESET + SHOW_CURSOR + "\n")
            sys.stdout.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
