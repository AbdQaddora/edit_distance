import {
  Button,
  Col,
  ConfigProvider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Table,
  theme,
  Typography,
} from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import DNAInput from "./components/DNAInput";
import { useEffect, useMemo, useState } from "react";
import getEditDistanceTableCoulmns from "./utils/convertTableToAntdTable";
import prepareTableData from "./utils/prepareTableData";
import findTheOptimalPath from "./utils/ findTheOptimalPath";
import initializeDpMatrix from "./utils/initializeDpMatrix";
import { COPY_DIRECTIONS, METHOD_TYPES } from "./constants";
import getBackTrackingText from "./utils/getBackTrackingText";

function App() {
  const [form] = useForm();
  const [tableData, setTableData] = useState([]);
  const [directionsTable, setDirectionsTable] = useState([]);
  const [trackingText, setTrackingText] = useState({});

  const [trackPath, setTrackPath] = useState([]);
  const methodType = useWatch("methodType", form);
  const seq1 = useWatch("seq1", form);
  const seq2 = useWatch("seq2", form);
  const thresholdStr = useWatch("threshold", form);

  const calculateEditDistance = ({
    seq1: dna1 = "",
    seq2: dna2 = "",
    boundSize: boundSizeStr,
    substitutionsCost: subCost,
    insertionsCost: insertCost,
    deletionsCost: deletCost,
  }) => {
    const dna1Length = dna1.length;
    const dna2Length = dna2.length;
    const { dp, dpPaths } = initializeDpMatrix(dna1, dna2);
    const boundSize = Number(boundSizeStr || "0");
    const substitutionsCost = isNaN(subCost) ? 1 : Number(subCost);
    const insertionsCost = isNaN(insertCost) ? 1 : Number(insertCost);
    const deletionsCost = isNaN(deletCost) ? 1 : Number(deletCost);

    const initializeBoundaries = (size = 0) => {
      let size1 = size;
      let size2 = size;
      if (
        methodType === METHOD_TYPES.NORMAL ||
        methodType === METHOD_TYPES.SEQUENCE_ALIGNMENT
      ) {
        size1 = dna1Length;
        size2 = dna2Length;
      }

      for (let i = 0; i <= size1; i++) {
        dp[i][0] = i;
        dpPaths[i][0] = COPY_DIRECTIONS.TOP;
      }
      for (let j = 0; j <= size2; j++) {
        dp[0][j] = j;
        dpPaths[0][j] = COPY_DIRECTIONS.LEFT;
      }
      dpPaths[0][0] =
        dna1[0] === dna2[0] ? COPY_DIRECTIONS.MATCH : COPY_DIRECTIONS.DIAGONAL;
    };

    const calculateCell = (i, j) => {
      if (dna1[i - 1] === dna2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        dpPaths[i][j] = COPY_DIRECTIONS.MATCH;
        return dp[i - 1][j - 1];
      } else {
        const minVal = Math.min(
          dp[i - 1]?.[j] ?? Infinity,
          dp[i]?.[j - 1] ?? Infinity,
          dp[i - 1]?.[j - 1] ?? Infinity
        );
        if (minVal === dp[i - 1]?.[j - 1]) {
          dpPaths[i][j] = COPY_DIRECTIONS.DIAGONAL;
          dp[i][j] = substitutionsCost + minVal;
          return substitutionsCost + minVal;
        } else if (minVal === dp[i - 1]?.[j]) {
          dpPaths[i][j] = COPY_DIRECTIONS.TOP;
          dp[i][j] = insertionsCost + minVal;
          return insertionsCost + minVal;
        } else if (minVal === dp[i]?.[j - 1]) {
          dpPaths[i][j] = COPY_DIRECTIONS.LEFT;
          dp[i][j] = deletionsCost + minVal;
          return deletionsCost + minVal;
        }
      }
    };

    const processBounded = () => {
      initializeBoundaries(boundSize);
      for (let i = 1; i <= dna1Length; i++) {
        for (
          let j = i > boundSize ? i - boundSize : 1;
          j <= Math.min(i + boundSize, dna2Length);
          j++
        ) {
          calculateCell(i, j);
        }
      }
    };

    const processAdaptiveBounded = () => {
      let threshold = Number(thresholdStr);
      initializeBoundaries(boundSize); // Initialize boundaries or edit distance matrix.
      let leftSideMarker = 1; // Starting column for bounded computation.

      for (let i = 1; i <= dna1Length; i++) {
        let minRowValue = Infinity; // Start with a very large value.
        let minIndex = leftSideMarker; // Track the minimum index for this row.

        // Iterate to the right starting from the leftSideMarker.
        let j = leftSideMarker;
        while (j <= dna2Length) {
          const tempValue = calculateCell(i, j);
          // Update the minimum value and track the index of the minimum value.
          if (tempValue < minRowValue) {
            minRowValue = tempValue;
            minIndex = j; // Update the minimum index.
          }

          // If the value exceeds the threshold, stop the rightward traversal.
          if (tempValue > minRowValue + threshold) {
            break;
          }

          j++; // Move to the next cell on the right.
        }

        // Iterate to the left starting from the leftSideMarker.
        j = leftSideMarker - 1;
        while (j >= 1) {
          const tempValue = calculateCell(i, j);
          // Update the minimum value and track the index of the minimum value.
          if (tempValue < minRowValue) {
            minRowValue = tempValue;
            minIndex = j; // Update the minimum index.
          }

          // If the value exceeds the threshold, stop the leftward traversal.
          if (tempValue > minRowValue + threshold) {
            break;
          }

          j--; // Move to the next cell on the left.
        }
        // Update the leftSideMarker for the next row.
        leftSideMarker = minIndex + 1;
      }
    };

    const processUnbounded = () => {
      initializeBoundaries();
      for (let i = 1; i <= dna1Length; i++) {
        for (let j = 1; j <= dna2Length; j++) {
          calculateCell(i, j);
        }
      }
    };

    // Populate DP table
    if (methodType === METHOD_TYPES.BOUNDED) {
      processBounded();
    } else if (methodType === METHOD_TYPES.ADAPTIVE_BOUNDED) {
      processAdaptiveBounded();
    } else {
      processUnbounded();
    }

    console.log(dpPaths);
    setDirectionsTable(dpPaths);
    setTrackPath(findTheOptimalPath(dpPaths));
    return prepareTableData(dna1, dna2, dp);
  };

  useEffect(() => {
    setTrackingText(
      getBackTrackingText(seq1, seq2, directionsTable, trackPath)
    );
  }, [directionsTable]);

  const handleFinish = (values) => {
    const result = calculateEditDistance(values);
    setTableData(result);
  };

  const columns = useMemo(
    () =>
      getEditDistanceTableCoulmns(form.getFieldValue("seq2") || "", trackPath),
    [form, trackPath]
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <div className="container" style={{ padding: "10px" }}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Row gutter={[12, 12]}>
            <Col md={12} xs={24}>
              <Form.Item
                name={"seq1"}
                label={<p>DNA 1</p>}
                required={false}
                rules={[{ required: true, message: "Enter DNA 1" }]}
              >
                <DNAInput placeholder="Enter DNA 1" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                name={"seq2"}
                label={<p>DNA 2</p>}
                required={false}
                validateTrigger={["onBlur"]}
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || value?.length === 0) {
                        return Promise.reject("Enter DNA 2");
                      }

                      if (value?.length !== seq1?.length) {
                        return Promise.reject(
                          "Two Sequances must be in same length"
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DNAInput placeholder="Enter DNA 2" />
              </Form.Item>
            </Col>
            <Col md={methodType === METHOD_TYPES.NORMAL ? 24 : 12} xs={24}>
              <Form.Item
                name={"methodType"}
                initialValue={METHOD_TYPES.NORMAL}
                label={<p>Method type</p>}
                required={false}
                rules={[{ required: true, message: "Enter DNA 2" }]}
              >
                <Select
                  size="large"
                  options={[
                    { label: "Normal", value: METHOD_TYPES.NORMAL },
                    { label: "Bounded", value: METHOD_TYPES.BOUNDED },
                    {
                      label: "Adaptive bounded",
                      value: METHOD_TYPES.ADAPTIVE_BOUNDED,
                    },
                    {
                      label: "Sequence alignment",
                      value: METHOD_TYPES.SEQUENCE_ALIGNMENT,
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            {(methodType === METHOD_TYPES.BOUNDED ||
              methodType === METHOD_TYPES.ADAPTIVE_BOUNDED) && (
              <Col md={12} xs={24}>
                <Form.Item
                  name={"boundSize"}
                  label={
                    <p>
                      {methodType === METHOD_TYPES.ADAPTIVE_BOUNDED
                        ? "Initial Bound"
                        : "Bound size"}
                    </p>
                  }
                  required={false}
                  rules={[
                    {
                      validator: (_, value) => {
                        if (
                          !value ||
                          value <= 0 ||
                          value > Math?.max(seq1?.length, seq2?.length)
                        ) {
                          return Promise.reject("Enter a valid bound size");
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    size="large"
                    type={"number"}
                    disabled={!(seq1?.length > 0 && seq2?.length > 0)}
                    min={1}
                    max={Math?.max(seq1?.length, seq2?.length)}
                  />
                </Form.Item>
              </Col>
            )}
            {methodType === METHOD_TYPES.ADAPTIVE_BOUNDED && (
              <Col span={24}>
                <Form.Item
                  name={"threshold"}
                  label={<p>Threshold</p>}
                  required={false}
                  rules={[
                    {
                      validator: (_, value) => {
                        if (
                          !value ||
                          value <= 0 ||
                          value > Math?.max(seq1?.length, seq2?.length)
                        ) {
                          return Promise.reject("Enter a valid bound size");
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    size="large"
                    type={"number"}
                    disabled={!(seq1?.length > 0 && seq2?.length > 0)}
                    min={1}
                    max={Math?.max(seq1?.length, seq2?.length)}
                  />
                </Form.Item>
              </Col>
            )}
            {methodType === METHOD_TYPES.SEQUENCE_ALIGNMENT && (
              <>
                <Col md={12} xs={24}>
                  <Form.Item
                    name={"substitutionsCost"}
                    label={<p>Substitutions cost</p>}
                    required={false}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) {
                            return Promise.reject("Enter substitutions cost");
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input size="large" type={"number"} min={0} />
                  </Form.Item>
                </Col>
                <Col md={12} xs={24}>
                  <Form.Item
                    name={"insertionsCost"}
                    label={<p>Insertions cost</p>}
                    required={false}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) {
                            return Promise.reject("Enter insertions cost");
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input size="large" type={"number"} min={0} />
                  </Form.Item>
                </Col>
                <Col md={12} xs={24}>
                  <Form.Item
                    name={"deletionsCost"}
                    label={<p>Deletions cost</p>}
                    required={false}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) {
                            return Promise.reject("Enter deletions cost");
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input size="large" type={"number"} min={0} />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>
          <Button size="large" block type="primary" htmlType="submit">
            Calculate Edit Distance
          </Button>
        </Form>
        {Array.isArray(tableData) && tableData.length > 0 && (
          <Row gutter={[12, 12]} style={{ marginTop: "1rem" }}>
            <Col md={12} xs={24}>
              <Typography.Title level={4}>
                {methodType === METHOD_TYPES.SEQUENCE_ALIGNMENT
                  ? `Sequence Alignment Cost = ${JSON.stringify(
                      tableData[tableData?.length - 1][`col${seq2?.length}`]
                    )}`
                  : methodType === METHOD_TYPES.NORMAL
                  ? `Edit Distance Cost = ${JSON.stringify(
                      tableData[tableData?.length - 1][`col${seq2?.length}`]
                    )}`
                  : `Approximate Edit Distance Cost = ${JSON.stringify(
                      tableData[tableData?.length - 1][`col${seq2?.length}`]
                    )}`}
              </Typography.Title>
              <div style={{ paddingInlineStart: "12px" }}>
                <ul>
                  {trackingText?.mutations?.map((mutation, index) => (
                    <li
                      key={index}
                      style={{ fontSize: "16px", marginTop: "6px" }}
                    >
                      {mutation}
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
            <Col md={12} xs={24}>
              <Flex align="center" gap={10} style={{ marginBottom: "0.5rem" }}>
                {trackingText?.text2?.split("")?.map((char, index) => (
                  <span
                    key={index}
                    style={{
                      width: "20px",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    {char}
                  </span>
                ))}
              </Flex>
              <Flex align="center" gap={10} style={{ marginBottom: "0.5rem" }}>
                {trackingText?.operations?.split("")?.map((char, index) => (
                  <span
                    key={index}
                    style={{
                      width: "20px",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    {char}
                  </span>
                ))}
              </Flex>
              <Flex align="center" gap={10} style={{ marginBottom: "0.5rem" }}>
                {trackingText?.text1?.split("")?.map((char, index) => (
                  <span
                    key={index}
                    style={{
                      width: "20px",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    {char}
                  </span>
                ))}
              </Flex>
            </Col>
          </Row>
        )}
        {Array.isArray(tableData) && tableData.length > 0 && (
          <Table
            sticky
            dataSource={tableData}
            columns={columns}
            pagination={false}
            bordered
            scroll={{
              y: 1000,
              x: "max-content",
            }}
          />
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
