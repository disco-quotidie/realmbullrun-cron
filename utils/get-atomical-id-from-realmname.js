const axios = require("axios")

const getAtomicalIdFromRealmname = async function (realmname, network) {

  const APIEndpoint = `${network === "testnet" ? process.env.CURRENT_PROXY_TESTNET : process.env.CURRENT_PROXY}/blockchain.atomicals.get_realm_info?params=[\"${realmname}\"]`

  const response = await axios.get(APIEndpoint, { headers: {"Content-type": "application/json"}})
  // const response = await fetch(APIEndpoint)

  if (response.data && response.data.success) {
    const { atomical_id } = response.data.response.result
    return atomical_id
  }

  return null

}

module.exports = getAtomicalIdFromRealmname