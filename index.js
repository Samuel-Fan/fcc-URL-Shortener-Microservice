require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// project request

const urlData = {};
let count = 1;

app.post('/api/shorturl', (req, res) => {
  let value = req.body.url;
  let checkedUrl = value.replace(/(?:https?:\/\/)(?:www.)?([a-z0-9\-\.]+)(?:.*)/, "$1");
  dns.lookup(checkedUrl, (err, address, family) => {
    if (err) {
      res.json({error: 'invalid url' });
    } else {
      let number = Object.keys(urlData).find( key => urlData[key] === value);

      if ( number === undefined) {
        urlData[count] = req.body.url;
        number = count;
        count++;
      }

      res.json({original_url: req.body.url, short_url: number})
    }
  }) 
})

app.get('/api/shorturl/:number', (req, res) => {
  let key = req.params.number;
  console.log(urlData[key]);
  res.redirect(urlData[key]);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
