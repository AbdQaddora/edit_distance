const prepareTableData = (dna1 , dna2 , dp) => {
  const table = [];
  for (let row = 0; row <= dna1.length; row++) {
    const rowData = { key: row, step: row === 0 ? "-" : dna1[row - 1] };
    for (let col = 0; col <= dna2.length; col++) {
      rowData[`col${col}`] = dp[row][col];
    }
    table.push(rowData);
  }

  return table;
};

export default prepareTableData;
