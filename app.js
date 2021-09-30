const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/assets/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Nothing.')
})

app.get('/api', (req, res) => {
  const list = fs.readdirSync('./public');
  res.json(list)
})

app.get('/api/:id', (req, res) => {
  let param = './public/' + req.params.id;
  if (fs.existsSync(param)) {
    let requiredCount = 3;
    let files = fs.readdirSync('./public/' + req.params.id);
    
    while(requiredCount-- && files.length) {
      let length = files.length;
      let index = Math.floor(Math.random() * length);
      let result = files.splice(index, 1);
      return res.json({
        url: 'https://' + req.hostname + '/' + req.params.id + '/' + result
      })
    }
  } else {
    return res.status(404).render('404');
  }
});

app.all('*', function (req, res, next) {
  res.status(404).render('404');
})

app.listen(PORT, () => {
  console.log('Express is running on PORT: ', PORT);
})
