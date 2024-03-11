const getAtomicalInfoFromId = require('./get-atomical-info-from-id')
const axios = require('axios')
const fs = require('node:fs/promises');
const getImageDataFromUri = async (uri, network) => {
  if (uri.startsWith("atom:btc:id")) {
    let atomicai_id = uri.split(":")[3]
    if (atomicai_id.indexOf("/") > -1)
      atomicai_id = atomicai_id.split("/")[0]
    const info = await getAtomicalInfoFromId(atomicai_id, network)
    if (!info)
      return ""

    const { mint_data } = info
    if (mint_data) {
      const { fields } = mint_data
      if (fields) {
        const fieldsKeys = Object.keys(fields)
        if (fieldsKeys && fieldsKeys.length > 0) {
          for (let i = 0; i < fieldsKeys.length; i++) {
            const fieldKey = fieldsKeys[i];
            if (fieldKey !== "args") {
              const imageWrapper = fields[fieldKey]
              if (imageWrapper && typeof imageWrapper === "object") {
                const { $b } = imageWrapper
                if (!$b) {
                  const { $d } = imageWrapper
                  if ($d && typeof $d === "string")
                    return $d
                }
                if ($b && typeof $b === "string")
                  return $b
                if ($b && typeof $b === "object") {
                  const { $d } = $b
                  if ($d && typeof $d === "string")
                    return $d
                }
              }
            }
          }
        }
      }
    }
  }
  else if (uri.startsWith("atom:btc:dat")) {
    return uri
    // const response = await axios.get(`${process.env.CURRENT_URN_PROXY}/${uri}`)
    // // console.log(`${process.env.CURRENT_URN_PROXY}/${uri}`)
    // // const mimeType = "svg"
    // console.log(response.data)
    // const bytes = Buffer.from(response.data, 'base64');
    // console.log(bytes.length)
    // const base64 = bytes.toString('hex');
    // // console.log('-------------------------')
    // // // console.log(response.data)
    // // console.log(base64.length)
    // // return `data:${mimeType};base64,${base64}`;
    // console.log(base64)
    
  }
  return ""
}

module.exports = getImageDataFromUri