/**
 * Created by albert on 09.04.15.
 */
var fs = require('fs');
var request = require('request');
var path = require('path');
var cheerio = require('cheerio');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});
//var program = require('commander');

//program
//    .version('0.0.1')
//    .option('-d, --documentdirectory <documentdirectory>', 'specify the document directory,'
//    + ' defaults to crawl/doc/ (MUST END WITH SLASH /)',
//    String, '/home/albert/workspace/norch-document-processor/lib/doc/')
//    .option('-e, --endpoint <endpoint>', 'specify the norch endpoint',
//    String, 'http://localhost:3030/indexer')
//    .option('-f, --filteron <filteron>', 'specify the fields to facet/filter on',
//    String, '')
//    .parse(process.argv);

var docdir = /*program.documentdirectory ||*/ '/home/albert/workspace/test-content';

//var norchFiles = fs.readdirSync(docdir);


console.log('docs folder is: ' + docdir);
var docs = getAllFilesFromFolder(docdir);
console.log('found ' + docs.length + ' docs');

for (var prop in docs) {
    //console.log("file: " + norchFiles[prop] + '\n');
    var json = htmlToJSON(docs[prop]);
    //postToNorch(JSON.stringify([json]));
    postToElasticSearch(json);
    
    //console.log(json);
}

client.count({ index: 'readium'}, function (error, response) {
    console.log(response);
});

console.log('all is done');

function postToElasticSearch (json) {

    client.bulk({
        body: [
            // action description
            { index:  { _index: 'readium', _type: 'spineitem', _id: json.id } },
            // the document to index
            json
        ]
    }, function (err, resp) {
        //console.log(err);
    });
}

function postToNorch (json) {

    var r = request.post('http://localhost:3030/indexer', function (error, response, body) {
        console.log(error);
    });
    var form = r.form();
    form.append('document', json);
}


function htmlToJSON(file) {

    var doc = {};

    try {
        var html = fs.readFileSync(file);

        var $ = cheerio.load(html);

        $("title").each(function (i, e) {
            var title = $(e);
            doc['title'] = title.text();
        });
        $("body").each(function (i, e) {
            var body = $(e);
            doc['body'] = body.text().replace(/\s+/g, ' ');
        });

    } catch (err) {
        console.error(err);
    }
    doc.id = path.basename(file, '.xhtml');
    doc.id = path.basename(doc.id, '.html');
    
    return doc;
}

function getAllFilesFromFolder(dir) {

    var results = [];

    fs.readdirSync(dir).forEach(function (file) {

        file = dir + '/' + file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFilesFromFolder(file))
        } else {
            if (path.extname(file) === '.html' || path.extname(file) === '.xhtml')
                results.push(file);
        }

    });
    return results;
};