import {assertInstance, queryElement} from '../utils/asserts.js';
import {colorToCssVar, DEFAULT_COLOR} from './colors.js';
import {renderColorPicker} from './render.js';

/**
 * @typedef {object} ColorPickerConfig
 * @property {string} slotSelector
 * @property {string} clearColorSelector
 * @property {string} clearAllSelector
 */

/**
 * @event ColorPicker#event:"color.clear"
 * @type {!CustomEvent<?string>}
 * @property {?string} detail The selected CSS color to clear if provided,
 *     otherwise all colors are to be cleared.
 */

/**
 * @event ColorPicker#event:"color.change"
 * @type {!CustomEvent<string>}
 * @property {string} detail The new CSS color in use.
 */

/**
 * Encapsulates logic and rendering of the color picker.
 * @fires ColorPicker#"color.clear"
 * @fires ColorPicker#"color.change"
 */
export class ColorPicker extends EventTarget {
  /** @type {string} */
  #playColor = colorToCssVar(DEFAULT_COLOR);

  /** @type {!HTMLButtonElement} */
  #clearColorButton;

  /**
   * @param {!ColorPickerConfig} config
   * @throws {!TypeError} When any of the selectors fail to match an element.
   */
  constructor({slotSelector, clearColorSelector, clearAllSelector}) {
    super();

    const slot = queryElement(slotSelector);
    slot.append(renderColorPicker());

    this.#clearColorButton = assertInstance(
      queryElement(clearColorSelector),
      HTMLButtonElement
    );
    this.#clearColorButton.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('color.clear', {detail: this.playColor})
      );
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

      const color = /** @type {!HTMLLabelElement} */ (
        colorLabel
      ).htmlFor.replace('color-', '');
      this.#changeColor(color, {fromEvent: true});
      this.#clearColorButton.textContent = `Clear ${color}`;
    });
  }

  /** The current CSS color in play. */
  get playColor() {
    return this.#playColor;
  }

  /** Resets the color picker back to the default state. */
  reset() {
    /** @type {!HTMLInputElement} */ (
      queryElement(`#color-${DEFAULT_COLOR}`)
    ).checked = true;
    this.#clearColorButton.textContent = `Clear ${DEFAULT_COLOR}`;
    this.#changeColor(DEFAULT_COLOR);
  }

  /**
   * @param {string} color
   * @param {object} [options={}]
   * @param {boolean} [options.fromEvent]
   * @fires ColorPicker#"color.change" Whenever `options.fromEvent` is
   *     provided.
   */
  #changeColor(color, {fromEvent} = {}) {
    this.#playColor = colorToCssVar(color);
    if (fromEvent) {
      this.dispatchEvent(
        new CustomEvent('color.change', {detail: this.playColor})
      );
    }
  }
}
