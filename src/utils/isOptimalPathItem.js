const isOptimalPathItem = (rowIndex, coulmnIndex, trackPath) => {
  return Boolean(
    trackPath.find((el) => el[0] === rowIndex && el[1] === coulmnIndex)
  );
};

export default isOptimalPathItem;