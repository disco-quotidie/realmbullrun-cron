const getAtomicalInfoFromId = require('./get-atomical-info-from-id')
const axios = require('axios')
const request = require('request')

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
    const base64Image = await doRequest(`${process.env.CURRENT_URN_PROXY}/${uri}`)
    return base64Image
  }
  return ""
}

function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request.get(url, { encoding: null }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let base64Image = `data:${response.headers['content-type']};base64,` + Buffer.from(body).toString('base64');
        return resolve(base64Image)
      }
      else
        return reject(error)
    });
  });
}

module.exports = getImageDataFromUri