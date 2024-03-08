const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const express = require('express');
const cors = require('cors');

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