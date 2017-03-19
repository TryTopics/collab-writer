
module.exports.patchDocumentServer = function(documentServer) {

  const _getDocument = documentServer._getDocument;
  if (!_getDocument) throw new Error('Not the expected DocumentServer?');

  documentServer._getDocument = function(req, res, next) {
    res.format({
      html: function () {
        _getDocument.call(documentServer, req, {
          json: function(json) {
            console.log('TODO produce XML from', json);
            json.todoXML = true;
            res.json(json);
          }
        });
      },
      json: _getDocument.bind(documentServer),
      default: _getDocument.bind(documentServer)
    })
  };

}
