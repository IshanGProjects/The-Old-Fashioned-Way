//IMPORTING THE DEPENDENCIES
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');

//DEFINING THE EXPRESS APP
const app = express();

//USING bodyParser TO PARSE JSON IN THE REQUEST BODY INTO JS ONJECTS
app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//DATABASE CONFIGURATION FOR LOCAL ENVIROMENT
const pgp = require('pg-promise')();
require('dotenv').config();
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

//CHECK FOR DATABASE CONNECTION
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

//THIS GET WILL BE CHANGED
app.get('/', (req, res) => {
  res.redirect('/register');
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.post('/register', async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const country = req.body.country;
  const hash = await bcrypt.hash(req.body.password, 10);
  console.log(req.body);

  if(req.body.email == "") {
    res.render('pages/register', {
      error: true,
      message: "Please type in a email to create an account.",
    });
  } else if(req.body.username == "") {
    res.render('pages/register', {
      error: true,
      message: "Please type in a username to create an account.",
    });
  } else if(req.body.country == "") {
    res.render('pages/register', {
      error: true,
      message: "Please type in a country to create an account.",
    });
  } else if(req.body.password == "") {
    res.render('pages/register', {
      error: true,
      message: "Please type in a password to create an account.",
    });
  } else {
    query = `INSERT INTO Users (Email, Username, Country, Password, CurrencyBalance, TotalWins, TotalLosses) VALUES ('${email}', '${username}', '${country}', '${hash}', 100, 0, 0);`;

    db.any(query)
      .then(function () {
        res.render('pages/home', {
          error: false,
          message: `Successfully registered user "${req.body.username}"`,
        })
      })
      .catch(function (err) {
        res.render('pages/register',  {
          error: true,
          message: "Username already exists in the system, please login or try another username",
        });
        console.log(err);
      });
  }
});

//SERVER LISTENING TO CLIENT REQUESTS
app.listen(3000);
console.log('Server is listening on port 3000');