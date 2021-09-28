const express = require('express');
const helmet = require('helmet');
const app = express();
const key = require('./key');
const session = require('express-session');
const fileStore = require('session-file-store')(session);
const multer = require('multer');
const cors = require('cors');
const parseExcel = require('./excel-read');
const obj = require('./auth');

app.use(helmet());
app.post('*', express.urlencoded({ extended: false }));
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

app.use(session({
  secret: 'lifeistooshorttohesitate',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true },
  store: new fileStore({logFn: function() {}})
}));

app.use(cors());
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, '')
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname)
  }
});

const upload = multer({
  storage: storage,
  limits: {
    files: 3,
    fileSize: 20 * 1024 * 1024
  }
});

app.get('/', (req, res, next) => {
  const pugName = (req.session.isLogined) ? 'upload.pug' : 'login.pug';
  res.render(pugName, (err, html) => {
    if (err) throw err;
    res.status(200).send(html);
  });
});

app.post('/login-page', (req, res, next) => {
  if (req.body.id === obj.id && req.body.pwd === obj.pwd) {
    req.session.isLogined = true;
  }
  res.redirect(302, '/');
});

app.route('/upload-page').post(upload.array('excel', 1), (req, res, next) => {
  try {
    parseExcel();
    res.render('main.pug', { key }, (err, html) => {
      if (err) throw err;
      res.status(200).send(html);
    });
  } catch (err) {
    console.dir(err.stack);
  }
});

app.get('/upload', (req, res, next) => {
  if (!req.session.isLogined) {
    res.redirect(302, '/login');
  } else {
    res.render('upload.pug', { key }, (err, html) => {
      if (err) throw err;
      res.status(200).send(html);
    });
  }
});

app.get('*', (req, res, next) => {
  res.redirect(302, '/');
});

app.get((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something broke!');
})

app.listen(5001, () => console.log('node on 5001'));
