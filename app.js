const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rimraf = require('rimraf');
const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})

app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/assets/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/images', express.static('private'));

fs.readdir('./uploads', function(err, files) {
  files.forEach(function(file, index) {
    fs.stat(path.join('./uploads', file), function(err, stat) {
      var endTime, now;
      if (err) {
        return console.error(err);
      }
      now = new Date().getTime();
      endTime = new Date(stat.ctime).getTime() + 5000;
      if (now > endTime) {
        return rimraf(path.join('./uploads', file), function(err) {
          if (err) {
            return console.error(err);
          }
        });
      }
    });
  });
	console.log('Uploaded image deleted')
});

// Neko

let nekoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, './public/neko')
		cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    // let files = fs.readdirSync('./public/neko');
		// cb(null, 'neko_' + ++files.length + path.extname(file.originalname))
    cb(null, file.originalname)
  }
})
let nekoUpload = multer({ storage: nekoStorage })

// ------------------------------------------------------------------------------

// Baka

let bakaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, './public/baka')
		cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    // let files = fs.readdirSync('./public/baka');
    // cb(null, 'baka_' + ++files.length + path.extname(file.originalname))
		cb(null, file.originalname)
  }
})
let bakaUpload = multer({ storage: bakaStorage })

// ------------------------------------------------------------------------------

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/login', (req, res) => {
	res.render('login');
})

app.post('/login', async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username }).lean();

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		const TOKEN = jwt.sign({
			id: user._id,
			username: user.username
		}, process.env.JWT_SECRET)
		return res.json({ status: 'ok', data: TOKEN })
	}
	res.json({ status: 'error', error: 'Invalid username/password' })
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

app.get('/upload', (req, res) => {
  res.render('uploadList');
})

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
	let files = fs.readdirSync('./public/neko');
	let compressedImage = path.join('./public/neko/neko_' + ++files.length + '.jpg')
	sharp(req.file.path).jpeg({
		quality: 80,
		chromaSubsampling: '4:4:4'
	}).toFile(compressedImage)
})

app.post('/upload/baka', bakaUpload.single('upload'), (req, res) => {
  res.render('upload', {
    id: 'baka'
  });
	let files = fs.readdirSync('./public/baka');
	let compressedImage = path.join('./public/baka/baka_' + ++files.length + '.jpg')
	sharp(req.file.path).jpeg({
		quality: 80,
		chromaSubsampling: '4:4:4'
	}).toFile(compressedImage)
})

app.get('/status', (req, res) => {
	res.redirect('https://stats.uptimerobot.com/5A5GGUMMZK');
})

app.all('*', function (req, res, next) {
  res.status(404).render('404');
})

app.listen(PORT, () => {
  console.log('Express is running on PORT: ', PORT);
})