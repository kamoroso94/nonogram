import {Nonogram} from './nonogram.js';

document.addEventListener('DOMContentLoaded', () => {
  void new Nonogram({
    slotSelector: '#nonogram-game',
    dimensionsSelector: '#dimensions-select',
    difficultySelector: '#difficulty-select',
    restartSelector: '#play-game',
    submitSelector: '#submit-answer',
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
