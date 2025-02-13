import {assertInstance, queryElement} from '../utils/asserts.js';
import {renderColorPicker} from './render.js';

/**
 * @typedef {object} Color
 * @property {string} name The display name for the color.
 * @property {string} cssColor The CSS color value.
 */

/**
 * @typedef {object} ColorPickerConfig
 * @property {string} slotSelector
 * @property {string} clearColorSelector
 * @property {string} clearAllSelector
 * @property {readonly Color[]} palette
 */

const DEFAULT_PALETTE_INDEX = 0;

/**
 * @event ColorPicker#event:"color.clear"
 * @type {!CustomEvent<?number>}
 * @property {?number} detail The palette index of the selected CSS color to
 *     clear if provided, otherwise all colors are to be cleared.
 */

/**
 * @event ColorPicker#event:"color.change"
 * @type {!CustomEvent<number>}
 * @property {number} detail The palette index of the new CSS color in use.
 */

/**
 * Encapsulates logic and rendering of the color picker.
 * @fires ColorPicker#"color.clear"
 * @fires ColorPicker#"color.change"
 */
export class ColorPicker extends EventTarget {
  /** @type {readonly Color[]} */
  #palette;
  #paletteIndex = DEFAULT_PALETTE_INDEX;

  /** @type {!HTMLButtonElement} */
  #clearColorButton;

  /**
   * The palette index of the currently selected CSS color.
   * @returns {number}
   */
  get value() {
    return this.#paletteIndex;
  }

  /**
   * @param {(number | string)} paletteIndex
   * @throws Whenever `paletteIndex` is invalid.
   */
  set value(paletteIndex) {
    paletteIndex = Number(paletteIndex);
    this.#validatePaletteIndex(paletteIndex);
    this.#changeColor(paletteIndex);
  }

  /**
   * @param {!ColorPickerConfig} config
   * @throws {!TypeError} When any of the selectors fail to match an element or
   *     the palette is empty.
   */
  constructor({slotSelector, clearColorSelector, clearAllSelector, palette}) {
    if (!palette.length) throw new TypeError('Palette must not be empty');

    super();

    this.#palette = palette;

    const slot = assertInstance(queryElement(slotSelector), HTMLElement);
    slot.append(renderColorPicker(this.#palette));

    this.#clearColorButton = assertInstance(
      queryElement(clearColorSelector),
      HTMLButtonElement
    );
    this.#clearColorButton.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('color.clear', {detail: this.value}));
    });

    queryElement(clearAllSelector).addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('color.clear', {detail: null}));
    });

    // Add color picker handling
    slot.addEventListener('click', (event) => {
      const colorLabel = /** @type {?HTMLLabelElement} */ (
        /** @type {!Element} */ (event.target).closest('label[for|="color"]')
      );
      if (!slot.contains(colorLabel)) return;

      const {htmlFor: colorOptionId} = /** @type {!HTMLLabelElement} */ (
        colorLabel
      );
      const {value: paletteIndex} = /** @type {!HTMLInputElement} */ (
        document.getElementById(colorOptionId)
      );
      this.#changeColor(Number(paletteIndex), {fromEvent: true});
    });

    // TODO: more testing, maybe experiment guard?
    slot.addEventListener('wheel', (event) => {
      const {deltaX, deltaY} = event;
      const direction = Math.sign(deltaX) || Math.sign(deltaY);
      if (!direction) return;

      const index = /** @type {readonly string[]} */ (COLORS).indexOf(
        parseColorVar(this.playColor)
      );
      if (index < 0) return;

      event.preventDefault();
      const nextIndex = (index + direction + COLORS.length) % COLORS.length;
      const nextColor = COLORS[nextIndex];
      /** @type {!HTMLInputElement} */ (
        queryElement(`#color-${nextColor}`)
      ).checked = true;
      this.#changeColor(nextColor, {fromEvent: true});
    });
  }

  /**
   * Validates the given `index` to see if it's a valid palette index.
   * @param {number} index
   * @throws {!TypeError} Whenever `index` isn't an integer.
   * @throws {!RangeError} Whenever `index` isn't in the palette range.
   */
  #validatePaletteIndex(index) {
    if (!Number.isInteger(index)) {
      throw new TypeError('Value must be an integer');
    }
    if (index < 0 || index >= this.#palette.length) {
      throw new RangeError('Value must be in the palette range');
    }
  }

  /**
   * Gets the CSS color specified by the given `paletteIndex`.
   * @param {number} paletteIndex
   * @returns {string}
   * @throws Whenever `paletteIndex` is invalid.
   */
  getColor(paletteIndex) {
    this.#validatePaletteIndex(paletteIndex);
    return this.#palette[paletteIndex].cssColor;
  }

  /** Resets the color picker back to the default state. */
  reset() {
    const defaultColor = this.#palette[DEFAULT_PALETTE_INDEX];
    /** @type {!HTMLInputElement} */ (
      queryElement(`#color-${defaultColor.name}`)
    ).checked = true;
    this.#changeColor(DEFAULT_PALETTE_INDEX);
  }

  /**
   * @param {number} paletteIndex
   * @param {object} [options={}]
   * @param {boolean} [options.fromEvent]
   * @fires ColorPicker#"color.change" Whenever `options.fromEvent` is
   *     provided.
   */
  #changeColor(paletteIndex, {fromEvent} = {}) {
    this.#paletteIndex = paletteIndex;
    this.#clearColorButton.textContent = `Clear ${
      this.#palette[this.value].name
    }`;
    if (fromEvent) {
      this.dispatchEvent(new CustomEvent('color.change', {detail: this.value}));
    }
  }
}

/**
 * Parses a string of the form "var(--color-XYZ)" to "XYZ".
 * @param {string} colorVar
 * @returns string
 */
function parseColorVar(colorVar) {
  return colorVar.slice(12, -1);
}
