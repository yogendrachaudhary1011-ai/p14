import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const ROOT = process.cwd();
const MEDIA_DIRS = [
  path.join(ROOT, 'public', 'assets', 'media'),
  path.join(ROOT, 'assets', 'media')
];

const SRC_DIR = MEDIA_DIRS[0];

function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function copyToMirrors(filename) {
  const src = path.join(SRC_DIR, filename);
  for (let i = 1; i < MEDIA_DIRS.length; i++) {
    const destDir = MEDIA_DIRS[i];
    if (fs.existsSync(destDir)) {
      fs.copyFileSync(src, path.join(destDir, filename));
    }
  }
}

async function optimizeImage({ inputName, outputName, maxWidth, quality, format }) {
  const inputPath = path.join(SRC_DIR, inputName);
  const outputPath = path.join(SRC_DIR, outputName);
  if (!fs.existsSync(inputPath)) {
    console.warn(`Skipping missing file: ${inputName}`);
    return;
  }

  const beforeSize = fs.statSync(inputPath).size;
  const tempPath = `${outputPath}.tmp`;

  let pipeline = sharp(inputPath).rotate().resize({
    width: maxWidth,
    withoutEnlargement: true
  });

  if (format === 'webp') {
    pipeline = pipeline.webp({ quality, effort: 6 });
  } else if (format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true, progressive: true });
  } else if (format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality });
  }

  await pipeline.toFile(tempPath);
  fs.renameSync(tempPath, outputPath);
  copyToMirrors(outputName);

  const afterSize = fs.statSync(outputPath).size;
  const savings = ((1 - afterSize / beforeSize) * 100).toFixed(1);
  console.log(`[image] ${inputName} -> ${outputName}: ${formatKB(beforeSize)} -> ${formatKB(afterSize)} (${savings}% saved)`);
}

function optimizeVideo({ inputName, mp4OutName, webmOutName }) {
  const inputPath = path.join(SRC_DIR, inputName);
  if (!fs.existsSync(inputPath)) {
    console.warn(`Skipping missing video: ${inputName}`);
    return;
  }

  const beforeSize = fs.statSync(inputPath).size;

  // 1. Fast-start compressed H.264 MP4 (960px wide, 30fps, muted, CRF 28)
  const mp4Path = path.join(SRC_DIR, mp4OutName);
  const mp4Tmp = path.join(SRC_DIR, `.tmp-${mp4OutName}`);
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i', inputPath,
      '-vf', "scale='min(960,iw)':-2,fps=30",
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '28',
      '-profile:v', 'high',
      '-level', '4.0',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-an',
      mp4Tmp
    ],
    { stdio: 'pipe' }
  );
  fs.renameSync(mp4Tmp, mp4Path);
  copyToMirrors(mp4OutName);
  const mp4Size = fs.statSync(mp4Path).size;
  console.log(`[video] ${inputName} -> ${mp4OutName}: ${formatKB(beforeSize)} -> ${formatKB(mp4Size)} (${((1 - mp4Size / beforeSize) * 100).toFixed(1)}% saved)`);

  // 2. VP9 WebM for ultra-lightweight landing playback (960px wide, 30fps, CRF 35)
  if (webmOutName) {
    const webmPath = path.join(SRC_DIR, webmOutName);
    const webmTmp = path.join(SRC_DIR, `.tmp-${webmOutName}`);
    try {
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-i', mp4Path,
          '-c:v', 'libvpx-vp9',
          '-crf', '35',
          '-b:v', '0',
          '-deadline', 'good',
          '-cpu-used', '2',
          '-row-mt', '1',
          '-pix_fmt', 'yuv420p',
          '-an',
          webmTmp
        ],
        { stdio: 'pipe' }
      );
      fs.renameSync(webmTmp, webmPath);
      copyToMirrors(webmOutName);
      const webmSize = fs.statSync(webmPath).size;
      console.log(`[video] ${inputName} -> ${webmOutName}: ${formatKB(beforeSize)} -> ${formatKB(webmSize)} (${((1 - webmSize / beforeSize) * 100).toFixed(1)}% saved)`);
    } catch (err) {
      if (fs.existsSync(webmTmp)) fs.unlinkSync(webmTmp);
      console.warn(`WebM encode skipped: ${err.message}`);
    }
  }
}

async function main() {
  console.log('Compressing landing page images & video...');

  // 1. Hero ID card portrait (landing page LCP image)
  await optimizeImage({
    inputName: 'hero-id-portrait.jpeg',
    outputName: 'hero-id-portrait.webp',
    maxWidth: 800,
    quality: 82,
    format: 'webp'
  });
  await optimizeImage({
    inputName: 'hero-id-portrait.jpeg',
    outputName: 'hero-id-portrait.jpeg',
    maxWidth: 800,
    quality: 82,
    format: 'jpeg'
  });

  // 2. About profile poster (landing page About video poster)
  await optimizeImage({
    inputName: 'about-profile-poster.png',
    outputName: 'about-profile-poster.webp',
    maxWidth: 900,
    quality: 80,
    format: 'webp'
  });
  await optimizeImage({
    inputName: 'about-profile-poster.png',
    outputName: 'about-profile-poster.png',
    maxWidth: 900,
    quality: 80,
    format: 'png'
  });

  // 3. Landing page project card thumbnails ONLY (originals kept intact for case study pages)
  await optimizeImage({
    inputName: 'somtu-cover.webp',
    outputName: 'somtu-thumb.webp',
    maxWidth: 900,
    quality: 78,
    format: 'webp'
  });
  await optimizeImage({
    inputName: 'home-media-01-a8072a2c986d.png',
    outputName: 'vedic-sewa-thumb.webp',
    maxWidth: 800,
    quality: 82,
    format: 'webp'
  });

  // 4. Landing page About video (re-encode to fast-start H.264 MP4 + VP9 WebM)
  optimizeVideo({
    inputName: 'about-profile-video.mp4',
    mp4OutName: 'about-profile-video.mp4',
    webmOutName: 'about-profile-video.webm'
  });

  console.log('Landing page media compression complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
