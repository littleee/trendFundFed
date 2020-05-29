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
