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

const NONOGRAM_STATS_DIFFICULTY_KEY = 'nonogram.statistics.difficulty';

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

    queryElement(deleteSelector).addEventListener('click', () => {
      if (confirm('Are you sure? This action cannot be undone.')) {
        clearAllStatistics();
      }
    });

    statisticsChanges.addEventListener('statistics.change', () => {
      this.#render();
    });
    statisticsChanges.addEventListener('statistics.clear', () => {
      this.#render();
    });

    this.#render();
  }

  /** @param {!HTMLSelectElement} difficultySelect */
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

  #render() {
    renderStatistics(this.#root, this.#difficulty);
  }
}
