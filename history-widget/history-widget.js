import {assertInstance, queryElement} from '../utils/asserts.js';
import {HistoryBuffer} from '../utils/history-buffer.js';
import {addShortcut} from '../utils/shortcut-service.js';

/**
 * @typedef HistoryWidgetConfig
 * @property {string} undoSelector Selector for undo button.
 * @property {string} redoSelector Selector for redo button.
 * @property {number} maxHistory Maximum history length to support.
 */

/**
 * @event HistoryWidget<T>#event:"history.undo"
 * @template T
 * @type {!CustomEvent<T>}
 * @property {T} detail The history entry being undone.
 */

/**
 * @event HistoryWidget<T>#event:"history.redo"
 * @template T
 * @type {!CustomEvent<T>}
 * @property {T} detail The history entry being redone.
 */

/**
 * @template T
 * @fires HistoryWidget<T>#"history.undo"
 * @fires HistoryWidget<T>#"history.redo"
 */
export class HistoryWidget extends EventTarget {
  /**@type {!HTMLButtonElement} */
  #undoButton;
  /**@type {!HTMLButtonElement} */
  #redoButton;

  /** @type {!HistoryBuffer<T>} */
  #history;

  /** @returns {number} */
  get length() {
    return this.#history.length;
  }

  /**
   * @param {!HistoryWidgetConfig} config
   * @throws {!TypeError} When either of the selectors fail to match button elements.
   */
  constructor({undoSelector, redoSelector, maxHistory}) {
    super();
    this.#history = new HistoryBuffer(maxHistory);

    this.#undoButton = assertInstance(
      queryElement(undoSelector),
      HTMLButtonElement
    );
    this.#undoButton.addEventListener('click', () => {
      this.#undo({fromEvent: true});
    });

    this.#redoButton = assertInstance(
      queryElement(redoSelector),
      HTMLButtonElement
    );
    this.#redoButton.addEventListener('click', () => {
      this.#redo({fromEvent: true});
    });

    addShortcut('Ctrl+Z', (event) => {
      event.preventDefault();
      this.#undo({fromEvent: true});
    });
    addShortcut(['Ctrl+Shift+Z', 'Ctrl+Y'], (event) => {
      event.preventDefault();
      this.#redo({fromEvent: true});
    });
  }

  #updateActionButtons() {
    this.#undoButton.disabled = !this.#history.hasUndos();
    this.#redoButton.hidden = !this.#history.hasRedos();
  }

  /** @returns {boolean} */
  hasUndos() {
    return this.#history.hasUndos();
  }

  /** @returns {boolean} */
  hasRedos() {
    return this.#history.hasRedos();
  }

  reset() {
    this.#history.clear();
    this.#updateActionButtons();
  }

  /** @param {T} value */
  push(value) {
    this.#history.push(value);
    this.#updateActionButtons();
  }

  /**
   * @returns {(T | undefined)}
   * @fires HistoryWidget<T>#"history.undo" If successful.
   */
  undo() {
    return this.#undo();
  }

  /**
   * @param {object} [options={}]
   * @param {boolean} [options.fromEvent]
   * @returns {(T | undefined)}
   * @fires HistoryWidget<T>#"history.undo" If successful and `options.fromEvent`.
   */
  #undo({fromEvent} = {}) {
    const value = this.#history.undo();
    if (value === undefined) return undefined;

    if (fromEvent) {
      this.dispatchEvent(new CustomEvent('history.undo', {detail: value}));
    }
    this.#updateActionButtons();
    return value;
  }

  /**
   * @returns {(T | undefined)}
   * @fires HistoryWidget<T>#"history.redo" If successful.
   */
  redo() {
    return this.#redo();
  }

  /**
   * @param {object} [options={}]
   * @param {boolean} [options.fromEvent]
   * @returns {(T | undefined)}
   * @fires HistoryWidget<T>#"history.redo" If successful and `options.fromEvent`.
   */
  #redo({fromEvent} = {}) {
    const value = this.#history.redo();
    if (value === undefined) return undefined;

    if (fromEvent) {
      this.dispatchEvent(new CustomEvent('history.redo', {detail: value}));
    }
    this.#updateActionButtons();
    return value;
  }
}
