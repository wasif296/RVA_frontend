import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, '../RVA_backend/package.json'));
const sharp = require('sharp');
const pub = path.join(root, 'public');
const markPath = path.join(root, 'src/assets/rva-mark.png');

const NAVY = '#021F4B';

function pngToIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 32;
  entry[1] = 32;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

async function tightCrop() {
  const { data, info } = await sharp(markPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const crop = {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
  console.log('source crop', crop);

  return sharp(markPath).extract(crop).png().toBuffer();
}

async function scaleToSquare(cropped, size, padPx) {
  const inner = Math.max(1, size - padPx * 2);
  const fitted = await sharp(cropped)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: fitted, left: padPx, top: padPx }])
    .png()
    .toBuffer();
}

const cropped = await tightCrop();

const icon16 = await scaleToSquare(cropped, 16, 1);
const icon32 = await scaleToSquare(cropped, 32, 1);
const icon180 = await scaleToSquare(cropped, 180, 8);
const icon192 = await scaleToSquare(cropped, 192, 8);
const icon512 = await scaleToSquare(cropped, 512, 20);

writeFileSync(path.join(pub, 'favicon-16x16.png'), icon16);
writeFileSync(path.join(pub, 'favicon-32x32.png'), icon32);
writeFileSync(path.join(pub, 'favicon.ico'), pngToIco(icon32));
writeFileSync(path.join(pub, 'apple-touch-icon.png'), icon180);
writeFileSync(path.join(pub, 'favicon-192x192.png'), icon192);
writeFileSync(path.join(pub, 'favicon-512x512.png'), icon512);

const manifest = {
  name: "RVA — Remote VA's Academy",
  short_name: 'RVA',
  description:
    "Build professional virtual assistant skills through lessons, quizzes, and graded exams.",
  icons: [
    { src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  ],
  theme_color: NAVY,
  background_color: NAVY,
  display: 'standalone',
  start_url: '/',
};

writeFileSync(path.join(pub, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log('wrote', {
  'favicon-16x16.png': icon16.length,
  'favicon-32x32.png': icon32.length,
  'apple-touch-icon.png': icon180.length,
  'favicon-192x192.png': icon192.length,
  'favicon-512x512.png': icon512.length,
});
