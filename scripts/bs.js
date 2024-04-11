// Module
import fs from 'fs';
import path from 'path';
import { create as bsCreate } from 'browser-sync';
const bs = bsCreate();
// Target Name
const TARGET = {
    dir: 'public\\',
    file: '*',
    ext: '.{html,php,css,js,svg}',
};
// BrowserSync Options
const bsOptions = {
    // Target Files
    files: [TARGET.dir + '**\\' + TARGET.file + TARGET.ext],
    // Notify
    notify: false,
    // Document Root
    server: TARGET.dir,
    // Use HTTPS
    https: {
        key: 'C:\\xampp\\apache\\conf\\ssl.key\\server.key',
        cert: 'C:\\xampp\\apache\\conf\\ssl.crt\\server.crt',
    },
    rewriteRules: [
        // Use SSI
        {
            match: /<!--#include virtual="(.+?)"-->/g,
            fn: (req, res, match, filename) => {
                const filePath = path.join(TARGET.dir, filename.replace(/\.\.\//g, ''));
                if (!fs.existsSync(filePath)) {
                    return `<span style="color: red">${filePath} could not be found</span>`;
                }
                return fs.readFileSync(filePath);
            },
        },
        // Adjust Relative Path
        {
            match: /https:\/\/dummy\.com/g,
            fn: (req, res, match) => {
                match = '';
                return match;
            },
        },
    ],
};
// BrowserSync Init
export const watchServer = bs.init(bsOptions);
