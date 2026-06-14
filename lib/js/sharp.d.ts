/**
 * Watches the image directory and processes images on change.
 *
 * - Only handles JPG, JPEG, PNG
 * - Deletes output files when source is removed
 * - Processes images based on filename prefix rules
 */
export declare const watchImg: () => void;
