const http = require('http');
const express = require('express');
const cors = require('cors');
const httpStatus = require('http-status');
const routes = require('./route');

const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send('Congratulations! Realm Indexer API is working!');
});
app.use('/api', routes);

const scanRealms = require('./scan-realms');

const server = http.createServer(app);

global.realmMap = {}

server.listen(80, () => {
  console.log('Realm Indexer started...')
  scanRealms()
  setInterval(() => {
    scanRealms()
  }, 100000)
})