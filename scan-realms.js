const axios = require('axios')

const scanRealms = (str = '') => {
  
}

const getDateStr = () => {
  const nowDate = new Date()
  return `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}  ${nowDate.getHours()}:${nowDate.getMinutes()}:${nowDate.getSeconds()}`
}

module.exports = scanRealms