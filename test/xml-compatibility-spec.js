const expect = require('chai').expect();

const DocumentEngine = require('substance').DocumentEngine;
const DocumentServer = require('substance').DocumentServer;
const xmlCompatibility = require('../xml-compatibility');

describe("patchDocumentServer", function() {

  // https://github.com/substance/substance/blob/v1.0.0-beta.6.5/collab/DocumentServer.js
  class MockDocumentEngine {
    getDocument(documentId, cb) {
      cb(null, require('./example-doc-1.json'), 999999);
    }
  };

  const params = {
    configurator: {
      getDocumentEngine: function() {
        return new MockDocumentEngine();
      }
    }
  };

  it("Responds using json by default", function(done) {
    const server = new DocumentServer(params);
    xmlCompatibility.patchDocumentServer(server);
    server._getDocument({
      params: { id: 'example-doc' }
    }, {
      json: json => {
        console.log('Got json', json);
        done();
      },
      format: formatCb => {
        formatCb.default();
      }
    })
  });

  it("Responds using XML if such an Accept header is present", function(done) {
    const server = new DocumentServer(params);
    xmlCompatibility.patchDocumentServer(server);
    server._getDocument({
      params: { id: 'example-doc' }
    }, {
      json: json => {
        throw new Error('Should not respond json');
      }
    })
  });

});
