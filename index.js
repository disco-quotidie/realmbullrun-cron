const http = require('http');
const express = require('express');
const cors = require('cors');
const routes = require('./route');

const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send(`+${tlr} Subrealm Indexer API is working on ${process.env.NETWORK}!`);
});
app.use('/api', routes);

const tlr = process.env.TOP_LEVEL_REALM
const scanRealms = require('./scan-realms');

const server = http.createServer(app);

global.subrealmMap = {}

server.listen(80, () => {
  console.log(`+${tlr} Subrealm Indexer started on ${process.env.NETWORK}...`)
  scanRealms()
  setInterval(() => {
    scanRealms()
  }, 300000)
})