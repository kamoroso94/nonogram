import {ColorPicker} from './color-picker/color-picker.js';
import {MAX_UNDO_HISTORY, PALETTE} from './config.js';
import {HintBox} from './hint-box/hint-box.js';
import {HistoryWidget} from './history-widget/history-widget.js';
import {Nonogram} from './nonogram/nonogram.js';
import {StatisticsWidget} from './statistics-widget/statistics-widget.js';
import {assertExists} from './utils/asserts.js';
import {isEnabled, NONOGRAM_STATISTICS} from './utils/experiments.js';

/** @returns {void} */
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

  if (isEnabled(NONOGRAM_STATISTICS)) {
    assertExists(document.getElementById('statistics')).hidden = false;
    void new StatisticsWidget({
      rootSelector: '#stats-tables',
      difficultySelector: '#stats-difficulty',
      deleteSelector: '#stats-clear',
    });
  }
}

/** @returns {void} */
function initializeGallery() {
  if (!document.fullscreenEnabled) return;

  const gallery = assertExists(document.getElementById('gallery'));
  gallery.addEventListener('click', (event) => {
    const element = /** @type {!HTMLElement} */ (event.target);
    if (!element.matches('img')) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      element.requestFullscreen({navigationUI: 'show'});
    }
  });
}

initializeNonogram();
initializeGallery();
