import {ColorPicker} from './color-picker/color-picker.js';
import {HintBox} from './hint-box/hint-box.js';
import {HistoryWidget} from './history-widget/history-widget.js';
import {Nonogram} from './nonogram/nonogram.js';
import {assertExists} from './utils/asserts.js';

/** @import {Color} from './color-picker/color-picker.js'; */

const MAX_UNDO_HISTORY = 50;

/** @type {readonly Color[]} */
const PALETTE = [
  'default',
  'red',
  'green',
  'blue',
  'orange',
  'purple',
  'gray',
].map((color) => ({
  name: color,
  cssColor: `var(--color-${color})`,
}));

function initializeNonogram() {
  const historyWidget = new HistoryWidget({
    undoSelector: '#undo-action',
    redoSelector: '#redo-action',
    maxHistory: MAX_UNDO_HISTORY,
  });

  const colorPicker = new ColorPicker({
    slotSelector: '#color-picker',
    clearColorSelector: '#clear-color',
    clearAllSelector: '#clear-all',
    palette: PALETTE,
  });

  const hintBox = new HintBox({
    slotSelector: '#hint-box',
    checkboxSelector: '#hints-setting',
  });

  void new Nonogram({
    slotSelector: '#nonogram-game',
    dimensionsSelector: '#dimensions-select',
    difficultySelector: '#difficulty-select',
    restartSelector: '#play-game',
    submitSelector: '#submit-answer',
    historyWidget,
    colorPicker,
    hintBox,
  });
}

function initializeGallery() {
  if (!document.fullscreenEnabled) return;

  const gallery = assertExists(document.getElementById('gallery'));
  gallery.addEventListener('click', (event) => {
    if (document.fullscreenElement) return;

    const element = /** @type {!HTMLElement} */ (event.target);
    if (!element.matches('img')) return;

    element.requestFullscreen({navigationUI: 'show'});
  });
}

initializeNonogram();
initializeGallery();
