const axios = require('axios')
const cbor = require('borc')

const getSubrealmsFromTLR = require('./utils/get-subrealms-from-tlr')
const getStateHistoryFromAtomicalId = require('./utils/get-state-history-from-atomical-id')
const getProfileFromDelegate = require('./utils/get-profile-from-delegate')
const getAtomicalInfoFromId = require('./utils/get-atomical-info-from-id')
const getImageDataFromUri = require('./utils/get-image-data-from-uri')

const scanSubrealms = async () => {

  console.log(`scanning ${process.env.TOP_LEVEL_REALM} subrealms started at ${getDateStr()}`)
  let newList = []
  const subrealms = await getSubrealmsFromTLR(process.env.TOP_LEVEL_REALM, process.env.NETWORK)

  for (let i = 0; i < subrealms.length; i ++) {

    try {
      await delay(100)
      const { atomical_id, subrealm } = subrealms[i]
      if (!atomical_id)
        continue
      const { $request_subrealm_status } = await getAtomicalInfoFromId(atomical_id, process.env.NETWORK)
      if (!$request_subrealm_status || $request_subrealm_status.status !== "verified")
        continue
      const stateHistory = await getStateHistoryFromAtomicalId(atomical_id, process.env.NETWORK)
      if (!stateHistory)
        continue
  
      let profile = { atomical_id, subrealm }
      for (let j = 0; j < stateHistory.length; j ++) {
        const { data } = stateHistory[j];
        if (!data)
          continue
  
        let { d } = data
        if (d) {
          if (d.startsWith("atom:btc"))
            d = d.split(":")[3]
          const updatedData = await getProfileFromDelegate(d, process.env.NETWORK)

          const updatedProfileData = extractProfileData(updatedData)
          if (updatedProfileData)
            profile = await mergeProfile(profile, updatedProfileData)
        }
      }
      if (profile && Object.keys(profile).length > 0)
        newList.push(profile)
    } catch (error) {
      console.log(error)
    }

  }
  global.subrealmList = newList
  console.log(`scanning finished at ${getDateStr()}`)
}

const extractProfileData = (data) => {
  if (!data)
    return null
  let keys = Object.keys(data)
  if (keys.indexOf("fields") > -1) {
    const { fields } = data
    keys = Object.keys(fields)
    if (keys.indexOf("args") > -1) {
      const filtered = keys.filter(key => key.indexOf(".json") > -1)
      if (filtered && filtered.length > 0) {
        const { $d, $b } = fields[filtered[0]]
        return $d
      }
    }
    else {
      return fields
    }
  }
  return data
}

const mergeProfile = async (originalData, updatedData) => {
  if (!updatedData)
    return originalData
  const { name, desc, image, links, collections, wallets } = updatedData

  if (!originalData)
    originalData = {}
  if (name)
    originalData['name'] = name
  if (desc)
    originalData['desc'] = desc
  if (image)
    originalData['image'] = await getImageDataFromUri(image, process.env.NETWORK)
  if (links) {
    const linkGroupKeys = Object.keys(links)
    if (linkGroupKeys.length > 0) {
      linkGroupKeys.map((linksNumber) => {
        const { group, items } = links[linksNumber]
        if (group === "social" && items) {
          if (!originalData["links"])
            originalData["links"] = {}
          const itemsKeys = Object.keys(items)
          itemsKeys.map((itemsNumber) => {
            const { type, name, url } = items[itemsNumber]
            originalData["links"][type] = url
          })
        }
      })
    }
  }
  if (collections) {
    const collectionGroupKeys = Object.keys(collections)
    if (collectionGroupKeys.length > 0) {
      if (!originalData['collections'])
        originalData['collections'] = {}
      for (let i = 0; i < collectionGroupKeys.length; i++) {
        const collectionGroupKey = collectionGroupKeys[i];
        const { name, image, desc, preview } = collections[collectionGroupKey]
        originalData['collections'][collectionGroupKey] = {}
        if (name)
          originalData['collections'][collectionGroupKey]['name'] = name
        if (desc)
          originalData['collections'][collectionGroupKey]['desc'] = desc
        if (image)
          originalData['collections'][collectionGroupKey]['image'] = await getImageDataFromUri(image, process.env.NETWORK)
        if (preview) {
          let previewImgs = []
          const previewKeys = Object.keys(preview)
          if (previewKeys) {
            originalData['collections'][collectionGroupKey]['previews'] = []
            for (let j = 0; j < previewKeys.length; j++) {
              const previewKey = previewKeys[j];
              const item = preview[previewKey]
              if (item) {
                const { img } = item
                if (img) {
                  const imageContent = await getImageDataFromUri(img, process.env.NETWORK)
                  previewImgs.push(imageContent)
                }
              }              
            }
            originalData['collections'][collectionGroupKey]['previews'] = previewImgs
          }
        }
      }
    }
  }
  if (wallets) {
    let walletArray = []
    const walletKeys = Object.keys(wallets)
    if (walletKeys && walletKeys.length > 0) {
      for (let i = 0; i < walletKeys.length; i++) {
        const walletKey = walletKeys[i];
        const { address } = wallets[walletKey]
        if (address) {
          walletArray.push({
            type: walletKey,
            address
          })
        }
      }
    }
    originalData['wallets'] = walletArray
  }
  return originalData
}

const delay = (milliseconds) => 
  new Promise(resolve => {
      setTimeout(resolve, milliseconds);
  });

const getDateStr = () => {
  const nowDate = new Date()
  return `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}  ${nowDate.getHours()}:${nowDate.getMinutes()}:${nowDate.getSeconds()}`
}

module.exports = scanSubrealms