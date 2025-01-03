import {queryElement, assertExists, assertInstance} from './asserts.js';
import {CellEnum, toggleCell} from './cell.js';
import {ColorPicker} from './color-picker.js';
import {HintBox} from './hint-box.js';
import {getColumns, matrix} from './matrix.js';
import {MouseButton} from './mouse-button.js';
import {
  fromCellId,
  getCellId,
  renderNonogram,
  renderGridClues,
} from './render-nonogram.js';
/** @import {Cell} from './cell.js' */
/** @import {ColorPickerConfig} from './color-picker.js' */
/** @import {HintBoxConfig, HintBoxHints} from './hint-box.js' */

/**
 * @typedef {object} NonogramConfig
 * @property {string} slotSelector
 * @property {string} dimensionsSelector
 * @property {string} difficultySelector
 * @property {string} restartSelector
 * @property {string} submitSelector
 * @property {!ColorPickerConfig} colorPickerConfig
 * @property {!HintBoxConfig} hintBoxConfig
 */

/**
 * Represents the clues labeling each row and column of the nonogram puzzle,
 * where each clue is a list of the sizes of each contiguous block of filled
 * cells in that line.
 * @typedef {object} NonogramClues
 * @property {!number[][]} rowClues A list of clues for each row.
 * @property {!number[][]} colClues A list of clues for each column.
 */

/** Component that manages the nonogram puzzle. */
export class Nonogram {
  /** @type {!HTMLTableElement} */
  #nonogram;
  /** @type {!ColorPicker} */
  #colorPicker;
  /** @type {!HintBox} */
  #hintBox;

  /** @type {number} */
  #dimensions;
  /** @type {number} */
  #difficulty;

  /** @type {!Cell[][]} */
  #userPuzzle;
  /** @type {!NonogramClues} */
  #keyGridClues;

