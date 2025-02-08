/** @typedef {('empty' | 'crossed' | 'filled')} Cell */

/** @enum {Cell} The state of a nonogram cell. */
export const CellEnum = /** @type {const} */ ({
  EMPTY: 'empty',
  CROSSED: 'crossed',
  FILLED: 'filled',
});

/**
 * Coerces a cell value to a defined state.
 * @param {Cell} cell
 * @returns {Cell}
 */
export function coerceCell(cell) {
  return cell === CellEnum.EMPTY ? CellEnum.CROSSED : cell;
}

/**
 * Toggles a cell from empty, to filled, to crossed, and then repeat.
 * @param {Cell} cell
 * @returns {Cell}
 */
export function toggleCell(cell) {
  switch (cell) {
    case CellEnum.EMPTY:
      return CellEnum.FILLED;
    case CellEnum.FILLED:
      return CellEnum.CROSSED;
    case CellEnum.CROSSED:
      return CellEnum.EMPTY;
    default:
      throw new TypeError(`Unknown cell "${cell}"`);
  }
}
