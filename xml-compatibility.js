
const formats = {
  xml: undefined,
  html: undefined
};

module.exports.configure = function(substanceCfg) {
  formats.xml = substanceCfg.createImporter('xml');
  formats.html = substanceCfg.createImporter('html');
}

module.exports.patchDocumentServer = function(documentServer) {

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
