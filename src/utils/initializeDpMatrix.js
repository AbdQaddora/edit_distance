const initializeDpMatrix = (dna1, dna2) => {
  const dna1Length = dna1.length;
  const dna2Length = dna2.length;

  const dp = Array(dna1Length + 1)
    .fill(null)
    .map(() => Array(dna2Length + 1).fill(null));

  const dpPaths = Array(dna1Length + 1)
    .fill(null)
    .map(() => Array(dna2Length + 1).fill(null));

  return { dp, dpPaths };
};

export default initializeDpMatrix;
