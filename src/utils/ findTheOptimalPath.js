import { COPY_DIRECTIONS } from "../constants";

function findTheOptimalPath(table) {
  let i = table.length - 1;
  let j = table[0].length - 1;
  const indices = [];

  while (i > 0 || j > 0) {
    indices.push([i, j]);
    if (
      table[i][j] === COPY_DIRECTIONS.DIAGONAL ||
      table[i][j] === COPY_DIRECTIONS.MATCH
    ) {
      i -= 1;
      j -= 1;
    } else if (table[i][j] === COPY_DIRECTIONS.LEFT) {
      j -= 1;
    } else if (table[i][j] === COPY_DIRECTIONS.TOP) {
      i -= 1;
    } else if (table[i][j] === null) {
      if (j > 0 && table[i]?.[j - 1] !== null) {
        j -= 1;
      } else if (i > 0 && table[i - 1]?.[j] !== null) {
        i -= 1;
      } else {
        break;
      }
    }
  }
  indices.push([0, 0]); // Add the starting cell
  return indices.reverse(); // Reverse the array to get the correct order
}

export default findTheOptimalPath;