  /**
   * @param {!NonogramConfig} config
   * @throws {!TypeError} When any of the selectors fail to match an element.
   */
  constructor({
    slotSelector,
    dimensionsSelector,
    difficultySelector,
    restartSelector,
    submitSelector,
    colorPickerConfig,
    hintBoxConfig,
  }) {
    this.#nonogram = assertInstance(
      queryElement(slotSelector),
      HTMLTableElement
    );
    this.#colorPicker = new ColorPicker(colorPickerConfig);
    this.#colorPicker.addEventListener('color.clear', (event) => {
      const color = /** @type {!CustomEvent<?string>} */ (event).detail;
      this.#clear(color ?? undefined);
    });
    this.#hintBox = new HintBox(hintBoxConfig);

    queryElement(restartSelector).addEventListener('click', () => {
      this.reset();
    });
    queryElement(submitSelector).addEventListener('click', () => {
      this.#validate();
    });

    const dimensionsSelect = assertInstance(
      queryElement(dimensionsSelector),
      HTMLSelectElement
    );
    dimensionsSelect.addEventListener('change', () => {
      this.#dimensions = parseInt(dimensionsSelect.value);
      this.reset();
    });
    this.#dimensions = parseInt(dimensionsSelect.value);

    const difficultySelect = assertInstance(
      queryElement(difficultySelector),
      HTMLSelectElement
    );
    difficultySelect.addEventListener('change', () => {
      this.#difficulty = parseFloat(difficultySelect.value);
      this.reset();
    });
    this.#difficulty = parseFloat(difficultySelect.value);

    this.reset();
  }

  /** Reset to random puzzle and calculate grid clues. */
  reset() {
    this.#colorPicker.reset();
    this.#hintBox.reset();

    // Make empty user puzzle and random key puzzle.
    this.#userPuzzle = matrix(
      this.#dimensions,
      this.#dimensions,
      () => CellEnum.EMPTY
    );
    const keyPuzzle = matrix(this.#dimensions, this.#dimensions, () => {
      return Math.random() < this.#difficulty
        ? CellEnum.FILLED
        : CellEnum.CROSSED;
    });

    this.#keyGridClues = gridToClues(keyPuzzle);
    this.#hintBox.update(cluesToHints(this.#keyGridClues));
    this.#render();
  }

  // TODO: reuse DOM when not resizing
  /** Renders the nonogram puzzle. */
  #render() {
    this.#nonogram.replaceChildren(renderNonogram(this.#dimensions));
    renderGridClues(this.#nonogram, this.#keyGridClues);

    // Add nonogram interactivity
    const tdTags = this.#nonogram.querySelectorAll('td:not(.empty)');
    for (const tdTag of tdTags) {
      const [row, col] = fromCellId(tdTag.id);
      const cellBox = assertExists(tdTag.firstElementChild);

      // TODO: event delegation
      cellBox.addEventListener('mouseover', (event) => {
        if (/** @type {!MouseEvent} */ (event).buttons & MouseButton.PRIMARY) {
          this.#toggleCellBox(row, col);
        }
      });
      cellBox.addEventListener('mousedown', () => {
        this.#toggleCellBox(row, col);
      });
    }
  }

  /**
   * Clears the `#userPuzzle` and `#nonogram` of a specific `color` if provided,
   * otherwise clears all colors.
   * @param {string} [color] Clears a specific CSS color when provided.
   */
  #clear(color) {
    for (let row = 0; row < this.#dimensions; row++) {
      for (let col = 0; col < this.#dimensions; col++) {
        const cellBox = /** @type {!HTMLElement} */ (
          queryElement(`#${getCellId(row, col)} > :only-child`)
        );
        if (!color || cellBox.style.color === color) {
          this.#toggleCellBox(row, col, CellEnum.EMPTY);
        }
      }
    }

    if (!color) this.#colorPicker.reset();
  }

  /**
   * Toggles the state of the nonogram cell, or sets it to `forcedValue` when
   * provided.
   * @param {number} row
   * @param {number} col
   * @param {Cell} [forcedValue]
   */
  #toggleCellBox(row, col, forcedValue) {
    const cellBox = /** @type {!HTMLElement} */ (
      queryElement(`#${getCellId(row, col)} > :only-child`)
    );
    const cell = (this.#userPuzzle[row][col] =
      forcedValue ?? toggleCell(this.#userPuzzle[row][col]));

    // TODO: consider adding data attribute for color to avoid having to query
    // inline styles.
    switch (cell) {
      case CellEnum.CROSSED:
        cellBox.style.backgroundColor = '';
        cellBox.style.color = this.#colorPicker.playColor;
        cellBox.textContent = '╳';
        break;

      case CellEnum.EMPTY:
        cellBox.style.backgroundColor = '';
        cellBox.style.color = '';
        cellBox.textContent = '';
        break;

      case CellEnum.FILLED:
        cellBox.style.backgroundColor = this.#colorPicker.playColor;
        cellBox.style.color = this.#colorPicker.playColor;
        cellBox.textContent = '';
        break;

      default:
        throw new TypeError(`Unknown cell "${cell}"`);
    }
  }

  // TODO: avoid use of blocking dialogs
  #validate() {
    const userGridClues = gridToClues(this.#userPuzzle);
    if (compareCluesEqual(userGridClues, this.#keyGridClues)) {
      if (confirm('You won! Click OK to play a new game.')) {
        this.reset();
      }
      return;
    }

    alert('You lose! Try again.');
    this.#clear();
  }
}

/**
 * Converts a `grid` of cell values to a list of row and column clues, where each
 * clue is a list of contiguous block sizes in that line. If there are no filled
 * cells in a line, a clue of `[0]` is used.
 * @param {!Cell[][]} grid
 * @returns {!NonogramClues}
 */
function gridToClues(grid) {
  /**
   * @param {!Iterable<!Cell[]>} gridLines
   * @returns {!number[][]}
   */
  function gridLinesToClues(gridLines) {
    const /** @type {!number[][]} */ lineClues = [];
    for (const line of gridLines) {
      let blockSize = 0;
      const /** @type {!number[]} */ lineClue = [];
      for (const cell of line) {
        if (cell === CellEnum.FILLED) {
          blockSize++;
        } else if (blockSize) {
          lineClue.push(blockSize);
          blockSize = 0;
        }
      }
      if (blockSize || !lineClue.length) lineClue.push(blockSize);
      lineClues.push(lineClue);
    }
    return lineClues;
  }

  return {
    rowClues: gridLinesToClues(grid),
    colClues: gridLinesToClues(getColumns(grid)),
  };
}

/**
 * Checks whether two clues lists are equal.
 * @param {!NonogramClues} clues1
 * @param {!NonogramClues} clues2
 * @returns {boolean}
 */
function compareCluesEqual(clues1, clues2) {
  if (clues1 === clues2) return true;
  if (
    clues1.rowClues.length !== clues2.rowClues.length ||
    clues1.colClues.length !== clues2.colClues.length
  ) {
    return false;
  }

  const rowsMatch = clues1.rowClues.every((rowClue1, i) => {
    const rowClue2 = clues2.rowClues[i];
    if (rowClue1.length !== rowClue2.length) return false;
    return rowClue1.every((blocksFilled, j) => blocksFilled === rowClue2[j]);
  });
  if (!rowsMatch) return false;

  const colsMatch = clues1.colClues.every((colClue1, i) => {
    const colClue2 = clues2.colClues[i];
    if (colClue1.length !== colClue2.length) return false;
    return colClue1.every((blocksFilled, j) => blocksFilled === colClue2[j]);
  });

  return colsMatch;
}

/**
 * @param {!NonogramClues} clues
 * @returns {!HintBoxHints}
 */
function cluesToHints({rowClues, colClues}) {
  /**
   * @param {!number[][]} lineClues
   * @param {number} lineSize
   * @returns {!number[]}
   */
  function lineCluesToHints(lineClues, lineSize) {
    const /** @type {!number[]} */ lines = [];
    for (let i = 0; i < lineClues.length; i++) {
      const lineClue = lineClues[i];
      let filledCellCount = 0;
      let maxBlockSize = 0;
      const minSpacerCount = lineClue.length - 1;

      for (const blockSize of lineClue) {
        filledCellCount += blockSize;
        maxBlockSize = Math.max(blockSize, maxBlockSize);
      }

      // Do any blocks overlap themselves when shoved all the way to one end or
      // the other? Or is this line trivially empty?
      const overlapOffset = lineSize - (filledCellCount + minSpacerCount);
      if (overlapOffset < maxBlockSize || maxBlockSize === 0) {
        lines.push(i + 1); // Number lines starting at 1
      }
    }
    return lines;
  }

  // Number of columns is the size of a row, and vice versa.
  const rowSize = colClues.length;
  const colSize = rowClues.length;

  return {
    rows: lineCluesToHints(rowClues, rowSize),
    cols: lineCluesToHints(colClues, colSize),
  };
}
