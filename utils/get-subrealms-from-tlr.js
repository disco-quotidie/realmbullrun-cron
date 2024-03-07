const axios = require("axios")
const getAtomicalIdFromRealmname = require("./get-atomical-id-from-realmname")

const getSubrealmsFromTLR = async function (tlr, network) {
  
  if (!tlr || tlr.length === 0)
    return []

  const tlrAtomicalId = await getAtomicalIdFromRealmname(tlr, network)

  if (!tlrAtomicalId)
    return []

  const APIEndpoint = `${network === "testnet" ? process.env.CURRENT_PROXY_TESTNET : process.env.CURRENT_PROXY}/blockchain.atomicals.find_subrealms?params=[\"${tlrAtomicalId}\"]`
  
  const response = await axios.get(APIEndpoint)

  if (response.data && response.data.success) {
    const { result } = response.data.response
    return result
  }

  return []

}

module.exports = getSubrealmsFromTLR