import isOptimalPathItem from "./isOptimalPathItem";

const getEditDistanceTableCoulmns = (dna2 , trackPath) => {
    return [
        {
          title: "D1 \\ D2",
          dataIndex: "step",
          key: "step",
          fixed: "left",
          width: "90px",
        },
        ...Array(dna2.length + 1)
          .fill(0)
          .map((_, coulmnIndex) => ({
            title: coulmnIndex === 0 ? "-" : dna2[coulmnIndex - 1],
            dataIndex: `col${coulmnIndex}`,
            key: `col${coulmnIndex}`,
            render: (data, _, rowIndex) => (
              <p
                className={`${
                  isOptimalPathItem(rowIndex, coulmnIndex , trackPath) ? "optimal_path" : ""
                }`}
              >
                {data}
              </p>
            ),
          })),
      ];
}

export default getEditDistanceTableCoulmns