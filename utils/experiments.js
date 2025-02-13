const experiments = new Set(
  new URL(location.href).searchParams.get('e')?.split(',') ?? []
);

/**
 * Checks if the given `experimentName` is currently enabled.
 * @param {string} experimentName
 * @returns {boolean}
 */
export function isEnabled(experimentName) {
  return experiments.has(experimentName);
}
