import {queryElement, assertInstance} from '../utils/asserts.js';
import {getColumns, matrix} from '../utils/matrix.js';
import {MouseButton} from '../utils/mouse-button.js';

import {CellEnum, coerceCell, toggleCell} from './cell.js';
import {
  fromCellId,
  getCellId,
  renderNonogram,
  renderGridClues,
} from './render.js';

/** @import {ColorPicker} from '../color-picker/color-picker.js' */
/** @import {HintBox, HintBoxHints} from '../hint-box/hint-box.js' */
/** @import {HistoryWidget} from '../history-widget/history-widget.js' */
/** @import {Cell} from './cell.js' */

/**
 * @typedef {object} NonogramConfig
 * @property {string} slotSelector
 * @property {string} dimensionsSelector
 * @property {string} difficultySelector
 * @property {string} restartSelector
 * @property {string} submitSelector
 * @property {!HistoryWidget} historyWidget
 * @property {!ColorPicker} colorPicker
 * @property {!HintBox} hintBox
 */

/**
 * Represents the clues labeling each row and column of the nonogram puzzle,
 * where each clue is a list of the sizes of each contiguous block of filled
 * cells in that line.
 * @typedef {object} NonogramClues
 * @property {!number[][]} rowClues A list of clues for each row.
 * @property {!number[][]} colClues A list of clues for each column.
 */

/**
 * @typedef CellState
 * @property {string} color
 * @property {!Cell} state
 * @property {number} row
 * @property {number} column
 */

/**
 * @typedef NonogramAction
 * @property {!CellState} before
 * @property {!CellState} after
 */

