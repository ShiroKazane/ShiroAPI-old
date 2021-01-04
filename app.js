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
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static('images'));
app.get('/images', (req, res) => {
  Images.find({}, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json({data})
    }
  })
})
app.post('/upload', upload.single('image'), (req, res) => {
  var c;
  Images.findOne({}, (err, data) => {
    if (data) {
      c = data.id + 1;
    } else {
      c = 1;
    }
    var images = new Images({
      id: c,
      url: `https://cdn.kairocafe.xyz/images/${req.file.filename}`,
    });
    images.save((err, Person) => {
      if (err) console.log(err);
    });
  }).sort({ _id: -1 }).limit(1);
  res.json({
      success: 200,
      url: `https://cdn.kairocafe.xyz/images/${req.file.filename}`
  })
})

function errHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    res.json({
      success: 404,
      message: err.message
    })
  }
}

app.use(errHandler);
app.listen(PORT, () => {
  console.log('Express is running on PORT: ', PORT);
})
