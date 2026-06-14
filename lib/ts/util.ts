import { style } from './.config.js';
import fs from 'fs';
import path from 'path';

/**
 * Returns the current time in HH:MM:SS format.
 *
 * @returns {string} Formatted time string.
 */
export const getCurrentTime = () => {
  const d = new Date();
  return d.toLocaleTimeString('ja-JP', { hour12: false });
};

/**
 * Initializes the watch target directory.
 * Creates the directory if it does not exist,
 * then outputs a log indicating that watching has started.
 *
 * @param {string} input - Path to the directory to watch.
 * @param {string} watchExt - File extension used for log display (e.g., 'ejs', 'css').
 */
export const initWatchDir = (input: string, watchExt: string): void => {
  const normalized = path.normalize(input);
  if (!fs.existsSync(normalized)) {
    fs.mkdirSync(normalized, { recursive: true });
    console.log(`[${getCurrentTime()}] ${style.fs} Created missing directory: ${normalized}`);
  }
  console.log(`[${getCurrentTime()}] ${style.watcher} Watching: ${path.join(input, `**/*.${watchExt}`)}`);
};