/** Component that manages the nonogram puzzle. */
export class Nonogram {
  /** @type {!HTMLTableElement} */
  #nonogram;
  /** @type {!ColorPicker} */
  #colorPicker;
  /** @type {!HintBox} */
  #hintBox;
  /** @type {!HistoryWidget<!NonogramAction>} */
  #historyWidget;

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
    historyWidget,
    colorPicker,
    hintBox,
  }) {
    this.#nonogram = assertInstance(
      queryElement(slotSelector),
      HTMLTableElement
    );
    this.#wireNonogram();

    this.#historyWidget = historyWidget;
    this.#wireHistoryWidget();

    this.#colorPicker = colorPicker;
    this.#colorPicker.addEventListener('color.clear', (event) => {
      const color = /** @type {!CustomEvent<?string>} */ (event).detail;
      this.#clear({color: color ?? undefined});
    });
    this.#hintBox = hintBox;

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
    this.#wireDimensionsSelect(dimensionsSelect);

    const difficultySelect = assertInstance(
      queryElement(difficultySelector),
      HTMLSelectElement
    );
    this.#wireDifficultySelect(difficultySelect);

    this.reset();
  }

  #wireNonogram() {
    this.#nonogram.addEventListener('mousedown', this.#userToggleCell);
    this.#nonogram.addEventListener('mouseover', this.#userToggleCell);
    this.#nonogram.addEventListener('contextmenu', (event) => {
      this.#userUpdateCell(event, /* locking= */ true);
    });
  }

  /** @param {!MouseEvent} event */
  #userToggleCell = (event) => {
    const primaryPressed = !!(event.buttons & MouseButton.PRIMARY);
    const secondaryPressed = !!(event.buttons & MouseButton.SECONDARY);
    // Only process events with one mouse button down
    if (primaryPressed === secondaryPressed) {
      cancelGridEvents(event);
      return;
    }

    this.#userUpdateCell(event, /* locking= */ secondaryPressed);
  };

  /**
   * @param {!MouseEvent} event
   * @param {boolean} locking
   */
  #userUpdateCell(event, locking) {
    // Prevent duplicate event handling on mouse-driven devices while still
    // preventing context menu.
    cancelGridEvents(event);
    if (
      event.type === 'contextmenu' &&
      event instanceof PointerEvent &&
      event.pointerType === 'mouse'
    ) {
      return;
    }

    const element = /** @type {!Element} */ (event.target);
    const cellBox = element.closest('td .cell');
    if (!cellBox) return;

    const [row, column] = fromCellId(
      /** @type {!HTMLElement} */ (cellBox.parentElement).id
    );
    const before = this.#getCellState(row, column);
    if (!this.#toggleCellBox(row, column, {locking})) return;

    // Change is committed.
    const after = this.#getCellState(row, column);
    this.#historyWidget.push({before, after});
  }

  #wireHistoryWidget() {
    this.#historyWidget.addEventListener('history.undo', (event) => {
      const action = /** @type {!CustomEvent<NonogramAction>} */ (event).detail;
      this.#undoAction(action);
    });
    this.#historyWidget.addEventListener('history.redo', (event) => {
      const action = /** @type {!CustomEvent<NonogramAction>} */ (event).detail;
      this.#redoAction(action);
    });
  }

  /** @param {!HTMLSelectElement} dimensionsSelect */
  #wireDimensionsSelect(dimensionsSelect) {
    const initialDimensions = localStorage.getItem('nonogram.dimensions') ?? '';
    if (isValidOption(dimensionsSelect, initialDimensions)) {
      dimensionsSelect.value = initialDimensions;
    }

    dimensionsSelect.addEventListener('change', () => {
      localStorage.setItem('nonogram.dimensions', dimensionsSelect.value);
      this.#dimensions = parseInt(dimensionsSelect.value);
      this.reset();
    });
    this.#dimensions = parseInt(dimensionsSelect.value);
  }

  /** @param {!HTMLSelectElement} difficultySelect */
  #wireDifficultySelect(difficultySelect) {
    const initialDifficulty = localStorage.getItem('nonogram.difficulty') ?? '';
    if (isValidOption(difficultySelect, initialDifficulty)) {
      difficultySelect.value = initialDifficulty;
    }

    difficultySelect.addEventListener('change', () => {
      localStorage.setItem('nonogram.difficulty', difficultySelect.value);
      this.#difficulty = parseFloat(difficultySelect.value);
      this.reset();
    });
    this.#difficulty = parseFloat(difficultySelect.value);
  }

  /** @param {!NonogramAction} action */
  #undoAction({before}) {
    const {row, column, state, color} = before;
    this.#toggleCellBox(row, column, {forcedState: state, forcedColor: color});
  }

  /** @param {!NonogramAction} action */
  #redoAction({after}) {
    const {row, column, state, color} = after;
    this.#toggleCellBox(row, column, {forcedState: state, forcedColor: color});
  }

  /** Reset to random puzzle and calculate grid clues. */
  reset() {
    this.#colorPicker.reset();
    this.#hintBox.reset();
    this.#historyWidget.reset();

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
  }

  /**
   * Clears the `#userPuzzle` and `#nonogram` of a specific `color` if provided,
   * otherwise clears all colors.
   * @param {object} [options={}]
   * @param {string} [options.color] Clears a specific CSS color when provided.
   * @param {boolean} [options.force] Whether to forcefully clear locked cells.
   */
  #clear({color, force} = {}) {
    /** @type {!Array<[number, number]>} */
    const lockedCells = [];
    let cellsCleared = false;
    for (let row = 0; row < this.#dimensions; row++) {
      for (let col = 0; col < this.#dimensions; col++) {
        const cellBox = /** @type {!HTMLElement} */ (
          queryElement(`#${getCellId(row, col)} > .cell`)
        );
        if (!color || cellBox.style.getPropertyValue('--color') === color) {
          if (!force && this.#userPuzzle[row][col] === CellEnum.LOCKED) {
            lockedCells.push([row, col]);
            continue;
          }

          const cellCleared = this.#toggleCellBox(row, col, {
            forcedState: CellEnum.EMPTY,
          });
          cellsCleared ||= cellCleared;
        }
      }
    }

    // Only clear locked cells if nothing else is cleared.
    if (!cellsCleared) {
      for (const [row, col] of lockedCells) {
        this.#toggleCellBox(row, col, {
          forcedState: CellEnum.EMPTY,
        });
      }
    }

    // Only reset when "clear all" actually clears everything.
    if (!color && (!cellsCleared || !lockedCells.length)) {
      this.#colorPicker.reset();
    }
    this.#historyWidget.reset();
  }

  /**
   * @param {number} row
   * @param {number} column
   * @returns {!CellState}
   */
  #getCellState(row, column) {
    const state = this.#userPuzzle[row][column];
    const cellBox = /** @type {!HTMLElement} */ (
      queryElement(`#${getCellId(row, column)} > .cell`)
    );
    const color =
      cellBox.style.getPropertyValue('--color') || this.#colorPicker.playColor;
    return {row, column, state, color};
  }

  /**
   * Toggles the state of the nonogram cell, or sets it to `forcedState` when
   * provided.
   * @param {number} row
   * @param {number} col
   * @param {object} [options={}]
   * @param {boolean} [options.locking] Whether to toggle locking.
   * @param {Cell} [options.forcedState] A cell state to force.
   * @param {string} [options.forcedColor] Defaults to play color.
   * @returns {boolean} Whether a change was made.
   */
  #toggleCellBox(row, col, {locking, forcedState, forcedColor} = {}) {
    const cellBox = /** @type {!HTMLElement} */ (
      queryElement(`#${getCellId(row, col)} > .cell`)
    );
    const initialState = this.#userPuzzle[row][col];
    const finalState = forcedState ?? toggleCell(initialState, locking);
    if (initialState === finalState) return false;

    const color = forcedColor ?? this.#colorPicker.playColor;

    this.#userPuzzle[row][col] = finalState;
    // Don't change color when locking unless by force.
    if (forcedColor || coerceCell(initialState) !== coerceCell(finalState)) {
      cellBox.style.setProperty('--color', color);
    }
    cellBox.classList.toggle(
      'filled',
      coerceCell(finalState) === CellEnum.FILLED
    );
    cellBox.classList.toggle('locked', finalState === CellEnum.LOCKED);

    const crossIcon = assertInstance(
      cellBox.querySelector('.cross'),
      HTMLElement
    );
    crossIcon.hidden = finalState !== CellEnum.CROSSED;

    const lockIcon = assertInstance(
      cellBox.querySelector('.lock'),
      HTMLElement
    );
    lockIcon.hidden = finalState !== CellEnum.LOCKED;

    return true;
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
    this.#clear({force: true});
  }
}

/** @param {!Event} event */
function cancelGridEvents(event) {
  const element = /** @type {!Element} */ (event.target);
  if (element.closest('td:has(.cell)')) {
    event.preventDefault();
    event.stopPropagation();
  }
}

/**
 * @param {!HTMLSelectElement} selectControl
 * @param {string} optionValue
 * @returns {boolean}
 */
function isValidOption(selectControl, optionValue) {
  return Iterator.from(selectControl.options).some(
    (option) => option.value === optionValue
  );
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
        if (coerceCell(cell) === CellEnum.FILLED) {
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
