import {Nonogram} from './nonogram/index.js';

const MAX_HISTORY = 50;

document.addEventListener('DOMContentLoaded', () => {
  void new Nonogram({
    slotSelector: '#nonogram-game',
    dimensionsSelector: '#dimensions-select',
    difficultySelector: '#difficulty-select',
    restartSelector: '#play-game',
    submitSelector: '#submit-answer',
    historyWidgetConfig: {
      undoSelector: '#undo-action',
      redoSelector: '#redo-action',
      maxHistory: MAX_HISTORY,
    },
    colorPickerConfig: {
      slotSelector: '#color-picker',
      clearColorSelector: '#clear-color',
      clearAllSelector: '#clear-all',
    },
    hintBoxConfig: {
      slotSelector: '#hint-box',
      checkboxSelector: '#hints-setting',
    },
  });
});
