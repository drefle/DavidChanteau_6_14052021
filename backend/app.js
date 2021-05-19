const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const helmet = require('helmet');
const cookieSession = require('cookie-session');
require('dotenv').config();


const app = express();

app.use(helmet());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SES_KEY1, process.env.SES_KEY2],
  cookie: {
    httpOnly: true,
    maxAge: 900000,
    secure: true,
  }
}))


mongoose.connect(process.env.MONGODB_URL,
  { dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));



app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(mongoSanitize()); 

app.use('/images',express.static(path.join(__dirname,'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;