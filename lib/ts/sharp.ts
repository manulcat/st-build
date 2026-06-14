import { io, style } from './.config.js';
import { getCurrentTime as now, initWatchDir } from './util.js';
import fs from 'fs';
import path from 'path';
import { subscribe } from '@parcel/watcher';
import sharp from 'sharp';

/**
 * Processes a single image file.
 *
 * Behavior depends on filename prefix:
 * - `ui-*`  -> PNG only, compressed
 * - `pic-*` -> JPEG/PNG compressed + WebP + AVIF
 * - others  -> skipped
 *
 * @param {string} filePath - Path to the source image.
 */
const processImage = async (filePath: string) => {
  const rPath = path.relative(io.img.in, filePath);
  const oPath = path.join(io.img.out, rPath);
  const ext = path.extname(filePath).toLowerCase();
  const name = path.basename(filePath);
  fs.mkdirSync(path.dirname(oPath), { recursive: true });

  // UI assets: PNG only
  if (name.startsWith('ui-')) {
    if (ext !== '.png') {
      console.log(`[${now()}] ${style.sharp} Skipped (UI requires PNG): ${path.join(io.img.in, rPath)}`);
      return;
    }
    await sharp(filePath).png({ compressionLevel: 9 }).toFile(oPath);
    console.log(`[${now()}] ${style.sharp} Compressed: ${path.join(io.img.in, rPath)} ${style.arrow} ${oPath}`);
    return;
  }

  // Picture assets: compress + convert to WebP/AVIF
  if (name.startsWith('pic-')) {
    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(filePath).jpeg({ quality: 80 }).toFile(oPath);
    } else if (ext === '.png') {
      await sharp(filePath).png({ compressionLevel: 9 }).toFile(oPath);
    }
    console.log(`[${now()}] ${style.sharp} Compressed: ${path.join(io.img.in, rPath)} ${style.arrow} ${oPath}`);
    const wPath = oPath.replace(path.extname(oPath), '.webp');
    const aPath = oPath.replace(path.extname(oPath), '.avif');
    await Promise.all([sharp(filePath).webp({ quality: 80 }).toFile(wPath), sharp(filePath).avif({ quality: 50 }).toFile(aPath)]);
    console.log(`[${now()}] ${style.sharp} Converted (webp): ${path.join(io.img.in, rPath)} ${style.arrow} ${wPath}`);
    console.log(`[${now()}] ${style.sharp} Converted (avif): ${path.join(io.img.in, rPath)} ${style.arrow} ${aPath}`);
    return;
  }

  // Unknown prefix: skip
  console.log(`[${now()}] ${style.sharp} Skipped (unknown prefix): ${path.join(io.img.in, rPath)}`);
};

/**
 * Deletes all generated files for a given source image:
 * - original output
 * - WebP version
 * - AVIF version
 *
 * @param {string} filePath - Path to the deleted source image.
 */
const deleteImage = (filePath: string) => {
  const oPath = path.join(io.img.out, path.relative(io.img.in, filePath));
  const wPath = oPath.replace(path.extname(oPath), '.webp');
  const aPath = oPath.replace(path.extname(oPath), '.avif');
  const files = [oPath, wPath, aPath];
  files.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`[${now()}] ${style.fs} Deleted: ${file}`);
    }
  });
};

/**
 * Watches the image directory and processes images on change.
 *
 * - Only handles JPG, JPEG, PNG
 * - Deletes output files when source is removed
 * - Processes images based on filename prefix rules
 */
export const watchImg = () => {
  initWatchDir(io.img.in, '{ jpg, jpeg, png }');
  let timer: NodeJS.Timeout;
  subscribe(path.normalize(io.img.in), (watcherError, events) => {
    if (watcherError) {
      console.error(`[${now()}] ${style.watcher} ${style.error} ${watcherError}`);
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        for (const e of events) {
          if (!/\.(jpg|jpeg|png)$/i.test(e.path)) continue;
          const eType = e.type[0].toUpperCase() + e.type.slice(1);
          const ePath = path.relative(process.cwd(), e.path);
          console.log(`[${now()}] ${style.watcher} ${eType}: ${ePath}`);
          if (e.type === 'delete') {
            deleteImage(e.path);
            continue;
          }
          await processImage(e.path);
        }
      } catch (compressError) {
        console.error(`[${now()}] ${style.unknown} ${style.error} ${String(compressError)}`);
      }
    }, 100);
  });
};
