var express = require('express');
var bodyparser = require('body-parser');
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://databaseuser:databasepassword@ds161012.mlab.com:61012/image-search", (err, database) => {
    if (err)
        console.log(err);
    db = database;
    app.listen(process.env.PORT, () => {
        console.log("Server started");
    })
});
var app = express();
app.set('view engine', 'pug');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.render('index.pug');
})
app.get('/search/:searchquery', (req, res) => {
    var offset = req.query.offset;
    var searchquery = req.params.searchquery;
    if (offset == undefined)
    {
        offset = 1;
    }
    
    var searchString = "https://www.googleapis.com/customsearch/v1?num=10&imgSize=medium&searchType=image&cx=009539029256583354960%3Acukgjuw8bdi&key=AIzaSyCKWvWxGLOKK5PiR43k4wFJMol1v4fxEVo&cx=009539029256583354960%3Acukgjuw8bdi&q=" + searchquery + "&start="+offset;

    request(searchString, (error, response, body) => {
        var currentTime = new Date();
        var searchObj = {
            query: searchquery,
            time: currentTime.toISOString()
        };
        db.collection("searchqueries").save(searchObj);
        reJson = { items: [] };
        var items = JSON.parse(body).items;
        for (var i = 0; i < items.length; i++)
        {
            var imageJson = {
                "title": items[i].title,
                "imageurl": items[i].link,
                "snippet": items[i].snippet,
                "pagelink": items[i].image.contextLink
            };
            reJson.items.push(imageJson);
        }
        res.json(reJson);
    });
});
app.get('/latestsearches', (req, res) => {
    db.collection("searchqueries").find().sort({ "time": -1 }).limit(10).toArray((err,results) => {
        res.json(results);
    });
});