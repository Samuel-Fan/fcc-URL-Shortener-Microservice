require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {console.log("connect success!")})
  .catch((err) => {console.error("connect fail.")});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// mongo schema

const URLSchema = new mongoose.Schema({
  longUrl: {type:String, required: true},
  shortUrl: {type:Number, required: true}
})

var count;

let URL = mongoose.model('URL',URLSchema);

const countNumber = async() => {
  await URL.countDocuments({},(err, data) => {
    count = data;
  })
}

countNumber();

const createAndSaveData = async (urlInput, n) => {

  let newData = new URL({
    longUrl: urlInput,
    shortUrl: n
  })

  newData.save((err,data)=> {
    if (err) return console.log(err);
    console.log("Save and create a short URL.", data);
    count ++;
  })
}

const queryDataByLongURL = async (urlInput) => {
  let data;
  await URL.find({longUrl: urlInput},(err, url) => {
    data = url;
  })
  return data;
}



/*const testFunction = async () => {
  let data1 = await queryDataByLongURL("https://github.com/Samuel-Fan/fcc-URL-Shortener-Microservice");
  console.log(data1,"data1");
}

testFunction();*/

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// project request

app.post('/api/shorturl', (req, res) => {
  let urlInput = req.body.url;

  // check whether the input value is a valid url.
  let checkedUrl = urlInput.replace(/(?:https?:\/\/)(?:www.)?([a-z0-9\-\.]+)(?:.*)/, "$1");
  dns.lookup(checkedUrl, async (err, address, family) => {
    if (err) {
      res.json({error: 'invalid url' });

    } else {
      // search in the database
      
      URL.find({longUrl: urlInput})
         .exec((err, data) => {

            let urlData = data[0];
            if ( urlData === undefined) {

              res.json({original_url: urlInput ,short_url: count})

              createAndSaveData(urlInput, count);

              } else {
                res.json({original_url: urlData.longUrl ,short_url: urlData.shortUrl});
            }
      })
    }
  }) 
})

app.get('/api/shorturl/:number', (req, res) => {
  let key = req.params.number;
  URL.find({shortUrl: key})
    .exec((err, data) => {
      res.redirect(data[0].longUrl);
    })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
