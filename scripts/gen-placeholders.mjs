/**
 * 生成示例占位图（只用于首次上线的示例内容）。
 *
 * 用法：node scripts/gen-placeholders.mjs
 * 生成位置：public/images/** 与 public/og-default.jpg
 *
 * 这些图带 "SAMPLE" 水印，提示它们是占位图而不是真实测试结果；
 * 换成自己的作品后，直接删除对应文件即可。
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const palettes = {
  linen: ['#f6efe2', '#e3d2b8', '#c39b70'],
  walnut: ['#efe3d2', '#d8c0a3', '#a8764f'],
  moss: ['#f1f0e6', '#d9dcc8', '#8b947a'],
  clay: ['#f6ece4', '#e2c9b8', '#b98a6c'],
};

function art({ width, height, palette, label = 'SAMPLE' }) {
  const [light, mid, dark] = palettes[palette] ?? palettes.linen;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${light}" />
        <stop offset="1" stop-color="${mid}" />
      </linearGradient>
      <radialGradient id="glow" cx="30%" cy="24%" r="70%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.85" />
        <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <pattern id="grain" width="9" height="9" patternUnits="userSpaceOnUse">
        <path d="M0 0V9" stroke="${dark}" stroke-opacity="0.06" stroke-width="1.4" />
      </pattern>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <rect width="${width}" height="${height}" fill="url(#grain)" />
    <rect width="${width}" height="${height}" fill="url(#glow)" />

    <g fill="none" stroke="${dark}" stroke-opacity="0.22" stroke-width="2">
      <circle cx="${width * 0.68}" cy="${height * 0.42}" r="${height * 0.3}" />
      <circle cx="${width * 0.68}" cy="${height * 0.42}" r="${height * 0.22}" />
      <circle cx="${width * 0.68}" cy="${height * 0.42}" r="${height * 0.14}" />
    </g>

    <path d="M0 ${height * 0.78} Q ${width * 0.3} ${height * 0.62} ${width * 0.55} ${height * 0.8} T ${width} ${height * 0.72} V ${height} H0 Z"
      fill="${dark}" fill-opacity="0.16" />
    <path d="M0 ${height * 0.88} Q ${width * 0.35} ${height * 0.74} ${width * 0.62} ${height * 0.9} T ${width} ${height * 0.84} V ${height} H0 Z"
      fill="${dark}" fill-opacity="0.22" />

    <g opacity="0.5">
      <text x="${width * 0.06}" y="${height * 0.13}" font-family="Helvetica, Arial, sans-serif"
        font-size="${Math.round(height * 0.036)}" letter-spacing="${Math.round(width * 0.006)}"
        fill="${dark}" fill-opacity="0.85">${label}</text>
      <rect x="${width * 0.06}" y="${height * 0.15}" width="${width * 0.09}" height="2" fill="${dark}" fill-opacity="0.6" />
    </g>
  </svg>`;
}

const jobs = [
  { file: 'public/images/prompts/window-light-portrait.webp', width: 1200, height: 900, palette: 'linen' },
  { file: 'public/images/prompts/wood-desk-product.webp', width: 1200, height: 900, palette: 'walnut' },
  { file: 'public/images/prompts/moss-forest-illustration.webp', width: 1200, height: 900, palette: 'moss' },
  { file: 'public/images/projects/comfyui-basic-workflow.webp', width: 1200, height: 800, palette: 'clay' },
  { file: 'public/og-default.jpg', width: 1200, height: 630, palette: 'linen', label: 'AI PRACTICE LIBRARY' },
];

for (const job of jobs) {
  const target = resolve(root, job.file);
  await mkdir(dirname(target), { recursive: true });

  const svg = Buffer.from(art(job));

  if (job.file.endsWith('.webp')) {
    await sharp(svg).webp({ quality: 82, effort: 5 }).toFile(target);
  } else {
    await sharp(svg).jpeg({ quality: 84, mozjpeg: true }).toFile(target);
  }

  console.log(`✓ ${job.file}`);
}
