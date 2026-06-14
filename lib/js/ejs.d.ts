/**
 * Watches the EJS directory for changes and rebuilds templates accordingly.
 *
 * - Creates missing data.json if needed
 * - Rebuilds all pages when partials change
 * - Rebuilds only the changed file when a normal EJS file changes
 * - Deletes output HTML when source EJS is removed
 */
export declare const watchEjs: () => void;
