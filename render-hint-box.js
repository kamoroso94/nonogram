/** @import {HintBoxHints} from './hint-box.js' */

/**
 * Renders the hint box for the nonogram.
 * @param {!HintBoxHints} hints The row and column hints.
 * @param {boolean} enabled Whether any hints should be rendered.
 * @returns {!DocumentFragment}
 */
export function renderHintBox({rows, cols}, enabled) {
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
  return (
    listFormatter.format(hints.map((x) => x.toLocaleString('en-US'))) + '.'
  );
}
