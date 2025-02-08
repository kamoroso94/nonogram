import {COLORS, colorToCssVar, DEFAULT_COLOR} from './colors.js';

/**
 * Initialize the color picker component.
 * @returns {!DocumentFragment}
 */
export function renderColorPicker() {
  const fragment = document.createDocumentFragment();
  for (const color of COLORS) {
    fragment.append(renderColor(color));
  }
  return fragment;
}

/**
 * Renders the color input and label pair.
 * @param {string} color
 * @return {!DocumentFragment}
 */
function renderColor(color) {
  const fragment = document.createDocumentFragment();
  fragment.append(renderColorInput(color), renderColorLabel(color));
  return fragment;
}

/**
 * @param {string} color
 * @returns {!HTMLInputElement}
 */
function renderColorInput(color) {
  const colorInput = document.createElement('input');
  colorInput.type = 'radio';
  colorInput.name = 'color';
  colorInput.id = `color-${color}`;
  colorInput.value = color;
  colorInput.autocomplete = 'off';
  if (color === DEFAULT_COLOR) colorInput.defaultChecked = true;
  return colorInput;
}

/**
 * @param {string} color
 * @returns {!HTMLLabelElement}
 */
function renderColorLabel(color) {
  const colorLabel = document.createElement('label');
  colorLabel.htmlFor = `color-${color}`;
  colorLabel.append(renderColorBlock(color));
  return colorLabel;
}

/**
 * @param {string} color
 * @returns {!HTMLDivElement}
 */
function renderColorBlock(color) {
  const colorBlock = document.createElement('div');
  const title = capitalize(color);
  colorBlock.title = title;
  colorBlock.style.backgroundColor = colorToCssVar(color);
  return colorBlock;
}

/**
 * Capitalizes the first character of `text`.
 * @param {string} text
 */
function capitalize(text) {
  return text[0].toUpperCase() + text.slice(1);
}
