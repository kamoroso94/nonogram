import {CellEnum, coerceCell, toggleCell} from './cell.js';
import {DEFAULT_COLOR} from './color-picker.js';
/** @import {Cell} from './cell.js' */
/** @import {SetPlayerColorCallback} from './color-picker.js' */

const DOMAIN = 'abcdefghijklmnopqrst';

let mouseBtn = false;
const keyLegend = {top: [], left: []};
let playColor = DEFAULT_COLOR;

/**
 * Setter for player color to hook into color picker UI.
 * @type {!SetPlayerColorCallback}
 */
export const setPlayerColor = (color) => {
  playColor = color;
};

/** @type {number} */
let dim;
/** @type {Cell[][]} */
let keyPuzzle;
/** @type {Cell[][]} */
let userPuzzle;
/** @type {HTMLTableElement} */
let nonogram;

/**
 * Initializes the nonogram game.
 *
 * Note: Must not be called before the "DOMContentLoaded" document event.
 */
export function initializeNonogram() {
  document.addEventListener('mousedown', () => {
    mouseBtn = true;
  });
  document.addEventListener('mouseup', () => {
    mouseBtn = false;
  });
  init();
}

/** Initializes the game. */
function init() {
  const dimTag = document.getElementById('dimensions');
  const difTag = document.getElementById('difficulty');
  nonogram = document.getElementById('nonogram');

  dim = parseInt(dimTag.value);
  const dif = parseFloat(difTag.value);

  keyPuzzle = matrix(dim, dim);
  userPuzzle = matrix(dim, dim);

  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      // make key puzzle random and user puzzle empty
      keyPuzzle[i][j] =
        Math.random() < dif ? CellEnum.FILLED : CellEnum.CROSSED;
      userPuzzle[i][j] = CellEnum.EMPTY;
    }
  }

  // recreate nonogram
  while (nonogram.firstChild) {
    nonogram.removeChild(nonogram.firstChild);
  }

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < dim + 1; i++) {
    const tr = document.createElement('tr');

    for (let j = 0; j < dim + 1; j++) {
      let td, th;

      if (i === 0) {
        if (j === 0) {
          td = document.createElement('td');
          td.classList.add('empty');
          tr.appendChild(td);
        } else {
          th = document.createElement('th');
          th.title = 'C' + j;
          tr.appendChild(th);
        }
      } else {
        if (j === 0) {
          th = document.createElement('th');
          th.title = 'R' + i;
          tr.appendChild(th);
        } else {
          td = document.createElement('td');
          td.id = DOMAIN.charAt(i - 1) + DOMAIN.charAt(j - 1);
          td.appendChild(document.createElement('div'));
          tr.appendChild(td);
        }
      }
    }

    fragment.appendChild(tr);
  }
  nonogram.appendChild(fragment);

  const tdTags = nonogram.getElementsByTagName('td');

  // create nonogram interactivity
  for (let i = 1; i < tdTags.length; i++) {
    const elem = tdTags[i].firstElementChild;

    elem.addEventListener('mouseover', () => {
      if (mouseBtn) {
        toggleSqr(elem);
      }
    });
    elem.addEventListener('mousedown', () => {
      toggleSqr(elem);
    });
  }

  dimTag.addEventListener('change', init);
  difTag.addEventListener('change', init);

  document.getElementById('hints').addEventListener('change', (event) => {
    gameHints(event.currentTarget.checked);
  });
  document.getElementById('reset1').addEventListener('click', () => {
    gameReset(/* allColors= */ false);
  });
  document.getElementById('reset2').addEventListener('click', () => {
    gameReset(/* allColors= */ true);
  });
  document.getElementById('play').addEventListener('click', init);
  document.getElementById('submit').addEventListener('click', checkPuzzle);

  gameSetup();
}

