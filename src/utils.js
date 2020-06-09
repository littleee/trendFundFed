export const getNumberColor = value => {
  if(Number(value) >= 0){
    return 'green'
  }
  if(Number(value) < 0){
    return 'red'
  }
  return 'grey'
}

export const getNumberFormat = value => {
  if(Number(value) > 0){
    return `+${value}`
  }
  return value
}

export const isNumberGreaterThanZero = value => {
  if(Number(value) >= 0){
    return true
  }
  return false
}

export const getDataByDayFormat = data => data.filter(x=>new Date(x[0]).getHours() === 8)

export const getRunDays = (data) => {
  const len = data.length
  if(len > 0){
    return len
  }
  return  '--'
}

export const getIncomeRate = (data, days) => {
  const len = data.length;
  const hasDaysfromDataLength = len - 1 - days > 0;
  if(len > 1){
    if(days && hasDaysfromDataLength){
      return (data[len - 1][1] / data[len - 1 - days][1] - 1) * 100
    }
    return (data[len - 1][1] / data[0][1] - 1) * 100
  }
  return 0
}
