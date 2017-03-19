
const Configurator = require('substance').Configurator;

// TODO here we need to apply the exact same component that the client (app.js) does,
// but currently we get reuse only through the Package export in doctype-sample
const SimpleWriterPackage = require('substance-simple-writer').SimpleWriterPackage;

module.exports = class DocXml {

  convertDocument(doc) {
    let el = this.createElement('div')
    el.append(
      this.convertContainer(doc.get('body'))
    )
    return el
  }

}
