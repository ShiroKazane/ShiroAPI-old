const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let type = req.path;
    let param = `./public${type}`
    cb(null, param)
  },
  filename: (req, file, cb) => {
    fs.readdir(('./public/' + file.fieldname), (err, files) => {
      cb(null, file.fieldname + '_' + (parseInt(files.length, 10) + 1) + path.extname(file.originalname))
    })
  }
})

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Nothing.')
})

app.get('/api', (req, res) => {
  const list = ['neko'];
  res.json(list)
})

// Neko

app.get('/neko', (req, res) => {
  res.render('index', {
    type: 'neko'
  });
});

const neko = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('neko')

app.post('/neko', (req, res) => {
  neko(req, res, (err) => {
    if (err) {
      res.render('index', {
        message: err.message,
        type: req.path
      })
    } else if (req.file == undefined) {
      res.render('index', {
        message: 'Error: No file selected!',
        type: req.path
      })
    } else {
      res.render('index', {
        file: `https://cdn.kairocafe.xyz/${req.path}/${req.file.filename}`,
        type: req.path
      });
    }
  })
});

app.get('/api/:id', (req, res) => {
  let param = './public/' + req.params.id;
  if (fs.existsSync(param)) {
    let requiredCount = 3;
    let files = fs.readdirSync('./public/' + req.params.id);
    
    while(requiredCount-- && files.length) {
      let length = files.length;
      let index = Math.floor(Math.random() * length);
      let result = files.splice(index, 1);
      return res.send({
        url: 'https://cdn.kairocafe.xyz/' + req.params.id + '/' + result
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

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  
  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb(new Error('Error: Only image are allowed!'));
  }
}