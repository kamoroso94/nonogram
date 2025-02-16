/** @import {NonogramClues} from './nonogram.js' */

/**
 * Renders the Nonogram table structure.
 * @param {number} size
 * @returns {!DocumentFragment}
 */
export function renderNonogram(size) {
  const fragment = document.createDocumentFragment();
  fragment.append(renderNonogramTopRow(size));

  const grid = renderNonogramGrid(size);
  insertNonogramRowHeaders(grid);
  fragment.append(grid);

  return fragment;
}

/**
 * @param {!HTMLTableElement} nonogram
 * @param {!NonogramClues} gridClues
 */
export function renderGridClues(nonogram, gridClues) {
  renderColumnClues(nonogram, gridClues.colClues);
  renderRowClues(nonogram, gridClues.rowClues);
}

/**
 * @param {!HTMLTableElement} nonogram
 * @param {!number[][]} colClues
 */
function renderColumnClues(nonogram, colClues) {
  const firstRow = nonogram.rows[0]?.cells;
  if (!firstRow || firstRow.length - 1 !== colClues.length) {
    throw new TypeError('Incorrect number of column clues');
  }

  for (let i = 0; i < colClues.length; i++) {
    const colClue = colClues[i];
    const columnHeader = firstRow[i + 1];
    columnHeader.replaceChildren(colClue[0].toLocaleString('en-US'));
    for (const blockSize of colClue.values().drop(1)) {
      columnHeader.append(document.createElement('br'));
      columnHeader.append(blockSize.toLocaleString('en-US'));
    }
  }
}

/**
 * @param {!HTMLTableElement} nonogram
 * @param {!number[][]} rowClues
 */
function renderRowClues(nonogram, rowClues) {
  if (nonogram.rows.length - 1 !== rowClues.length) {
    throw new TypeError('Incorrect number of row clues');
  }

  for (let i = 0; i < rowClues.length; i++) {
    const row = nonogram.rows[i + 1];
    const rowClue = rowClues[i];
    const rowHeader = row.cells[0];
    rowHeader.replaceChildren(formatRowClue(rowClue));
  }
}

/** Used to format the row clues. */
const listFormatter = new Intl.ListFormat('en-US', {
  type: 'unit',
  style: 'narrow',
});

/**
 * Formats a row clue into a localized string.
 * @param {!number[]} clue
 * @returns {string}
 */
function formatRowClue(clue) {
  return listFormatter.format(clue.map((x) => x.toLocaleString('en-US')));
}

/**
 * Renders the first row of the Nonogram table.
 * @param {number} size
 * @returns {!HTMLTableRowElement}
 */
function renderNonogramTopRow(size) {
  const firstRow = document.createElement('tr');
  const emptyCell = document.createElement('td');
  emptyCell.classList.add('empty');
  firstRow.append(emptyCell);

  for (let i = 0; i < size; i++) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.title = `C${i + 1}`;
    firstRow.append(th);
  }

  return firstRow;
}

/**
 * Renders the main Nonogram grid area.
 * @param {number} size
 * @returns {!DocumentFragment}
 */
function renderNonogramGrid(size) {
  const fragment = document.createDocumentFragment();
  for (let row = 0; row < size; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < size; col++) {
      const td = document.createElement('td');
      td.id = getCellId(row, col);
      td.append(renderNonogramCell());
      tr.append(td);
    }
    fragment.append(tr);
  }
  return fragment;
}

/**
 * Renders a nonogram cell with a hidden cross.
 * @returns {!HTMLDivElement}
 */
function renderNonogramCell() {
  const cell = document.createElement('div');
  cell.classList.add('cell');

  const cross = renderIcon(MATERIAL_SYMBOL_CLOSE);
  cross.classList.add('cross');
  cell.append(cross);

  const lock = renderIcon(MATERIAL_SYMBOL_LOCK);
  lock.classList.add('lock');
  cell.append(lock);
  return cell;
}

const MATERIAL_SYMBOL_CLOSE = 'close';
const MATERIAL_SYMBOL_LOCK = 'lock';

/**
 * Renders a Material Symbol icon by the given `name`.
 * @param {string} name
 * @param {('outlined' | 'rounded' | 'sharp')} [style='sharp']
 * @returns {!HTMLSpanElement}
 */
function renderIcon(name, style = 'sharp') {
  const icon = document.createElement('span');
  icon.hidden = true;
  icon.classList.add(`material-symbols-${style}`);
  icon.textContent = name;
  return icon;
}

/**
 * Inserts the row headers for the nonogram table.
 * @param {!DocumentFragment} rows
 */
function insertNonogramRowHeaders(rows) {
  for (let i = 0; i < rows.childElementCount; i++) {
    const tr = rows.children[i];
    const th = document.createElement('th');
    th.scope = 'row';
    th.title = `R${i + 1}`;
    tr.prepend(th);
  }
}

/** Domain of characters used to encode row and column numbers. */
const DOMAIN = 'abcdefghijklmnopqrst';

/**
 * @param {number} row
 * @param {number} column
 * @returns {string} An ID in the form of `"<ROW>-<COL>"` where `ROW` and `COL`
 *     are characters in `DOMAIN`.
 * @throws {!RangeError} Whenever `row` or `column` exceeds the `DOMAIN`.
 */
export function getCellId(row, column) {
  if (row >= DOMAIN.length || column >= DOMAIN.length) {
    throw new RangeError('Row and column numbers exceed the domain');
  }

  return `${DOMAIN[row]}-${DOMAIN[column]}`;
}

/**
 * @param {string} id An ID in the form of `"<ROW>-<COL>"` where `ROW` and `COL`
 *     are characters in `DOMAIN`.
 * @returns {![row: number, col: number]}
 */
export function fromCellId(id) {
  return [DOMAIN.indexOf(id[0]), DOMAIN.indexOf(id[2])];
}
