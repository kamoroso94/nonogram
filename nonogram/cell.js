/** @typedef {('empty' | 'crossed' | 'filled' | 'locked')} Cell */

/** @enum {Cell} The state of a nonogram cell. */
export const CellEnum = /** @type {const} */ ({
  EMPTY: 'empty',
  CROSSED: 'crossed',
  FILLED: 'filled',
  LOCKED: 'locked',
});

/**
 * Coerces a cell to a binary state.
 * @param {Cell} cell
 * @returns {Cell}
 */
export function coerceCell(cell) {
  switch (cell) {
    case CellEnum.EMPTY:
    case CellEnum.CROSSED:
      return CellEnum.CROSSED;
    case CellEnum.FILLED:
    case CellEnum.LOCKED:
      return CellEnum.FILLED;
    default:
      throw new TypeError(`Unknown cell "${cell}"`);
  }
}

/**
 * Toggles a cell from empty, to filled, to crossed, and then repeat.
 * @param {Cell} cell
 * @param {boolean} [locking] Whether to toggle locking.
 * @returns {Cell}
 */
export function toggleCell(cell, locking) {
  if (locking) {
    switch (cell) {
      case CellEnum.FILLED:
        return CellEnum.LOCKED;
      case CellEnum.LOCKED:
        return CellEnum.FILLED;
      default:
        return cell;
    }
  }

  switch (cell) {
    case CellEnum.EMPTY:
      return CellEnum.FILLED;
    case CellEnum.FILLED:
      return CellEnum.CROSSED;
    case CellEnum.CROSSED:
      return CellEnum.EMPTY;
    default:
      return cell;
  }
}
