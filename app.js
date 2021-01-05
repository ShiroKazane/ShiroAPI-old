const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Neko = require('./models/neko.js')
const PORT = process.env.PORT || 8080;

mongoose.connect('mongodb+srv://Kairo:DiaPandaKu@kairo.efvo4.mongodb.net/kairo-api', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const storage = multer.diskStorage({
  destination: './public/neko',
  filename: (req, file, cb) => {
    fs.readdir(('./public/neko'), (err, files) => {
      cb(null, file.fieldname + '_' + (parseInt(files.length, 10) + 1) + path.extname(file.originalname))
    })
  }
})

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }}).single('neko');

  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Only image are allowed!');
    }
  }

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static('public'));
app.get('/', (req, res) => res.render('index'));
app.get('/list', (req, res) => {
  Neko.find({}, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data)
    }
  })
})
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('index', {
        message: err.message
      })
    } else if (req.file == undefined) {
      res.render('index', {
        message: 'Error: No file selected!'
      })
    } else {
      var c;
      Neko.findOne({}, (err, data) => {
        if (data) {
          c = Number(data.id_key) + 1;
        } else {
          c = 1;
        }
        var neko = new Neko({
          id_key: String(c),
          url: `https://cdn.kairocafe.xyz/neko/${req.file.filename}`,
        });
        neko.save((err, Person) => {
          if (err) console.log(err);
        });
      }).sort({ _id: -1 }).limit(1);
      res.render('index', {
          url: `https://cdn.kairocafe.xyz/neko/${req.file.filename}`
      })
    }
  })
})

app.listen(PORT, () => {
  console.log('Express is running on PORT: ', PORT);
})
