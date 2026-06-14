/**
 * Entry point for the build system.
 * Runs all watchers by default, or a specific watcher
 * when a mode is passed via CLI arguments.
 *
 * Examples:
 *   npm run dev        -> run full environment
 *   npm run ejs        -> run only EJS watcher
 *   npm run css        -> run only CSS watcher
 *   npm run img        -> run only image watcher
 *   npm run server     -> run only BrowserSync
 */
import { watchEjs } from './ejs.js';
import { watchCss } from './postcss.js';
import { watchServer } from './bs.js';
import { watchImg } from './sharp.js';

// Read CLI argument (e.g. "ejs", "css", "img", "server")
const mode = process.argv[2];

/**
 * Wrap logic in an IIFE so we can safely use `return`
 * inside an ES module (top-level return is not allowed).
 */
(() => {
  if (mode) {
    switch (mode) {
      case 'ejs':
        watchEjs();
        break;
      case 'css':
        watchCss();
        break;
      case 'img':
        watchImg();
        break;
      case 'server':
        watchServer();
        break;
      default:
        console.log(`Unknown mode: ${mode}`);
    }

    // Prevent full environment from starting
    return;
  }

  /**
   * Default behavior:
   * Launch BrowserSync first, then start all watchers.
   * The callback ensures watchers start only after the server is ready.
   */
  watchServer(() => {
    watchEjs();
    watchCss();
    watchImg();
  });
})();
