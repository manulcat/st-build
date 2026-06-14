import { io, format, style } from './.config.js';
import { getCurrentTime as now, initWatchDir } from './util.js';
import fs from 'fs';
import path from 'path';
import { subscribe } from '@parcel/watcher';
import ejs from 'ejs';
import jsBeautify from 'js-beautify';
const { html: beautify } = jsBeautify;

/**
 * Builds a single HTML file from an EJS template.
 *
 * - Resolves relative paths
 * - Computes slug and base path depth
 * - Formats the output HTML
 *
 * @param {string} file - Path to the EJS file.
 * @param {object} data - JSON data passed to the template.
 */
const buildHtml = (file: string, data: Record<string, any>) => {
  const rPath = path.relative(io.ejs.in, file);
  const oPath = path.join(io.ejs.out, rPath.replace(/\.ejs$/, '.html'));
  const slug = rPath.replace(/(^|\/)index\.ejs$/, '').replace(/\.ejs$/, '');
  const depth = slug.split('/').filter(Boolean).length;
  const base = depth === 0 ? './' : '../'.repeat(depth);
  ejs.renderFile(file, { data, slug, base }, (err: Error | null, html: string | undefined) => {
    if (err) {
      console.error(`[${now()}] ${style.ejs} ${style.error} ${err.message}`);
      return;
    }
    const formatted = beautify(html, format.html);
    fs.mkdirSync(path.dirname(oPath), { recursive: true });
    fs.writeFileSync(oPath, formatted);
    console.log(`[${now()}] ${style.ejs} Built: ${path.join(io.ejs.in, rPath)} ${style.arrow} ${oPath}`);
  });
};

/**
 * Rebuilds all EJS templates except partials (files starting with "_").
 *
 * @param {object} data - JSON data passed to all templates.
 */
const buildAllHtml = (data: Record<string, any>) => {
  const files = fs
    .readdirSync(path.normalize(io.ejs.in), { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.ejs') && !path.basename(f).startsWith('_'))
    .map((f) => path.join(io.ejs.in, f));
  files.forEach((file) => buildHtml(file, data));
  console.log(`[${now()}] ${style.ejs} Rebuilt all pages (partial changed)`);
};

/**
 * Deletes the generated HTML file corresponding to a removed EJS file.
 *
 * @param {string} filePath - Path to the deleted EJS file.
 */
const deleteHtml = (filePath: string) => {
  const oPath = path.join(io.ejs.out, path.relative(io.ejs.in, filePath).replace(/\.ejs$/, '.html'));
  if (fs.existsSync(oPath)) {
    fs.unlinkSync(oPath);
    console.log(`[${now()}] ${style.fs} Deleted: ${oPath}`);
  }
};

/**
 * Watches the EJS directory for changes and rebuilds templates accordingly.
 *
 * - Creates missing data.json if needed
 * - Rebuilds all pages when partials change
 * - Rebuilds only the changed file when a normal EJS file changes
 * - Deletes output HTML when source EJS is removed
 */
export const watchEjs = () => {
  initWatchDir(io.ejs.in, 'ejs');
  let timer: NodeJS.Timeout;
  subscribe(path.normalize(io.ejs.in), (watcherError, events) => {
    if (watcherError) {
      console.error(`[${now()}] ${style.watcher} ${style.error} ${watcherError}`);
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        const jsonPath = path.join(io.ejs.in, io.ejs.data);
        if (!fs.existsSync(jsonPath)) {
          fs.writeFileSync(jsonPath, '{}');
          console.log(`[${now()}] ${style.fs} Created missing file: ${jsonPath}`);
        }
        const json = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(json);
        events.forEach((e) => {
          if (!e.path.endsWith('.ejs')) return;
          const eType = e.type[0].toUpperCase() + e.type.slice(1);
          const ePath = path.relative(process.cwd(), e.path);
          console.log(`[${now()}] ${style.watcher} ${eType}: ${ePath}`);
          if (e.type === 'delete') {
            if (path.basename(e.path).startsWith('_')) {
              buildAllHtml(data);
            }
            deleteHtml(e.path);
            return;
          }
          if (path.basename(e.path).startsWith('_')) {
            buildAllHtml(data);
            return;
          }
          buildHtml(e.path, data);
        });
      } catch (buildError) {
        if (buildError instanceof Error) {
          const err = buildError as NodeJS.ErrnoException;
          if (err.code && err.syscall) {
            console.error(`[${now()}] ${style.fs} ${style.error} ${err.code} (${err.syscall})`);
            return;
          }
          console.error(`[${now()}] ${style.unknown} ${style.error} ${buildError.message}`);
        }
        console.error(`[${now()}] ${style.unknown} ${style.error} ${String(buildError)}`);
      }
    }, 100);
  });
};
