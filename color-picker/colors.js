/** Default color in the color palette. */
export const DEFAULT_COLOR = 'default';

/** Color palette for the color picker. */
export const COLORS = /** @type {const} */ ([
  DEFAULT_COLOR,
  'red',
  'green',
  'blue',
  'orange',
  'purple',
  'gray',
]);

/**
 * Returns the CSS custom property corresponding to this color name.
 * @param {string} color
 */
export function colorToCssVar(color) {
  return `var(--color-${color})`;
}
