import {NONOGRAM_STATS_DIFFICULTY_KEY} from '../config.js';
import {TabGroup} from '../tab-group/tab-group.js';
import {DialogAction, openDialog} from '../services/dialog-service.js';
import {
  clearAllStatistics,
  statisticsChanges,
} from '../services/statistics-service.js';
import {queryElement} from '../utils/asserts.js';
import {renderStatistics} from './render.js';
import {DIFFICULTIES} from './statistics.js';

/**
 * @import {TabGroupConfig} from '../tab-group/tab-group.js'
 * @import {Difficulty} from './statistics.js'
 */

/**
 * @typedef {object} StatisticsWidgetConfig
 * @property {!TabGroupConfig} difficultyTabsConfig
 * @property {string} deleteSelector
 */

/** Widget controlling the nonogram statistics tables. */
export class StatisticsWidget {
  /** @type {!TabGroup} */
  #difficultyTabs;

  /** @type {Difficulty} */
  #difficulty;

  /** @param {!StatisticsWidgetConfig} config */
  constructor({difficultyTabsConfig, deleteSelector}) {
    this.#difficultyTabs = new TabGroup(difficultyTabsConfig);
    this.#wireDifficultyTabs();
    this.#difficulty = /** @type {Difficulty} */ (this.#difficultyTabs.value);

    queryElement(deleteSelector).addEventListener('click', async () => {
      const result = await openDialog({
        role: 'alertdialog',
        title: 'Delete Statistics',
        body: 'Are you sure? This action cannot be undone.',
        primaryButton: {
          label: 'Delete',
          value: DialogAction.CONFIRM,
        },
        secondaryButton: {label: 'Cancel'},
      });
      if (result === DialogAction.CONFIRM) {
        clearAllStatistics();
        this.#render();
      }
    });

    statisticsChanges.addEventListener('statistics.change', () => {
      this.#render();
    });

    this.#render();
  }

  /**
   * Sets up the difficulty tabs for interactivity.
   * @returns {void}
   */
  #wireDifficultyTabs() {
    this.#difficultyTabs.addEventListener('tab.change', (event) => {
      const value = /** @type {!CustomEvent<string>} */ (event).detail;
      localStorage.setItem(NONOGRAM_STATS_DIFFICULTY_KEY, value);
      this.#difficulty = /** @type {Difficulty} */ (value);
      this.#render();
    });

    const initialDifficulty = localStorage.getItem(
      NONOGRAM_STATS_DIFFICULTY_KEY,
    );
    if (
      initialDifficulty &&
      DIFFICULTIES.includes(/** @type {Difficulty} */ (initialDifficulty))
    ) {
      this.#difficultyTabs.value = initialDifficulty;
    }
  }

  /** @returns {void} */
  #render() {
    renderStatistics(this.#difficultyTabs.panel, this.#difficulty);
  }
}