/** Sets up a new game. */
function gameSetup() {
  const allRows = nonogram.getElementsByTagName('tr');
  const firstRow = allRows[0].getElementsByTagName('th');

  keyLegend.top.length = keyLegend.left.length = 0;

  // column hints
  for (let i = 0; i < dim; i++) {
    const sum = [];
    let count = 0;

    // get column hints
    for (let j = 0; j < dim; j++) {
      if (keyPuzzle[j][i] === CellEnum.FILLED) count++;
      if (
        count > 0 &&
        (keyPuzzle[j][i] === CellEnum.CROSSED || j === dim - 1)
      ) {
        sum.push(count);
        count = 0;
      }
    }
    if (sum.length === 0) {
      sum.push(0);
    }

    keyLegend.top.push(sum);
    while (firstRow[i].firstChild) {
      firstRow[i].removeChild(firstRow[i].firstChild);
    }

    // put column hints
    firstRow[i].appendChild(document.createTextNode(sum[0]));
    for (let j = 1; j < sum.length; j++) {
      firstRow[i].appendChild(document.createElement('br'));
      firstRow[i].appendChild(document.createTextNode(sum[j]));
    }
  }

  // row hints
  for (let i = 0; i < dim; i++) {
    const thTag = allRows[i + 1].firstElementChild;
    const sum = [];
    let count = 0;

    // get row hints
    for (let j = 0; j < dim; j++) {
      if (keyPuzzle[i][j] === CellEnum.FILLED) count++;
      if (
        count > 0 &&
        (keyPuzzle[i][j] === CellEnum.CROSSED || j === dim - 1)
      ) {
        sum.push(count);
        count = 0;
      }
    }
    if (sum.length === 0) {
      sum.push(0);
    }

    keyLegend.left.push(sum);
    while (thTag.firstChild) {
      thTag.removeChild(thTag.firstChild);
    }

    // put row hints
    let rowHint = sum[0];
    for (let j = 1; j < sum.length; j++) {
      rowHint += ' ';
      rowHint += sum[j];
    }
    thTag.appendChild(document.createTextNode(rowHint));
  }

  document.getElementById('hints').checked = false;
  const hintBox = document.getElementById('hintBox');
  while (hintBox.firstChild) {
    hintBox.removeChild(hintBox.firstChild);
  }
  const em = document.createElement('em');
  em.appendChild(document.createTextNode('Hints disabled.'));
  hintBox.appendChild(em);
  resetColor();
}

/**
 * Resets `userPuzzle` and nonogram.
 * @param {boolean} allColors Whether to reset all colors or just the current
 *    color.
 */
function gameReset(allColors) {
  const tdTags = nonogram.getElementsByTagName('td');

  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      if (
        allColors ||
        document.getElementById(DOMAIN.charAt(i) + DOMAIN.charAt(j))
          .firstElementChild.style.color === playColor
      ) {
        userPuzzle[i][j] = CellEnum.EMPTY;
      }
    }
  }

  for (let i = 1; i < tdTags.length; i++) {
    const elem = tdTags[i].firstElementChild;

    if (allColors || elem.style.color === playColor) {
      elem.style.backgroundColor = '';
      elem.innerHTML = '';
    }
  }

  if (allColors) {
    resetColor();
  }
}

/** Checks to see if the puzzle is in a solved state. */
function checkPuzzle() {
  /** @type {!Cell[][]} */
  const arr = matrix(dim, dim);
  const userLegend = {top: [], left: []};
  const isWin = {top: true, left: true};

  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      arr[i][j] = coerceCell(userPuzzle[i][j]);
    }
  }

  // check top legends
  for (let i = 0; i < dim; i++) {
    const sum = [];
    let a = 0;

    for (let j = 0; j < dim; j++) {
      if (arr[j][i] === CellEnum.FILLED) a++;
      if (
        ((arr[j][i] === CellEnum.CROSSED || j === dim - 1) && a > 0) ||
        (j === dim - 1 && sum.length < 1 && a < 1)
      ) {
        sum.push(a);
        a = 0;
      }
    }

    userLegend.top.push(sum);
  }

  // check left legends
  for (let i = 0; i < dim; i++) {
    const sum = [];
    let a = 0;

    for (let j = 0; j < dim; j++) {
      if (arr[i][j] === CellEnum.FILLED) a++;
      if (
        (a > 0 && (arr[i][j] === CellEnum.CROSSED || j === dim - 1)) ||
        (a < 1 && j === dim - 1 && sum.length < 1)
      ) {
        sum.push(a);
        a = 0;
      }
    }

    userLegend.left.push(sum);
  }

  // compare top legends
  for (let i = 0; i < dim; i++) {
    if (keyLegend.top[i].length === userLegend.top[i].length) {
      for (let j = 0; j < userLegend.top[i].length; j++) {
        if (keyLegend.top[i][j] !== userLegend.top[i][j]) {
          isWin.top = false;
          break;
        }
      }

      if (!isWin.top) {
        break;
      }
    } else {
      isWin.top = false;
      break;
    }
  }

  if (isWin.top) {
    // compare left legends
    for (let i = 0; i < dim; i++) {
      if (keyLegend.left[i].length === userLegend.left[i].length) {
        for (let j = 0; j < userLegend.left[i].length; j++) {
          if (keyLegend.left[i][j] !== userLegend.left[i][j]) {
            isWin.left = false;
            break;
          }
        }

        if (!isWin.left) {
          break;
        }
      } else {
        isWin.left = false;
        break;
      }
    }
  }

  // replace with dialog
  if (isWin.top && isWin.left) {
    if (confirm('You won!  Click OK to play a new game.')) {
      init();
    }
  } else {
    alert('You lose!');
    gameReset(/* allColors= */ true);
  }
}

