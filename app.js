const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Images = require('./models/images.js')
const PORT = process.env.PORT || 8080;

mongoose.connect('mongodb+srv://Kairo:DiaPandaKu@kairo.efvo4.mongodb.net/kairo-api', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const storage = multer.diskStorage({
  destination: './images',
  filename: (req, file, cb) => {
      return cb(null, `img_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage: storage
}).single('image');

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static('images'));
app.get('/', (req, res) => res.render('index'));
app.get('/images', (req, res) => {
  Images.find({}, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json({data})
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
      Images.findOne({}, (err, data) => {
        if (data) {
          c = Number(data.id_key) + 1;
        } else {
          c = 1;
        }
        var images = new Images({
          id_key: String(c),
          url: `https://cdn.kairocafe.xyz/images/${req.file.filename}`,
        });
        images.save((err, Person) => {
          if (err) console.log(err);
        });
      }).sort({ _id: -1 }).limit(1);
      res.render('index', {
          url: `https://cdn.kairocafe.xyz/images/${req.file.filename}`
      })
    }
  })
})

app.listen(PORT, () => {
  console.log('Express is running on PORT: ', PORT);
})
