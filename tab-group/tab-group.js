import {assertExists, assertInstance, queryElement} from '../utils/asserts.js';

/**
 * @typedef {object} TabGroupConfig
 * @property {string} selector The CSS selector for the `tablist`.
 * @property {boolean} [panelFocusable] Whether the the `tabpanel` should be
 *     focusable. Must be enabled if the panel will contain no focusable
 *     elements.
 */

/**
 * @event TabGroup#event:"tab.change"
 * @type {!CustomEvent<string>}
 * @property {string} detail The value of the selected tab.
 */

/**
 * A widget for managing a tab group.
 * @fires TabGroup#"tab.change"
 */
export class TabGroup extends EventTarget {
  /** @type {!HTMLButtonElement[]} */
  #tabs;

  /** @type {!HTMLElement} */
  #panel;

  /** @returns {!HTMLElement} */
  get panel() {
    return this.#panel;
  }

  /**
   * Gets the value of the currently selected tab.
   * @returns {string}
   */
  get value() {
    return assertExists(this.#tabs.find(isTabSelected)).value;
  }

  /**
   * Selects a tab by its `value`.
   * @param {string} value
   */
  set value(value) {
    const index = this.#tabs.findIndex((tab) => tab.value === value);
    if (index < 0) return;

    this.#select(index);
  }

  /**
   * @param {!TabGroupConfig} config
   * @throws {!TypeError} When `selector` fails to match an element, or the DOM
   *     tree is not configured correctly for a tab group.
   */
  constructor({selector, panelFocusable}) {
    super();
    const tablist = queryElement(selector);

    this.#tabs = Array.from(
      tablist.querySelectorAll(`:scope > button[role='tab']`),
      (tab) => assertInstance(tab, HTMLButtonElement),
    );

    const panel = assertInstance(tablist.nextElementSibling, HTMLElement);
    if (panel.role !== 'tabpanel') {
      throw new TypeError(
        'A "tabpanel" sibling must immediately follow "tablist"',
      );
    }
    this.#panel = panel;

    this.#initialize(panelFocusable);
    this.#wireTabs(assertInstance(tablist, HTMLElement));
  }

  /**
   * Selects the tab at the given `index`.
   * @param {number} index Index of the tab to select.
   * @param {boolean} [withFocus] Whether to apply focus to the newly selected tab.
   * @returns {void}
   * @fires TabGroup#"tab.change" If successful.
   */
  #select(index, withFocus) {
    // Ignore already selected tabs.
    const tab = this.#tabs[index];
    if (isTabSelected(tab)) return;

    // Unselect selected tab.
    const selectedTab = assertExists(this.#tabs.find(isTabSelected));
    selectedTab.tabIndex = -1;
    selectedTab.ariaSelected = 'false';

    tab.tabIndex = 0;
    tab.ariaSelected = 'true';
    this.#panel.ariaLabelledByElements = [tab];
    if (withFocus) tab.focus();
    this.dispatchEvent(new CustomEvent('tab.change', {detail: tab.value}));
  }

  /**
   * Initializes the tabs and panel for accessibility.
   * @param {boolean} [panelFocusable]
   * @returns {void}
   */
  #initialize(panelFocusable) {
    const selectedTab = this.#tabs.find(isTabSelected) ?? this.#tabs[0];

    for (const tab of this.#tabs) {
      const tabSelected = tab === selectedTab;
      tab.ariaSelected = tabSelected ? 'true' : 'false';
      tab.tabIndex = tabSelected ? 0 : -1;
      tab.ariaControlsElements = [this.#panel];
    }

    if (panelFocusable) this.#panel.tabIndex = 0;
    this.#panel.ariaLabelledByElements = [selectedTab];
  }

  /**
   * Sets up the event listeners for navigating between tabs and rendering the
   * tab panel.
   * @param {!HTMLElement} tablist
   * @returns {void}
   */
  #wireTabs(tablist) {
    tablist.addEventListener('click', (event) => {
      const index = this.#tabs.indexOf(/** @type {*} */ (event.target));
      if (index < 0) return;

      event.preventDefault();
      this.#select(index);
    });

    tablist.addEventListener('keydown', (event) => {
      const index = this.#tabs.indexOf(/** @type {*} */ (event.target));
      if (index < 0) return;

      const nextIndex = this.#getNextIndex(index, event.key);
      if (nextIndex < 0) return;

      event.preventDefault();
      this.#select(nextIndex, /* withFocus= */ true);
    });
  }

  /**
   * Given the `index` of the selected tab and the `key` pressed, finds the
   * index of the tab to which to navigate.
   * @param {number} index The index of the currently selected tab.
   * @param {string} key The name of the pressed key.
   * @returns {number}
   */
  #getNextIndex(index, key) {
    switch (key) {
      case 'Home':
        return 0;
      case 'End':
        return this.#tabs.length - 1;
      case 'ArrowLeft':
        return (index - 1 + this.#tabs.length) % this.#tabs.length;
      case 'ArrowRight':
        return (index + 1) % this.#tabs.length;
      default:
        return -1;
    }
  }
}

/**
 * @param {!HTMLButtonElement} tab
 * @returns {boolean}
 */
function isTabSelected(tab) {
  return tab.ariaSelected === 'true';
}
