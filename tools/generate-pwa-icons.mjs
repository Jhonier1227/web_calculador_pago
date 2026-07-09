import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'icons');

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

const SIZES = [192, 512];
const BG = '#059669';

async function generate() {
  for (const size of SIZES) {
    const r = Math.round(size * 0.2);
    const c = Math.round(size * 0.5);
    const circleR = Math.round(size * 0.3);

    // Base rounded rect with inner circle
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${BG}"/>
  <circle cx="${c}" cy="${c}" r="${circleR}" fill="rgba(255,255,255,0.12)"/>
</svg>`;

    const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
    writeFileSync(join(publicDir, `icon-${size}x${size}.png`), png);
    console.log(`Generated icon-${size}x${size}.png (${(png.length / 1024).toFixed(1)} KB)`);
  }

  // Maskable icon (512 with extra safe area via padding)
  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="102" fill="${BG}"/>
  <circle cx="256" cy="256" r="140" fill="rgba(255,255,255,0.12)"/>
</svg>`;
  const maskPng = await sharp(Buffer.from(maskSvg)).resize(512, 512).png().toBuffer();
  writeFileSync(join(publicDir, 'maskable-icon-512x512.png'), maskPng);
  console.log(`Generated maskable-icon-512x512.png (${(maskPng.length / 1024).toFixed(1)} KB)`);
}

generate().catch(console.error);
