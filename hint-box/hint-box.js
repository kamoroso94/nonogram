import {assertInstance, queryElement} from '../utils/asserts.js';
import {renderHintBox} from './render.js';

/**
 * @typedef {object} HintBoxConfig
 * @property {string} slotSelector
 * @property {string} checkboxSelector
 */

/**
 * Represents the list of rows and columns with overlapping blocks, which are
 * good starting points for solving the nonogram puzzle.
 * @typedef {object} HintBoxHints
 * @property {!number[]} rows A list of rows with overlapping blocks.
 * @property {!number[]} cols A list of columns with overlapping blocks.
 */

/** @type {!HintBoxHints} */
const DEFAULT_HINT_BOX_STATE = {
  rows: [],
  cols: [],
};

/** Hint box for the nonogram. */
export class HintBox {
  /** @type {!HintBoxHints} */
  #hints = {...DEFAULT_HINT_BOX_STATE};

  /** @type {!HTMLInputElement} */
  #hintsEnabledCheckbox;

  /** @type {!HTMLElement} */
  #slot;

  /**
   * @param {!HintBoxConfig} config
   * @throws {!TypeError} When any of the selectors fail to match an element.
   */
  constructor({slotSelector, checkboxSelector}) {
    this.#slot = assertInstance(queryElement(slotSelector), HTMLElement);

    this.#hintsEnabledCheckbox = assertInstance(
      queryElement(checkboxSelector),
      HTMLInputElement
    );
    this.#hintsEnabledCheckbox.addEventListener('change', () => this.#render());

    this.#render();
  }

  /**
   * @param {!HintBoxHints} hints
   * @returns {void}
   */
  update(hints) {
    this.#hints = {...hints};
    this.#render();
  }

  /** @returns {void} */
  reset() {
    this.#hints = {...DEFAULT_HINT_BOX_STATE};
    this.#hintsEnabledCheckbox.checked = false;
    this.#render();
  }

  /** @returns {void} */
  #render() {
    this.#slot.replaceChildren(
      renderHintBox(this.#hints, this.#hintsEnabledCheckbox.checked)
    );
  }
}
