/*


entrada do valor - OK
verificar se código mudou
  atualiza arquivo de destino

histórico de como era antes
verificar se tem à mais ou à menos - OK

comparação

fazer interface visual para visualizar onde falta



*/
const fs = require('fs/promises');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();


var sourceFilePath = "messages.xlf";
var destFilePath = "messages.pt.xlf";


function parseData(xlifData) {
  const parsedData = xlifData.xliff.file[0].body[0]["trans-unit"].map(_data => {
    const data = {
      id: '',
      source: '',
      target: '',
      contexts: []
    }


    data.id = _data.$.id
    data.source = _data.source[0]
    data.target = _data?.target?.[0]
    data.contexts = [0, 1].map(key => _data['context-group'][key].context[0]._ + ':' + _data['context-group'][key].context[1]._)


    return data;
  })
  return parsedData;
}

function getInfos(transUnit, type = 'source' | 'target') {
  return `° transunit id: ${transUnit.id} \'${transUnit.source}\' do(a) ${type === 'source' ? `\'${sourceFilePath}\'` : `\'${destFilePath}\'`} não encontrado no(a) ${type === 'source' ? `\'${destFilePath}\'` : `\'${sourceFilePath}\'`}\n  - ${transUnit.contexts.join('\n  - ')}`
}



(async () => {
  const sourceData = await fs.readFile(sourceFilePath, 'utf-8')
  const destData = await fs.readFile(destFilePath, 'utf-8')



  const xliffJSONSource = await parser.parseStringPromise(sourceData);
  const xliffJSONDest = await parser.parseStringPromise(destData);


  const resSource = parseData(xliffJSONSource)
  const resTarget = parseData(xliffJSONDest)


  // let intersection = resSource.filter(s => resTarget.map(t => t.id).includes(s.id))

  const idsSource = resSource.map(s => s.id);
  const idsTarget = resTarget.map(t => t.id);



  const notMatchingIds = idsSource
    .filter(x => !idsTarget.includes(x))
    .concat(idsTarget.filter(x => !idsSource.includes(x)));


  const notFoundSources = resSource.filter(s => notMatchingIds.includes(s.id))
  const notFoundTargets = resTarget.filter(t => notMatchingIds.includes(t.id))

  console.log(notFoundSources.map(s => getInfos(s, 'source')).join('\n'))
  console.log(notFoundTargets.map(s => getInfos(s, 'target')).join('\n'))

})()




