/**
 * Returns the current time in HH:MM:SS format.
 *
 * @returns {string} Formatted time string.
 */
export declare const getCurrentTime: () => string;
/**
 * Initializes the watch target directory.
 * Creates the directory if it does not exist,
 * then outputs a log indicating that watching has started.
 *
 * @param {string} input - Path to the directory to watch.
 * @param {string} watchExt - File extension used for log display (e.g., 'ejs', 'css').
 */
export declare const initWatchDir: (input: string, watchExt: string) => void;
