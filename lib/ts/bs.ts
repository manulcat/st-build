import { bsconfig } from './.config.js';
import fs from 'fs';
import path from 'path';
import { create as bsCreate } from 'browser-sync';
const bs = bsCreate();

/**
 * Base BrowserSync options including file watching,
 * server root, HTTPS settings, and rewrite rules.
 *
 * - `ssiInclude`: Replaces `<!--#include virtual="...">` with the referenced file content.
 * - `rewriteBaseUrl`: Rewrites absolute URLs to root-relative paths.
 */
const bsOptions = {
  files: [`${bsconfig.files.dir.replace(/\/$/, '')}/**/*.{${bsconfig.files.ext}}`],
  notify: bsconfig.enable.notify,
  server: path.relative(process.cwd(), bsconfig.files.dir),
  startPath: bsconfig.startPath,
  https: {
    key: path.resolve(bsconfig.https.key),
    cert: path.resolve(bsconfig.https.cert),
  },
  rewriteRules: [
    /**
     * Server-Side Include (SSI) emulation.
     * Replaces `<!--#include virtual="path">` with the file contents.
     * If the file does not exist, outputs an inline error block.
     */
    {
      id: 'ssiInclude',
      match: /<!--#include virtual="(.+?)"-->/g,
      fn: (_req: any, _res: any, match: string) => {
        const fileName = match.match(/<!--#include virtual="(?<name>.+?)"-->/);
        if (!fileName || !fileName.groups) {
          return `<div style="background-color: #db0808; color: #fff">ERROR: include syntax error in '${match}'</div>`;
        }
        const filePath = path.join(bsconfig.files.dir, fileName.groups.name.replace(/\.\.\//g, ''));
        const errMsg = `<div style="background-color: #db0808; color: #fff">ERROR: '${filePath}' could not be found.</div>`;
        return fs.existsSync(filePath) ? fs.readFileSync(filePath).toString() : errMsg;
      },
    },

    /**
     * Rewrites URLs that start with the configured base URL
     * into root-relative paths so BrowserSync can serve them locally.
     */
    {
      id: 'rewriteBaseUrl',
      match: new RegExp(`^${bsconfig.rewriteBaseUrl.replace(/\/$/, '').replace(/\./g, '\\.')}(\\/.*)?$`),
      replace: (_match: string, capturedPath: string | undefined) => capturedPath || '/',
    },
  ],
};

/**
 * Builds the final BrowserSync configuration object
 * based on enabled features in `.config.mjs`.
 *
 * Only enabled rewrite rules are included.
 */
const buildOptions = () => {
  const opt: Record<string, any> = {
    files: bsOptions.files,
    notify: bsOptions.notify,
    server: bsOptions.server,
  };
  if (bsconfig.enable.startPath) opt.startPath = bsOptions.startPath;
  if (bsconfig.enable.https) opt.https = bsOptions.https;
  const rules = [];
  if (bsconfig.enable.ssiInclude) rules.push(bsOptions.rewriteRules.find((r) => r.id === 'ssiInclude'));
  if (bsconfig.enable.rewriteBaseUrl) rules.push(bsOptions.rewriteRules.find((r) => r.id === 'rewriteBaseUrl'));
  if (rules.length > 0) opt.rewriteRules = rules;
  return opt;
};

/**
 * Starts the BrowserSync server with the generated options.
 *
 * @param {Function} onReady - Callback executed when the server is ready.
 */
export const watchServer = (onReady?: () => void) => {
  bs.init(buildOptions(), onReady);
};