/**
 * Toggles the state of the nonogram cell.
 * @param {HTMLDivElement} box The box inside the `<td>`.
 */
function toggleSqr(box) {
  const a = DOMAIN.indexOf(box.parentNode.id.charAt(0));
  const b = DOMAIN.indexOf(box.parentNode.id.charAt(1));

  userPuzzle[a][b] = toggleCell(userPuzzle[a][b]);

  switch (userPuzzle[a][b]) {
    case CellEnum.CROSSED:
      box.style.backgroundColor = '';
      box.style.color = playColor;
      box.textContent = '╳';
      break;

    case CellEnum.EMPTY:
      box.innerHTML = '';
      break;

    case CellEnum.FILLED:
      box.style.backgroundColor = playColor;
      box.style.color = playColor;
      break;

    default:
      throw new TypeError(`Unknown cell "${cell}"`);
  }
}

// TODO: change innerHTML to appendChild
/**
 * Renders the game hints into the `#hintBox` element.
 * @param {boolean} enabled Whether game hints should be enabled.
 */
function gameHints(enabled) {
  const box = document.getElementById('hintBox');

  if (!enabled) {
    box.innerHTML = '<i>Hints disabled.</i>';
    return;
  }

  let msg = '<b>Rows:</b> ';

  for (let i = 0; i < keyLegend.left.length; i++) {
    let sum = 0;
    let max = 0;

    for (let j = 0; j < keyLegend.left[i].length; j++) {
      sum += keyLegend.left[i][j];
      max = Math.max(keyLegend.left[i][j], max);
    }

    if (
      sum + keyLegend.left[i].length - 1 + max - 1 >= dim ||
      keyLegend.left[i] === 0
    ) {
      msg += i + 1 + ', ';
    }
  }

  if (msg.endsWith('> ')) {
    msg += '<i>None.</i>';
  } else {
    msg = msg.slice(0, msg.length - 2) + '.';
  }

  msg += '<br /><b>Columns:</b> ';

  for (let i = 0; i < keyLegend.top.length; i++) {
    let sum = 0;
    let max = 0;

    for (let j = 0; j < keyLegend.top[i].length; j++) {
      sum += keyLegend.top[i][j];
      max = Math.max(keyLegend.top[i][j], max);
    }

    if (
      sum + keyLegend.top[i].length - 1 + max - 1 >= dim ||
      keyLegend.top[i] === 0
    ) {
      msg += i + 1 + ', ';
    }
  }

  if (msg.endsWith('> ')) {
    msg += '<i>None.</i>';
  } else {
    msg = msg.slice(0, msg.length - 2) + '.';
  }

  box.innerHTML = msg;
}

/** Resets the color picker component. */
function resetColor() {
  document.getElementById('color-default').checked = true;
  playColor = DEFAULT_COLOR;
  document.getElementById('reset1').innerHTML = 'Clear default';
}

/**
 * Creates a matrix with `rows` rows and `cols` columns.
 * @template {T}
 * @param {number} rows Total number of rows.
 * @param {number} cols Total number of columns.
 * @returns {!T[][]}
 */
function matrix(rows, cols) {
  return Array.from({length: rows}, () => Array(cols));
}
