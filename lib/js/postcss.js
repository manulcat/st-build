import { io, format, style } from './.config.js';
import { getCurrentTime as now, initWatchDir } from './util.js';
import fs from 'fs';
import path from 'path';
import { subscribe } from '@parcel/watcher';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcssImport from 'postcss-import';
import discardComments from 'postcss-discard-comments';
import jsBeautify from 'js-beautify';
const { css: beautify } = jsBeautify;
/**
 * Paths for input CSS and output files.
 */
const filePath = {
    input: path.join(io.css.in, `${io.css.name}.css`),
    output: path.join(io.css.out, `${io.css.name}.css`),
    outputMin: path.join(io.css.out, `${io.css.name}.min.css`),
};
/**
 * Builds CSS using PostCSS.
 *
 * - Resolves '@import'
 * - Adds vendor prefixes
 * - Removes comments
 * - Formats the output CSS
 * - Generates a minified version
 */
const buildCss = async () => {
    const css = fs.readFileSync(filePath.input, 'utf8');
    const result = await postcss([postcssImport, autoprefixer, discardComments({ removeAll: true })]).process(css, { from: filePath.input });
    const formatted = beautify(result.css, format.css);
    const minified = await postcss([cssnano()]).process(formatted, { from: undefined });
    fs.mkdirSync(path.normalize(io.css.out), { recursive: true });
    fs.writeFileSync(filePath.output, formatted);
    fs.writeFileSync(filePath.outputMin, minified.css);
    console.log(`[${now()}] ${style.postcss} Built: ${filePath.input} ${style.arrow} ${filePath.output}`);
    console.log(`[${now()}] ${style.postcss} Built (minified): ${filePath.input} ${style.arrow} ${filePath.outputMin}`);
};
/**
 * Deletes generated CSS files (.css and .min.css).
 */
const deleteCss = () => {
    const files = [filePath.output, filePath.outputMin];
    files.forEach((file) => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log(`[${now()}] ${style.fs} Deleted: ${file}`);
        }
    });
};
/**
 * Watches the CSS directory and rebuilds CSS on changes.
 *
 * - Rebuilds CSS when the main file changes
 * - Deletes output files when the source is removed
 * - Logs all watcher events
 */
export const watchCss = () => {
    initWatchDir(io.css.in, 'css');
    let timer;
    subscribe(path.normalize(io.css.in), (watcherError, events) => {
        if (watcherError) {
            console.error(`[${now()}] ${style.watcher} ${style.error} ${watcherError}`);
            return;
        }
        clearTimeout(timer);
        timer = setTimeout(async () => {
            try {
                events.forEach((e) => {
                    if (!e.path.endsWith('.css'))
                        return;
                    const eType = e.type[0].toUpperCase() + e.type.slice(1);
                    const ePath = path.relative(process.cwd(), e.path);
                    console.log(`[${now()}] ${style.watcher} ${eType}: ${ePath}`);
                    if (e.type === 'delete') {
                        deleteCss();
                        return;
                    }
                });
                await buildCss();
            }
            catch (buildError) {
                if (buildError instanceof Error) {
                    if (buildError.name === 'BrowserslistError') {
                        console.error(`[${now()}] ${style.postcss} ${style.error} ${buildError.message}`);
                        return;
                    }
                    const err = buildError;
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
