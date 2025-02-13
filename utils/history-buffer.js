/**
 * Records history states that can be reversed or overwritten.
 * @template T
 */
export class HistoryBuffer {
  /** @type {!Array<T>} */
  #buffer;
  /** @type {number} */
  #capacity;
  #size = 0;
  #undoCount = 0;
  #nextIndex = 0;

  /** @returns {number} */
  get length() {
    return this.#size;
  }

  /**
   * @param {number} capacity
   * @throws {!RangeError} If `capacity` is not a positive integer.
   */
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError('capacity must be a positive integer');
    }
    this.#buffer = Array.from({length: capacity});
    this.#capacity = capacity;
  }

  clear() {
    this.#size = 0;
    this.#undoCount = 0;
    this.#nextIndex = 0;
  }

  /** @returns {boolean} */
  hasUndos() {
    return this.#undoCount < this.#size;
  }

  /** @returns {boolean} */
  hasRedos() {
    return !!this.#undoCount;
  }

  /** @param {T} value */
  push(value) {
    this.#size -= this.#undoCount;
    this.#undoCount = 0;
    this.#buffer[this.#nextIndex] = value;
    this.#nextIndex = (this.#nextIndex + 1) % this.#capacity;
    this.#size = Math.min(this.#size + 1, this.#capacity);
  }

  /** @returns {(T | undefined)} */
  undo() {
    if (!this.hasUndos()) return undefined;

    this.#nextIndex = (this.#nextIndex + this.#capacity - 1) % this.#capacity;
    const value = this.#buffer[this.#nextIndex];
    this.#undoCount++;
    return value;
  }

  /** @returns {(T | undefined)} */
  redo() {
    if (!this.hasRedos()) return undefined;

    const value = this.#buffer[this.#nextIndex];
    this.#nextIndex = (this.#nextIndex + 1) % this.#capacity;
    this.#undoCount--;
    return value;
  }
}
