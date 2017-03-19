import { DocumentServer, CollabServer, CollabServerPackage, CollabServerConfigurator, series } from 'substance'
import express from 'express'
import path from 'path'
import http from 'http'
import { Server as WebSocketServer } from 'ws'
import seed from './seed'

const xmlCompatibility = require('./xml-compatibility');

/*
  CollabServerPackage provides an in-memory backend for testing purposes.
  For real applications, please provide a custom package here, which configures
  a database backend.
*/
let cfg = new CollabServerConfigurator()
cfg.import(CollabServerPackage)
cfg.setHost(process.env.HOST || 'localhost')
cfg.setPort(process.env.PORT || 7777)

/*
  Setup Express, HTTP and Websocket Server
*/
let app = express()
let httpServer = http.createServer();
let wss = new WebSocketServer({ server: httpServer })

/*
  DocumentServer provides an HTTP API to access snapshots
*/
var documentServer = new DocumentServer({
  configurator: cfg
})
xmlCompatibility.patchDocumentServer(documentServer);
documentServer.bind(app)

/*
  CollabServer implements the server part of the collab protocol
*/
var collabServer = new CollabServer({
  configurator: cfg
})

collabServer.bind(wss)

/*
  Serve static files (e.g. the SimpleWriter client)
*/
app.get('/', (req, res) => res.redirect('/author/'));
app.get('/author/', (req, res) => res.redirect('/author/example-doc'));
app.use('/author/:id', express.static(path.join(__dirname, '/dist')));

/*
  Error handling

  We send JSON to the client so they can display messages in the UI.
*/
app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  if (err.inspect) {
    // This is a SubstanceError where we have detailed info
    console.error(err.inspect())
  } else {
    // For all other errors, let's just print the stack trace
    console.error(err.stack)
  }
  res.status(500).json({
    errorName: err.name,
    errorMessage: err.message || err.name
  })
})

// Delegate http requests to express app
httpServer.on('request', app)

/*
  Seeding. This is only necessary with our in-memory stores.
*/
function _runSeed(cb) {
  console.info('Seeding database ...')
  let changeStore = cfg.getChangeStore()
  let snapshotStore = cfg.getSnapshotStore()
  seed(changeStore, snapshotStore, cb)

}

function _startServer(cb) {
  httpServer.listen(cfg.getPort(), cfg.getHost(), cb)
}

function _whenRunning() {
  console.info('Listening on http://' + cfg.getHost() + ':' + httpServer.address().port)
  console.info('REST API at http://' + cfg.getHost() + ':' + httpServer.address().port + '/api/documents/')
}

series([_runSeed, _startServer], _whenRunning)
