/** @import {HintBoxHints} from './index.js' */

/**
 * Renders the hint box for the nonogram.
 * @param {!HintBoxHints} hints The row and column hints.
 * @param {boolean} enabled Whether any hints should be rendered.
 * @returns {!DocumentFragment}
 */
export function renderHintBox({rows, cols}, enabled) {
  rows = rows.toSorted((a, b) => a - b);
  cols = cols.toSorted((a, b) => a - b);

  const fragment = document.createDocumentFragment();
  if (!enabled) {
    fragment.append(renderEmphasizedMessage('Hints disabled.'));
    return fragment;
  }

  fragment.append(
    renderBoldMessage('Rows:'),
    ' ',
    rows.length ? formatHints(rows) : renderEmphasizedMessage('None.')
  );
  fragment.append(document.createElement('br'));
  fragment.append(
    renderBoldMessage('Columns:'),
    ' ',
    cols.length ? formatHints(cols) : renderEmphasizedMessage('None.')
  );

  return fragment;
}

/**
 * @param {string} text
 * @returns {!HTMLElement}
 */
function renderEmphasizedMessage(text) {
  const emTag = document.createElement('em');
  emTag.textContent = text;
  return emTag;
}

/**
 * @param {string} text
 * @returns {!HTMLElement}
 */
function renderBoldMessage(text) {
  const boldTag = document.createElement('b');
  boldTag.textContent = text;
  return boldTag;
}

/** Used to format row and column lists. */
const listFormatter = new Intl.ListFormat('en-US', {
  style: 'long',
  type: 'conjunction',
});

/**
 * Formats the list of hints into a localized string.
 * @param {!number[]} hints
 * @returns {string}
 */
function formatHints(hints) {
  return listFormatter.format(formatNumberListParts(hints)) + '.';
}

/**
 * Formats a range, e.g. "1–3"; "6", "7"; or "11".
 * @param {number} start
 * @param {number} end
 * @yields {string}
 */
function* formatRange(start, end) {
  if (end - start >= 2) {
    yield `${start.toLocaleString('en-US')}–${end.toLocaleString('en-US')}`;
    return;
  }

  yield start.toLocaleString('en-US');
  if (start !== end) yield end.toLocaleString('en-US');
}

/**
 * Formats a sorted list of numbers into a list of ranges.
 * @param {!number[]} list
 * @yields {string}
 */
function* formatNumberListParts(list) {
  if (!list.length) return;

  let rangeStart = list[0],
    rangeEnd = list[0];
  for (const value of list.values().drop(1)) {
    if (rangeEnd + 1 === value) {
      rangeEnd = value;
      continue;
    }

    yield* formatRange(rangeStart, rangeEnd);
    rangeStart = rangeEnd = value;
  }

  yield* formatRange(rangeStart, rangeEnd);
}
