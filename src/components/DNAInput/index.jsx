/* eslint-disable react/prop-types */
import { Input } from "antd";

const DNAInput = ({
  value,
  onChange,
  placeholder = "Enter DNA Sequence",
  ...rest
}) => {
  // Filter input to allow only A, T, C, G characters (case insensitive)
  const handleChange = (e) => {
    const inputValue = e.target.value;
    const filteredValue = inputValue.replace(/[^ATCGatcg]/g, ""); // Remove invalid characters
    if (onChange) {
      // Pass the filtered value to the parent handler
      onChange({
        ...e,
        target: { ...e.target, value: filteredValue?.toUpperCase() },
      });
    }
  };

  return (
    <Input
      value={value}
      size="large"
      onChange={handleChange}
      placeholder={placeholder}
      {...rest}
    />
  );
};

export default DNAInput;
