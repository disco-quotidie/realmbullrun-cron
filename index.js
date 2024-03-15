const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const express = require('express');
const cors = require('cors');

const { BIP322, Signer, Verifier } = require('bip322-js')

const fs = require('fs')
const FILES_PATH = './items'

const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send(`+${process.env.TOP_LEVEL_REALM} Subrealm Indexer API is working on ${process.env.NETWORK}!`);
});

app.get('/api/get-subrealms', async (req, res) => {
  res.status(200).json(global.subrealmList)
})

app.get('/api/get-subrealm-info', async (req, res) => {
  try {
    const { subrealm } = req.query
    const sblist = global.subrealmList.filter(elem => elem.subrealm === subrealm)
    if (sblist && sblist.length > 0) {
      res.status(200).json({
        success: true,
        data: sblist[0]
      })
    }
    else
      res.status(200).json({
        success: false,
        data: {}
      })
  } catch (error) {
    res.status(500).json({
      success: false,
      data: {}
    })    
  }
})

const originalMessage = "In order to prove you are the owner of this realm and whitelisted, you should sign this message. No sats are being charged, no transactions are broadcast."

app.get('/api/getJSON', async (req, res) => {
  try {
    const { item, address, signedMessage } = req.query

    const result = Verifier.verifySignature(address, originalMessage, signedMessage)

    if (!result || result === "false" || result === "error") {
      return res.status(200).send({
        success: false,
        msg: "not verified"
      })
    }

    const filePath = `${FILES_PATH}/${item}.json`
    if (!fs.existsSync(filePath))
      return res.status(200).send({
        success: false,
        msg: "verified but file not found"
      })
    
    
    const file = fs.readFileSync(filePath)
    const data = fs.createReadStream(filePath)
    const disposition = `attachment; filename=${item}.json`

    res.setHeader('Content-Type', 'file/unknown')
    res.setHeader('Content-Length', file.length)
    res.setHeader('Content-Disposition', disposition)

    data.pipe(res)
  } catch (error) {
    console.log(error)
    return res.status(404).send("error")
  }
})

const scanRealms = require('./scan-realms');

const server = http.createServer(app);

global.subrealmList = []

server.listen(process.env.PORT, () => {
  console.log(`+${process.env.TOP_LEVEL_REALM} Subrealm Indexer started :${process.env.PORT} on ${process.env.NETWORK}...`)
  scanRealms()
  setInterval(() => {
    scanRealms()
  }, 300000)
})