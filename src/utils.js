export const getNumberColor = (value) => {
  if (Number(value) >= 0) {
    return "green";
  }
  if (Number(value) < 0) {
    return "red";
  }
  return "grey";
};

export const getNumberFormat = (value) => {
  if (Number(value) >= 0) {
    return `+${value}`;
  }
  return value;
};

export const isNumberGreaterThanZero = (value) => {
  if (Number(value) >= 0) {
    return true;
  }
  return false;
};

export const getDataByDayFormat = (data) =>
  data.filter((x) => new Date(x[0]).getHours() === 8);

export const getRunDays = (data) => {
  const len = data.length;
  if (len > 0) {
    return len;
  }
  return "--";
};

export const getIncomeRate = (data, days) => {
  const len = data.length;
  const hasDaysfromDataLength = len - 1 - days > 0;
  if (len > 1) {
    if (days && hasDaysfromDataLength) {
      return (data[len - 1][1] / data[len - 1 - days][1] - 1) * 100;
    }
    return (data[len - 1][1] / data[0][1] - 1) * 100;
  }
  return 0;
};

const decimalFull = (number, decimal) => {
  let s_x = number.toString();
  let pos_decimal = s_x.indexOf(".");
  if (pos_decimal < 0) {
    pos_decimal = s_x.length;
    s_x += ".";
  }
  while (s_x.length <= pos_decimal + decimal) {
    s_x += "0";
  }
  return s_x;
};

export const getNumberWithDecimal = (number = 0, decimal = 0) => {
  const multiplier = Math.pow(10, decimal);
  if (Number(number) > 0) {
    const result = Math.floor(Number(number) * multiplier) / multiplier;
    return decimalFull(result, decimal);
  } else {
    const result = Math.ceil(Number(number) * multiplier) / multiplier;
    return decimalFull(result, decimal);
  }
};
