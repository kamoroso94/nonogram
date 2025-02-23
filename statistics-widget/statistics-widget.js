import {NONOGRAM_STATS_DIFFICULTY_KEY} from '../config.js';
import {DialogAction, openDialog} from '../services/dialog-service.js';
import {
  clearAllStatistics,
  statisticsChanges,
} from '../services/statistics-service.js';
import {assertInstance, queryElement} from '../utils/asserts.js';
import {renderStatistics} from './render.js';
import {DIFFICULTIES} from './statistics.js';

/** @import {Difficulty} from './statistics.js' */

/**
 * @typedef {object} StatisticsWidgetConfig
 * @property {string} rootSelector
 * @property {string} difficultySelector
 * @property {string} deleteSelector
 */

/** Widget controlling the nonogram statistics tables. */
export class StatisticsWidget {
  /** @type {!Element} */
  #root;

  /** @type {Difficulty} */
  #difficulty;

  /** @param {!StatisticsWidgetConfig} config */
  constructor({rootSelector, difficultySelector, deleteSelector}) {
    this.#root = queryElement(rootSelector);

    const difficultySelect = assertInstance(
      queryElement(difficultySelector),
      HTMLSelectElement
    );
    this.#wireDifficultySelect(difficultySelect);

    queryElement(deleteSelector).addEventListener('click', async () => {
      const result = await openDialog({
        title: 'Delete Statistics',
        bodyText: 'Are you sure? This action cannot be undone.',
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
   * @param {!HTMLSelectElement} difficultySelect
   * @returns {void}
   */
  #wireDifficultySelect(difficultySelect) {
    const initialDifficulty = localStorage.getItem(
      NONOGRAM_STATS_DIFFICULTY_KEY
    );
    if (
      initialDifficulty &&
      DIFFICULTIES.includes(/** @type {Difficulty} */ (initialDifficulty))
    ) {
      difficultySelect.value = initialDifficulty;
    }

    difficultySelect.addEventListener('change', () => {
      localStorage.setItem(
        NONOGRAM_STATS_DIFFICULTY_KEY,
        difficultySelect.value
      );
      this.#difficulty = /** @type {Difficulty} */ (difficultySelect.value);
      this.#render();
    });
    this.#difficulty = /** @type {Difficulty} */ (difficultySelect.value);
  }

  /** @returns {void} */
  #render() {
    renderStatistics(this.#root, this.#difficulty);
  }
}
