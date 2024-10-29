const COLORS = ['default', 'red', 'green', 'blue', 'orange', 'purple', 'gray'];
export const DEFAULT_COLOR = colorToCssVar('default');

/**
 * @typedef {object} ColorPickerContext
 * @property {!HTMLButtonElement} resetColorButton
 * @property {!SetPlayerColorCallback} setPlayerColor
 */

/**
 * @callback SetPlayerColorCallback
 * @param {string} color
 * @returns {void}
 */

/**
 * Initialize the color picker component.
 *
 * Note: Must not be called before the "DOMContentLoaded" document event.
 *
 * @param {string} selector The CSS selector of the slot element to hydrate.
 * @param {!ColorPickerContext} context Additional context for the color picker.
 */
export function initializeColorPicker(
  selector,
  {resetColorButton, setPlayerColor}
) {
  const slot = document.querySelector(selector);
  const fragment = document.createDocumentFragment();
  for (const color of COLORS) {
    fragment.append(renderColor(color));
  }

  slot.append(fragment);
  slot.addEventListener('click', (event) => {
    const colorLabel = event.target.closest('label[for|="color"]');
    if (!slot.contains(colorLabel)) return;

    const color = colorLabel.htmlFor.replace('color-', '');
    setPlayerColor(colorToCssVar(color));
    resetColorButton.textContent = `Clear ${color}`;
  });
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
 * Renders the color input element.
 * @param {string} color
 * @returns {!HTMLInputElement}
 */
function renderColorInput(color) {
  const colorInput = document.createElement('input');
  colorInput.type = 'radio';
  colorInput.name = 'color';
  colorInput.id = `color-${color}`;
  colorInput.value = color;
  if (color === 'default') colorInput.defaultChecked = true;
  return colorInput;
}

/**
 * Renders the color label element.
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
 * Renders the color block element.
 * @param {string} color
 * @returns {!HMTLDivElement}
 */
function renderColorBlock(color) {
  const colorBlock = document.createElement('div');
  const title = capitalize(color);
  colorBlock.title = title;
  colorBlock.style.backgroundColor = colorToCssVar(color);
  return colorBlock;
}

/**
 * Returns the CSS custom property corresponding to this color name.
 * @param {string} color
 */
function colorToCssVar(color) {
  return `var(--color-${color})`;
}

/**
 * Capitalizes the first character of `text`.
 * @param {string} text
 */
function capitalize(text) {
  return text[0].toUpperCase() + text.slice(1);
}
