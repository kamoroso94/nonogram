import {initializeColorPicker} from './color-picker.js';
import {initializeNonogram, setPlayerColor} from './nonogram.js';

document.addEventListener('DOMContentLoaded', () => {
  const resetColorButton = document.getElementById('reset1');
  initializeColorPicker('color-picker-slot', {
    resetColorButton,
    setPlayerColor,
  });
  initializeNonogram();
});
