const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const multer = require('multer');
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/assets/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/images', express.static('private'));

// Neko

let nekoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/neko')
  },
  filename: function (req, file, cb) {
    let files = fs.readdirSync('./public/neko');
    cb(null, 'neko_' + ++files.length + path.extname(file.originalname))
  }
})
let nekoUpload = multer({ storage: nekoStorage })

// ------------------------------------------------------------------------------

// Baka

let bakaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/baka')
  },
  filename: function (req, file, cb) {
    let files = fs.readdirSync('./public/baka');
    cb(null, 'baka_' + ++files.length + path.extname(file.originalname))
  }
})
let bakaUpload = multer({ storage: bakaStorage })

// ------------------------------------------------------------------------------

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/api', (req, res) => {
  const list = fs.readdirSync('./public');
  res.json(list);
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

app.get('/upload/:id', (req, res) => {
  let param = './public/' + req.params.id;
  if (fs.existsSync(param)) {
    res.render('upload', {
      id: req.params.id
    });
  } else {
    return res.status(404).render('404');
  }
})

app.post('/upload/neko', nekoUpload.single('upload'), (req, res) => {
  res.render('upload', {
    id: 'neko'
  });
})

app.post('/upload/baka', bakaUpload.single('upload'), (req, res) => {
  res.render('upload', {
    id: 'baka'
  });
})

app.all('*', function (req, res, next) {
  res.status(404).render('404');
})

app.listen(PORT, () => {
  console.log('Express is running on PORT: ', PORT);
})
