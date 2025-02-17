/**
 * @template T
 * @param {(T | null | undefined)} value
 * @returns {!T}
 * @throws {!TypeError} When `value` is nullish.
 */
export function assertExists(value) {
  if (value == null) throw new TypeError(`Value is ${value}`);
  return value;
}

/**
 * @template T
 * @template {T} U
 * @param {(T | null | undefined)} value
 * @param {new () => U} type
 * @returns {!U}
 * @throws {!TypeError} When `value` is not an instance of `type`.
 */
export function assertInstance(value, type) {
  if (!(value instanceof type)) {
    throw new TypeError(`Value is not a ${type.name}`);
  }
  return /** @type {!U} */ (value);
}

/**
 * Searches for an element that matches the given `selector`.
 * @param {string} selector
 * @returns {!Element}
 * @throws {!TypeError} When the element is not in the DOM.
 */
export function queryElement(selector) {
  const element = document.querySelector(selector);
  if (!element) throw new TypeError(`Cannot find element ${selector}`);
  return element;
}

/**
 * Guards against type-narrowing issues where a type is left unnarrowed.
 * @param {never} value
 * @param {string} [message]
 * @returns {never}
 * @throws {!TypeError}
 */
export function checkExhaustive(value, message) {
  throw new TypeError(message ?? `Unexpected value: ${value}`);
}
