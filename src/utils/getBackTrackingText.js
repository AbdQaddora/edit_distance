import { COPY_DIRECTIONS } from "../constants";

const getBackTrackingText = (dna1, dna2, directionsTable, trackPath) => {
  let backTrackingTextDna1 = "";
  let backTrackingTextDna2 = "";
  let backTrackingTextOpertiond = "";
  const mutationsArray = [];
  // Remove the first element of the trackPath
  trackPath = trackPath.slice(1);
  trackPath?.forEach((element) => {
    const direction = directionsTable[element[0]]?.[element[1]];
    const nucleotide1 = dna1[element[0] - 1] || "N";
    const nucleotide2 = dna2[element[1] - 1] || "N";
    const positionIndex = `(${element[0]}, ${element[1]})`;

    if (direction === COPY_DIRECTIONS.MATCH) {
      backTrackingTextDna1 = backTrackingTextDna1 + nucleotide1;
      backTrackingTextDna2 = backTrackingTextDna2 + nucleotide2;
      backTrackingTextOpertiond = backTrackingTextOpertiond + "|";
    } else if (direction === COPY_DIRECTIONS.DIAGONAL) {
      backTrackingTextDna1 = backTrackingTextDna1 + nucleotide1;
      backTrackingTextDna2 = backTrackingTextDna2 + nucleotide2;
      backTrackingTextOpertiond = backTrackingTextOpertiond + "X";

      const mutationDetail = `Substitution at DNA 1 position = ${element[0]} / DNA 2 position = ${element[1]} : [${nucleotide1} → ${nucleotide2}]`;
      mutationsArray.push(mutationDetail);
    } else if (direction === COPY_DIRECTIONS.TOP) {
      backTrackingTextDna1 = backTrackingTextDna1 + nucleotide1;
      backTrackingTextDna2 = backTrackingTextDna2 + "-";
      backTrackingTextOpertiond = backTrackingTextOpertiond + " ";

      const mutationDetail = `Deletion at DNA 1 position: ${element[0]} => ${nucleotide1} deleted`;
      mutationsArray.push(mutationDetail);
    } else if (direction === COPY_DIRECTIONS.LEFT) {
      backTrackingTextDna1 = backTrackingTextDna1 + "-";
      backTrackingTextDna2 = backTrackingTextDna2 + nucleotide2;
      backTrackingTextOpertiond = backTrackingTextOpertiond + " ";

      const mutationDetail = `Insertion at DNA 2 position: ${element[1]} => ${nucleotide2}  inserted`;
      mutationsArray.push(mutationDetail);
    } else {
      console.error(
        "Unexpected value or error in directionsTable at:",
        positionIndex
      );
    }
  });

  return {
    text1: backTrackingTextDna1,
    text2: backTrackingTextDna2,
    operations: backTrackingTextOpertiond,
    mutations: mutationsArray,
  };
};

export default getBackTrackingText;
