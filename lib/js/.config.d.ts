/**
 * BrowserSync configuration.
 * Controls server behavior, file watching, HTTPS settings,
 * and optional rewrite rules.
 */
export declare const bsconfig: {
    readonly enable: {
        readonly notify: false;
        readonly startPath: false;
        readonly https: false;
        readonly ssiInclude: true;
        readonly rewriteBaseUrl: false;
    };
    readonly files: {
        readonly dir: "dist";
        readonly ext: "html, css, js";
    };
    readonly startPath: "path/to/start/path";
    readonly https: {
        readonly key: "C:/path/to/server.key";
        readonly cert: "C:/path/to/server.crt";
    };
    readonly rewriteBaseUrl: "https://example.com/";
};
/**
 * Input/output paths used by EJS, CSS, and image processing.
 */
export declare const io: {
    readonly ejs: {
        readonly in: "src/ejs";
        readonly out: "dist";
        readonly data: "data.json";
    };
    readonly css: {
        readonly in: "src/css";
        readonly out: "dist/assets/css";
        readonly name: "style";
    };
    readonly img: {
        readonly in: "src/img";
        readonly out: "dist/assets/img";
    };
};
/**
 * Shared formatting options for js-beautify.
 * Used for both HTML and CSS output to keep
 * indentation and newline behavior consistent.
 */
export declare const format: {
    readonly html: {
        readonly indent_size: 2;
        readonly end_with_newline: true;
        readonly max_preserve_newlines: 0;
    };
    readonly css: {
        readonly indent_size: 2;
        readonly end_with_newline: true;
        readonly max_preserve_newlines: 0;
    };
};
/**
 * ANSI-colored log labels used across the build system.
 */
export declare const style: {
    readonly fs: "[\u001B[91mfs\u001B[0m]";
    readonly watcher: "[\u001B[92mparcel/watcher\u001B[0m]";
    readonly postcss: "[\u001B[93mpostcss\u001B[0m]";
    readonly ejs: "[\u001B[94mejs\u001B[0m]";
    readonly sharp: "[\u001B[95msharp\u001B[0m]";
    readonly unknown: "[\u001B[97mUnknown\u001B[0m]";
    readonly error: "\u001B[41m\u001B[97m ERROR \u001B[0m";
    readonly arrow: "\u001B[31m=>\u001B[0m";
};
