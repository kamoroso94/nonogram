/**
 * Creates a matrix with `rows` rows and `cols` columns, stored in row-major order.
 * @template T
 * @param {number} rows Total number of rows.
 * @param {number} cols Total number of columns.
 * @param {(row: number, col: number) => T} initializer Initializes the matrix.
 * @returns {T[][]}
 */
export function matrix(rows, cols, initializer) {
  return Array.from({length: rows}, (_, row) =>
    Array.from({length: cols}, (_, col) => initializer(row, col))
  );
}

/**
 * Iterates over the list of columns in a `matrix`.
 * @template T
 * @param {T[][]} matrix
 * @yields {T[]}
 */
export function* getColumns(matrix) {
  const columnCount = matrix[0].length ?? 0;
  const columnSize = matrix.length;
  for (let col = 0; col < columnCount; col++) {
    yield Array.from({length: columnSize}, (_, row) => matrix[row][col]);
  }
}
