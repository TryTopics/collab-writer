
const Configurator = require('substance').Configurator;
// TODO here we need to apply the exact same component that the client (app.js) does,
// but currently we get reuse only through the Package export in doctype-sample
import { SimpleWriterPackage } from 'substance-simple-writer/index.es.js';

const HTMLImporter = require('substance').HTMLImporter;
const HTMLExporter = require('substance').HTMLExporter;

if (typeof HTMLImporter !== 'function') {
  throw new Error('Importer is a: ' + typeof HTMLImporter);
}
if (typeof HTMLExporter !== 'function') {
  throw new Error('Exporter is a: ' + typeof HTMLExporter);
}

// CollabServerConfigurator isn't a Configurator
let cfg = new Configurator();

cfg.import(SimpleWriterPackage);

cfg.addImporter('html', HTMLImporter);
//cfg.addImporter('xml', XMLImporter);
cfg.addExporter('html', HTMLExporter);
//cfg.addExporter('xml', XMLExporter);

const formats = {
  //xml: cfg.createExporter('xml', {}),
  html: cfg.createExporter('html', {})
};

//module.exports = {
export default {
  patchDocumentServer: function(documentServer) {

    const _getDocument = documentServer._getDocument;
    if (!_getDocument) throw new Error('Not the expected DocumentServer?');

    documentServer._getDocument = function(req, res, next) {
      res.format({
        html: function () {
          _getDocument.call(documentServer, req, {
            json: function(json) {
              res.header('Content-Type', 'text/html');
              formats.html.exportDocument(json);
            }
          });
        },
        json: _getDocument.bind(documentServer),
        default: _getDocument.bind(documentServer)
      })
    };

  }
}
