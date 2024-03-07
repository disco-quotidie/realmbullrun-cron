const axios = require("axios")

const getProfileFromDelegate = async function (delegate, network) {

  if (!delegate)
    return null
  
  const APIEndpoint = `${network === "testnet" ? process.env.CURRENT_PROXY_TESTNET : process.env.CURRENT_PROXY}/blockchain.atomicals.get?params=[\"${delegate}\"]`

  const response = await axios.get(APIEndpoint)

  if (response.data && response.data.success) {
    const { mint_data } = response.data.response.result
    return mint_data
  }

  return null
}

module.exports = getProfileFromDelegate