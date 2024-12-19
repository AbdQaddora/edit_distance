import {
  Button,
  Col,
  ConfigProvider,
  Form,
  Input,
  Row,
  Select,
  Table,
  theme,
} from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import DNAInput from "./components/DNAInput";
import { useMemo, useState } from "react";
import getEditDistanceTableCoulmns from "./utils/convertTableToAntdTable";
import prepareTableData from "./utils/prepareTableData";
import findTheOptimalPath from "./utils/ findTheOptimalPath";
import initializeDpMatrix from "./utils/initializeDpMatrix";
import { COPY_DIRECTIONS, METHOD_TYPES } from "./constants";

function App() {
  const [form] = useForm();
  const [tableData, setTableData] = useState([]);
  const [trackPath, setTrackPath] = useState([]);
  const methodType = useWatch("methodType", form);
  const seq1 = useWatch("seq1", form);
  const seq2 = useWatch("seq2", form);

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

    console.log({ substitutionsCost, insertionsCost, deletionsCost });

    const initializeBoundaries = (size) => {
      for (let i = 0; i <= size; i++) {
        dp[i][0] = i;
        dpPaths[i][0] = COPY_DIRECTIONS.TOP;
      }
      for (let j = 0; j <= size; j++) {
        dp[0][j] = j;
        dpPaths[0][j] = COPY_DIRECTIONS.LEFT;
      }
      dpPaths[0][0] = COPY_DIRECTIONS.DIAGONAL;
    };

    const calculateCell = (i, j) => {
      if (dna1[i - 1] === dna2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        dpPaths[i][j] = COPY_DIRECTIONS.DIAGONAL;
      } else {
        const minVal = Math.min(
          dp[i - 1]?.[j] ?? Infinity,
          dp[i]?.[j - 1] ?? Infinity,
          dp[i - 1]?.[j - 1] ?? Infinity
        );

        if(minVal === dp[i - 1]?.[j - 1]){
          dpPaths[i][j] = COPY_DIRECTIONS.DIAGONAL;
          dp[i][j] = substitutionsCost + minVal;
        }else if(minVal === dp[i - 1]?.[j]){
          dpPaths[i][j] = COPY_DIRECTIONS.TOP;
          dp[i][j] = insertionsCost + minVal;
        }else if(minVal === dp[i]?.[j - 1]){
          dpPaths[i][j] = COPY_DIRECTIONS.LEFT;
          dp[i][j] = deletionsCost + minVal;
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

    const processUnbounded = () => {
      initializeBoundaries(dna2Length);
      for (let i = 1; i <= dna1Length; i++) {
        for (let j = 1; j <= dna2Length; j++) {
          calculateCell(i, j);
        }
      }
    };

    // Populate DP table
    if (methodType === METHOD_TYPES.BOUNDED) {
      processBounded();
    } else {
      processUnbounded();
    }

    setTrackPath(findTheOptimalPath(dpPaths));
    return prepareTableData(dna1, dna2, dp);
  };

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
                rules={[{ required: true, message: "Enter DNA 2" }]}
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
                      label: "Sequence alignment",
                      value: METHOD_TYPES.SEQUENCE_ALIGNMENT,
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            {methodType === METHOD_TYPES.BOUNDED && (
              <Col md={12} xs={24}>
                <Form.Item
                  name={"boundSize"}
                  initialValue={"normal"}
                  label={<p>Bound size</p>}
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
