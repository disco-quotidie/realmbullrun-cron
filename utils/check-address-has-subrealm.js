const ecc = require('tiny-secp256k1')
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const { sha256 } = require("js-sha256");

const axios = require("axios")

const checkAddressHasSubrealm = async function (address, subrealm, network) {

  const { scripthash } = detectAddressTypeToScripthash(address, network === "bitcoin" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet);

  const APIEndpoint = `${network === "testnet" ? process.env.CURRENT_PROXY_TESTNET : process.env.CURRENT_PROXY}/blockchain.atomicals.listscripthash?params=[\"${scripthash}\"]`

  const response = await axios.get(APIEndpoint)

  let found = false
  if (response.data && response.data.success) {
    const { atomicals } = response.data.response
    if (atomicals) {
      atomicalIds = Object.keys(atomicals)
      atomicalIds.map((atomicalId) => {
        const { type, subtype } = atomicals[atomicalId]
        if (type === "NFT" && subtype === "subrealm") {
          const { full_realm_name, request_subrealm_status } = atomicals[atomicalId]
          if (full_realm_name === subrealm && request_subrealm_status && request_subrealm_status.status === "verified") {
            found = true
          }
        }
      })
    }
  }

  return found
}

function convertAddressToScripthash(address, network) {
  const output = bitcoin.address.toOutputScript(address, network);
  return {
      output,
      scripthash: Buffer.from(sha256(output), "hex").reverse().toString("hex"),
      address
  };
}

function detectAddressTypeToScripthash(address, NETWORK) {
  // Detect legacy address
  try {
    bitcoin.address.fromBase58Check(address, NETWORK);
    const p2pkh = addressToP2PKH(address);
    const p2pkhBuf = Buffer.from(p2pkh, "hex");
    return {
      output: p2pkh,
      scripthash: Buffer.from(sha256(p2pkhBuf), "hex").reverse().toString("hex"),
      address
    }
  } catch (err) {
  }
  // Detect segwit or taproot
  // const detected = bitcoin.address.fromBech32(address);
  const BECH32_SEGWIT_PREFIX = 'bc1';
  const BECH32_TAPROOT_PREFIX = 'bc1p';
  const TESTNET_SEGWIT_PREFIX = 'tb1';
  const REGTEST_TAPROOT_PREFIX = 'bcrt1p';
  if (address.startsWith(BECH32_SEGWIT_PREFIX) || address.startsWith(BECH32_TAPROOT_PREFIX) ||
      address.startsWith(TESTNET_SEGWIT_PREFIX) || address.startsWith(REGTEST_TAPROOT_PREFIX)) {
    return convertAddressToScripthash(address, NETWORK);
  } else {
    throw new Error(`Unrecognized address format for address: ${address}`);
  }
}

module.exports = checkAddressHasSubrealm