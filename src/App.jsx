import { Button, ConfigProvider, Form, Table, theme } from "antd";
import { useForm } from "antd/es/form/Form";
import DNAInput from "./components/DNAInput";
import { useCallback, useMemo, useState } from "react";

function App() {
  const [form] = useForm();
  const [tableData, setTableData] = useState([]);
  const [trackPath, setTrackPath] = useState([]);

  const calculateEditDistance = (a = "", b = "") => {
    const m = a.length;
    const n = b.length;

    // Initialize DP matrix
    const dp = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Populate DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    // Backtrack to find the optimal path
    const path = [];
    let i = m,
      j = n;

    while (i > 0 || j > 0) {
      path.push([i, j]);
      if (
        i > 0 &&
        j > 0 &&
        dp[i][j] === dp[i - 1][j - 1] &&
        a[i - 1] === b[j - 1]
      ) {
        i--;
        j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        i--;
      } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
        j--;
      } else {
        i--;
        j--;
      }
    }
    path.push([0, 0]);

    path.reverse();
    setTrackPath(path);

    // Prepare table data
    const table = [];
    for (let row = 0; row <= m; row++) {
      const rowData = { key: row, step: row === 0 ? "-" : a[row - 1] };
      for (let col = 0; col <= n; col++) {
        rowData[`col${col}`] = dp[row][col];
      }
      table.push(rowData);
    }

    return table;
  };

  const handleFinish = () => {
    const dna1 = form.getFieldValue("seq1") || "";
    const dna2 = form.getFieldValue("seq2") || "";

    if (dna1 && dna2) {
      const result = calculateEditDistance(dna1, dna2);
      setTableData(result);
    }
  };

  const isOptimalPathItem = useCallback(
    (rowIndex, coulmnIndex) => {
      return Boolean(
        trackPath.find((el) => el[0] === rowIndex && el[1] === coulmnIndex)
      );
    },
    [trackPath]
  );

  const columns = useMemo(() => {
    const dna2 = form.getFieldValue("seq2") || "";

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
                isOptimalPathItem(rowIndex, coulmnIndex) ? "optimal_path" : ""
              }`}
            >
              {data}
            </p>
          ),
        })),
    ];
  }, [tableData, form, isOptimalPathItem]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <div className="container" style={{ padding: "20px" }}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name={"seq1"}
            label={<p>DNA 1</p>}
            required={false}
            rules={[{ required: true, message: "Enter DNA 1" }]}
          >
            <DNAInput placeholder="Enter DNA 1" />
          </Form.Item>
          <Form.Item
            name={"seq2"}
            label={<p>DNA 2</p>}
            required={false}
            rules={[{ required: true, message: "Enter DNA 2" }]}
          >
            <DNAInput placeholder="Enter DNA 2" />
          </Form.Item>
          <Button size="large" block type="primary" htmlType="submit">
            Calculate Edit Distance
          </Button>
        </Form>
        {Array.isArray(tableData) && tableData.length > 0 && (
          <Table
            sticky
            dataSource={tableData}
            columns={columns}
            pagination={false}
            bordered
            scroll={{
              y: 1000, // Enables vertical scroll with a height of 200px
              x: "max-content", // Enables horizontal scroll if content overflows
            }}
          />
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
