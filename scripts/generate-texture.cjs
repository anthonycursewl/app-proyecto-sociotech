/* global __dirname */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const SIZE = 256;
const DOT_SPACING = 32;
const DOT_RADIUS = 4.5;

const png = new PNG({ width: SIZE, height: SIZE });
// Initialize to transparent
for (let i = 0; i < png.data.length; i += 4) {
  png.data[i + 3] = 0;
}

const S2 = Math.SQRT2;
// Generate dots on a 45° rotated grid
const range = Math.ceil(SIZE / (DOT_SPACING / S2)) + 2;
for (let m = -range; m <= range; m++) {
  for (let n = -range; n <= range; n++) {
    const cx = (m + n) * DOT_SPACING / S2;
    const cy = (n - m) * DOT_SPACING / S2;

    // Only render if center is within the texture (plus radius margin)
    if (cx < -DOT_RADIUS || cx > SIZE + DOT_RADIUS || cy < -DOT_RADIUS || cy > SIZE + DOT_RADIUS) continue;

    const minX = Math.max(0, Math.floor(cx - DOT_RADIUS));
    const maxX = Math.min(SIZE - 1, Math.ceil(cx + DOT_RADIUS));
    const minY = Math.max(0, Math.floor(cy - DOT_RADIUS));
    const maxY = Math.min(SIZE - 1, Math.ceil(cy + DOT_RADIUS));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
        if (dist <= DOT_RADIUS) {
          const idx = (y * SIZE + x) * 4;
          const falloff = Math.max(0, 1 - dist / DOT_RADIUS);
          const alpha = Math.round(falloff * 255);
          png.data[idx] = 80;
          png.data[idx + 1] = 80;
          png.data[idx + 2] = 80;
          png.data[idx + 3] = Math.max(png.data[idx + 3], alpha);
        }
      }
    }
  }
}

const outPath = path.join(__dirname, "..", "assets", "images", "texture.png");
const buf = PNG.sync.write(png);
fs.writeFileSync(outPath, buf);
console.log("Generated:", outPath);
