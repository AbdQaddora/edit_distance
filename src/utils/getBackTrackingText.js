import { COPY_DIRECTIONS } from "../constants";

const getBackTrackingText = (dna1, dna2, directionsTable) => {
  console.log("Directions Table:", directionsTable, directionsTable?.length);
  console.log("DNA1:", dna1, dna1?.length);
  console.log("DNA2:", dna2, dna2?.length);

  let i = directionsTable?.length - 1; // Adjust to 0-based index
  let j = directionsTable[directionsTable?.length - 1]?.length - 1;

  console.log("i:", i, "j:", j);
  let backTrackingTextDna1 = "";
  let backTrackingTextDna2 = "";
  let backTrackingTextOpertiond = "";
  while (i > 0 || j > 0) {
    console.log(`i: ${i}, j: ${j}, direction: ${directionsTable[i]?.[j]}`);
    if (directionsTable[i]?.[j] === COPY_DIRECTIONS.MATCH) {
      backTrackingTextDna1 = backTrackingTextDna1 + (dna2[i - 1] || "N");
      backTrackingTextDna2 = backTrackingTextDna2 + (dna1[j - 1] || "N");
      backTrackingTextOpertiond = backTrackingTextOpertiond + "|";
      i--;
      j--;
    } else if (directionsTable[i]?.[j] === COPY_DIRECTIONS.DIAGONAL) {
      backTrackingTextDna1 = backTrackingTextDna1 + (dna2[i - 1] || "N");
      backTrackingTextDna2 = backTrackingTextDna2 + (dna1[j - 1] || "N");
      backTrackingTextOpertiond = backTrackingTextOpertiond + "X";
      i--;
      j--;
    } else if (directionsTable[i]?.[j] === COPY_DIRECTIONS.TOP) {
      backTrackingTextDna1 = backTrackingTextDna1 + "-";
      backTrackingTextDna2 = backTrackingTextDna2 + (dna1[j - 1] || "N");
      backTrackingTextOpertiond = backTrackingTextOpertiond + " ";
      i--;
    } else if (directionsTable[i]?.[j] === COPY_DIRECTIONS.LEFT) {
      console.log("Inserting gap in DNA2 at:", j);
      backTrackingTextDna1 = backTrackingTextDna1 + (dna2[i - 1] || "N");
      backTrackingTextDna2 = backTrackingTextDna2 + "-";
      backTrackingTextOpertiond = backTrackingTextOpertiond + " ";
      j--;
    } else {
      console.error("Unexpected value or error in directionsTable at:", i, j);
      break; // Prevent infinite loop
    }
  }
  console.log("--------------------------------------------");
  console.log(backTrackingTextDna1.split("").reverse().join(""));
  console.log(backTrackingTextOpertiond.split("").reverse().join(""));
  console.log(backTrackingTextDna2.split("").reverse().join(""));
  console.log("--------------------------------------------");

  return {
    text1: backTrackingTextDna1.split("").reverse().join(""),
    text2: backTrackingTextDna2.split("").reverse().join(""),
    operations: backTrackingTextOpertiond.split("").reverse().join(""),
  }
};

export default getBackTrackingText;