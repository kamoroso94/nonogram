import {LOCALE} from '../config.js';
import {getStatistics} from '../services/statistics-service.js';
import {assertUnreachable} from '../utils/asserts.js';
import {
  durationToIsoString,
  formatDuration,
  TIME_FRAMES,
} from '../utils/time.js';
import {DIMENSIONS} from './statistics.js';

/**
 * @import {TimeFrame} from '../utils/time.js'
 * @import {Difficulty, Statistics} from './statistics.js'
 */

/**
 * Renders the timely statistics tables for the given `difficulty`.
 * @param {!Element} root
 * @param {Difficulty} difficulty
 * @returns {void}
 */
export function renderStatistics(root, difficulty) {
  root.querySelector('.loading')?.remove();
  for (const timeFrame of TIME_FRAMES) {
    renderStatisticsTable(root, timeFrame, difficulty);
  }
}

/**
 * Renders a statistics table for the given `timeFrame` and `difficulty`.
 * @param {!Element} root
 * @param {TimeFrame} timeFrame
 * @param {Difficulty} difficulty
 * @returns {void}
 */
function renderStatisticsTable(root, timeFrame, difficulty) {
  const table = getStatsTable(root, timeFrame);
  for (const [index, dimension] of DIMENSIONS.entries()) {
    const entry = getStatistics(timeFrame, difficulty, dimension);
    updateStatsRow(table, index + 1, entry);
  }
}

/**
 * Gets or creates the statistics table for the given `timeFrame`.
 * @param {!Element} root
 * @param {TimeFrame} timeFrame
 * @returns {!HTMLTableElement}
 */
function getStatsTable(root, timeFrame) {
  const tableId = getStatsTableId(timeFrame);
  let table = /** @type {?HTMLTableElement} */ (
    root.querySelector(`#${tableId}`)
  );
  if (table) return table;

  table = document.createElement('table');
  table.id = tableId;
  table.createCaption().append(getTableCaption(timeFrame));
  insertColumnHeaders(table);
  insertRowHeaders(table);
  root.append(table);
  return table;
}

/**
 * @param {TimeFrame} timeFrame
 * @returns {string}
 */
function getStatsTableId(timeFrame) {
  return `stats-table-${timeFrame}`;
}

/**
 * Returns the appropriate table caption for the given `timeFrame`.
 * @param {TimeFrame} timeFrame
 * @returns {string}
 */
function getTableCaption(timeFrame) {
  switch (timeFrame) {
    case 'all-time':
      return 'All Time';
    case 'weekly':
      return 'Weekly';
    default:
      assertUnreachable(timeFrame, `Unknown time frame "${timeFrame}"`);
  }
}

/**
 * Inserts the column headers at the top of the given `table`.
 * @param {!HTMLTableElement} table
 * @returns {void}
 */
function insertColumnHeaders(table) {
  const row = table.insertRow(0);
  row.insertCell().classList.add('empty');
  row.append(createTableHeader('Solved', 'col'));
  row.append(createTableHeader('Best time', 'col'));
}

/**
 * Inserts the row headers into the given `table`.
 * @param {!HTMLTableElement} table
 * @returns {void}
 */
function insertRowHeaders(table) {
  for (const dimension of DIMENSIONS) {
    const row = table.insertRow();
    row.append(createTableHeader(`${dimension}×${dimension}`, 'row'));
  }
}

/**
 * Generates a table header cell with the given `label` and `scope`.
 * @param {string} label
 * @param {('row' | 'col')} [scope]
 * @returns {!HTMLTableCellElement} A `<th>` element.
 */
function createTableHeader(label, scope) {
  const tableHeader = document.createElement('th');
  if (scope) tableHeader.scope = scope;
  tableHeader.append(label);
  return tableHeader;
}

/**
 * Adds the statistics `entry` for the given `dimension` to the `table`.
 * @param {!HTMLTableElement} table
 * @param {number} rowIndex
 * @param {(!Statistics | undefined)} entry
 * @returns {void}
 */
function updateStatsRow(table, rowIndex, entry) {
  const row = table.rows[rowIndex];
  let cellIndex = 1;

  if (!entry) {
    setCellData(row, cellIndex++, null);
    setCellData(row, cellIndex++, null);
    return;
  }

  setCellData(row, cellIndex++, entry.totalSolved.toLocaleString(LOCALE));
  setCellData(row, cellIndex++, createBestTime(entry.bestTime));
}

/** Maximum displayed time. */
const MAX_TIME = 100 * 60 * 60 * 1000 - 1; // 99:59:59.999

/**
 * Creates a `<time>` element containing the best time for solving a nonogram,
 * capped to less than 100 hours.
 * @param {number} bestTime
 * @returns {!HTMLTimeElement}
 */
function createBestTime(bestTime) {
  bestTime = Math.min(bestTime, MAX_TIME);
  const time = document.createElement('time');
  time.dateTime = durationToIsoString(bestTime);
  time.textContent = formatDuration(bestTime);
  return time;
}

/**
 * @param {!HTMLTableRowElement} row
 * @param {number} cellIndex
 * @param {?(Node | string)} data
 * @returns {void}
 * @throws {!RangeError} When the `cellIndex` is beyond the row end.
 */
function setCellData(row, cellIndex, data) {
  if (cellIndex > row.cells.length) {
    throw new RangeError('Cannot insert cell beyond row end');
  }

  if (cellIndex === row.cells.length) row.insertCell();
  const cell = row.cells[cellIndex];
  cell.classList.toggle('null', !data);
  cell.replaceChildren(data || '—');
}
