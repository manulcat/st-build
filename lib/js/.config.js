/**
 * BrowserSync configuration.
 * Controls server behavior, file watching, HTTPS settings,
 * and optional rewrite rules.
 */
export const bsconfig = {
    enable: {
        notify: false,
        startPath: false,
        https: false,
        ssiInclude: true,
        rewriteBaseUrl: false,
    },
    files: {
        dir: 'dist',
        ext: 'html,css,js',
    },
    startPath: 'path/to/start/path',
    https: {
        key: 'C:/path/to/server.key',
        cert: 'C:/path/to/server.crt',
    },
    rewriteBaseUrl: 'https://example.com/',
};
/**
 * Input/output paths used by EJS, CSS, and image processing.
 */
export const io = {
    ejs: {
        in: 'src/ejs',
        out: 'dist',
        data: 'data.json',
    },
    css: {
        in: 'src/css',
        out: 'dist/assets/css',
        name: 'style',
    },
    img: {
        in: 'src/img',
        out: 'dist/assets/img',
    },
};
/**
 * Shared formatting options for js-beautify.
 * Used for both HTML and CSS output to keep
 * indentation and newline behavior consistent.
 */
export const format = {
    html: {
        indent_size: 2,
        end_with_newline: true,
        max_preserve_newlines: 0,
    },
    css: {
        indent_size: 2,
        end_with_newline: true,
        max_preserve_newlines: 0,
    },
};
/**
 * ANSI-colored log labels used across the build system.
 */
export const style = {
    fs: '[\u001b[91mfs\u001b[0m]',
    watcher: '[\u001b[92mparcel/watcher\u001b[0m]',
    postcss: '[\u001b[93mpostcss\u001b[0m]',
    ejs: '[\u001b[94mejs\u001b[0m]',
    sharp: '[\u001b[95msharp\u001b[0m]',
    unknown: '[\u001b[97mUnknown\u001b[0m]',
    error: '\u001b[41m\u001b[97m ERROR \u001b[0m',
    arrow: '\u001b[31m=>\u001b[0m',
};
