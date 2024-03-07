const axios = require("axios")

const getStateHistoryFromAtomicalId = async function  (atomicalId, network) {

  const APIEndpoint = `${network === "testnet" ? process.env.CURRENT_PROXY_TESTNET : process.env.CURRENT_PROXY}/blockchain.atomicals.get_state_history?params=[\"${atomicalId}\"]`

  const response = await axios.get(APIEndpoint)

  if (response.data && response.data.success) {
    let { history } = response.data.response.result.state
    history.sort((a, b) => a.height - b.height)
    return history
  }

  return []

}

module.exports = getStateHistoryFromAtomicalId