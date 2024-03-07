const axios = require('axios')

const getAtomicalInfoFromId = async function  (atomicalId = "", network) {

  if (!atomicalId)
    return null

  const APIEndpoint = `${network === "testnet" ? process.env.CURRENT_PROXY_TESTNET : process.env.CURRENT_PROXY}/blockchain.atomicals.get?params=[\"${atomicalId}\"]`

  const response = await axios.get(APIEndpoint)

  if (response.data && response.data.success) {
    const atomicalData = response.data.response.result
    return atomicalData
  }

  return null

}

module.exports = getAtomicalInfoFromId