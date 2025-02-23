/** @import {Color} from './color-picker/color-picker.js'; */

/** Storage key for the nonogram difficulty selector. */
export const NONOGRAM_DIFFICULTY_KEY = 'nonogram.difficulty';
/** Storage key for the nonogram dimensions selector. */
export const NONOGRAM_DIMENSIONS_KEY = 'nonogram.dimensions';
/** Storage key for the nonogram stats tables. */
export const NONOGRAM_STATS_KEY = 'nonogram.statistics';
/** Storage key for the nonogram stats table difficulty selector. */
export const NONOGRAM_STATS_DIFFICULTY_KEY = 'nonogram.statistics.difficulty';

/** Supported locale for the nonogram page. */
export const LOCALE = document.documentElement.lang;

/** Maximum history length for the undo feature. */
export const MAX_UNDO_HISTORY = 50;

/**
 * Palette of supported colors for the nonogram.
 * @type {readonly Color[]}
 */
export const PALETTE = [
  'default',
  'red',
  'green',
  'blue',
  'orange',
  'purple',
  'gray',
].map((color) => ({
  name: color,
  cssColor: `var(--color-${color})`,
}));
