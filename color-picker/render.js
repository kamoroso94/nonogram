/** @import {Color} from './color-picker.js'; */

/**
 * Initialize the color picker component.
 * @param {readonly Color[]} palette
 * @returns {!DocumentFragment}
 */
export function renderColorPicker(palette) {
  const fragment = document.createDocumentFragment();
  for (const [index, color] of palette.entries()) {
    fragment.append(renderColor(color, index));
  }
  return fragment;
}

/**
 * Renders the color input and label pair.
 * @param {!Color} color
 * @param {number} index
 * @return {!DocumentFragment}
 */
function renderColor(color, index) {
  const fragment = document.createDocumentFragment();
  fragment.append(renderColorInput(color, index), renderColorLabel(color));
  return fragment;
}

/**
 * @param {!Color} color
 * @param {number} index
 * @returns {!HTMLInputElement}
 */
function renderColorInput({name}, index) {
  const colorInput = document.createElement('input');
  colorInput.type = 'radio';
  colorInput.name = 'color';
  colorInput.id = `color-${name}`;
  colorInput.value = String(index);
  colorInput.autocomplete = 'off';
  if (index === 0) colorInput.defaultChecked = true;
  return colorInput;
}

/**
 * @param {!Color} color
 * @returns {!HTMLLabelElement}
 */
function renderColorLabel(color) {
  const colorLabel = document.createElement('label');
  colorLabel.htmlFor = `color-${color.name}`;
  colorLabel.append(renderColorBlock(color));
  return colorLabel;
}

/**
 * @param {!Color} color
 * @returns {!HTMLDivElement}
 */
function renderColorBlock({name, cssColor}) {
  const colorBlock = document.createElement('div');
  const title = capitalize(name);
  colorBlock.title = title;
  colorBlock.style.backgroundColor = cssColor;
  return colorBlock;
}

/**
 * Capitalizes the first character of `text`.
 * @param {string} text
 */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
