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

export const getDataByDayFormat = data => data.filter(x=>new Date(x[0]).getHours() === 8)
