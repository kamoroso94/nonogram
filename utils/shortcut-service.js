/**
 * @callback ShortcutHandler
 * @param {!Document} this
 * @param {!KeyboardEvent} event
 * @returns {void}
 */

/**
 * @typedef ShortcutConfig
 * @property {!string[]} shortcuts
 * @property {!ShortcutHandler} handler
 */

const isMac =
  // @ts-ignore https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData
  (navigator.userAgentData?.platform ?? navigator.platform).startsWith('Mac');

/**
 * Checks if the given `shortcut` matches the `event`.
 * @param {!KeyboardEvent} event
 * @param {string} shortcut
 * @returns {boolean}
 */
function isShortcutMatch(event, shortcut) {
  const keys = shortcut.toLowerCase().split('+');
  const key = keys.pop();
  if (!key) throw new TypeError('Shortcut must have at least one key');

  const modifiers = new Set(keys);
  const metaKey = !isMac && event.metaKey;
  const commandKey = isMac ? event.metaKey : event.ctrlKey;
  const controlKey = isMac && event.ctrlKey;
  return (
    metaKey === (modifiers.has('win') || modifiers.has('meta')) &&
    commandKey === (modifiers.has('ctrl') || modifiers.has('cmd')) &&
    controlKey === modifiers.has('control') &&
    event.altKey === modifiers.has('alt') &&
    event.shiftKey === modifiers.has('shift') &&
    event.key.toLowerCase() === key
  );
}

/** @type {!ShortcutConfig[]} */
const shortcutConfigs = [];

document.addEventListener('keydown', (event) => {
  if (
    event.target instanceof HTMLElement &&
    (event.target.matches('input, textarea') || event.target.isContentEditable)
  ) {
    return;
  }

  let immediatePropagationStopped = false;
  event.stopImmediatePropagation = function () {
    immediatePropagationStopped = true;
    Event.prototype.stopImmediatePropagation.call(event);
    // Remove own property.
    delete (/** @type {*} */ (event).stopImmediatePropagation);
  };

  for (const {shortcuts, handler} of shortcutConfigs) {
    if (!shortcuts.some((shortcut) => isShortcutMatch(event, shortcut))) {
      continue;
    }

    try {
      handler.call(document, event);
      if (immediatePropagationStopped) break;
    } catch (error) {
      console.error(error);
    }
  }
});

/**
 * Attaches a handler for the given `shortcuts` to the document.
 * @param {(string | string[])} shortcuts
 * @param {!ShortcutHandler} handler
 */
export function addShortcut(shortcuts, handler) {
  shortcuts = Array.isArray(shortcuts) ? shortcuts : [shortcuts];
  if (!shortcuts.length) {
    throw new TypeError('Argument shortcuts must not be empty');
  }
  shortcutConfigs.push({shortcuts, handler});
}
