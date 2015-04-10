/**
 * Created by albert on 10.04.15.
 */
var elasticsearch = require('elasticsearch');
var ejs = require('elastic.js');
var client = new elasticsearch.Client({
    host: 'localhost:9200'
});

client.search({
    index: 'readium',
    body: ejs.Request().query(ejs.QueryStringQuery('"content by epub:trigger elements is supported. If this text is rendered, the audio element is not supported and the test fails"'))
}).then(function (resp) {
    var hits = resp.hits.hits;
    console.log(hits);
}, function (err) {
    console.trace(err.message);
});

//client.suggest({
//    index: 'readium',
//    body: ejs.TermSuggester('mysuggester')
//        .text('epub')
//        .field('body')
//}, function (error, response) {
//    var hits = response.hits;
//    console.log(hits);
//});
