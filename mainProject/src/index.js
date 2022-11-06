//IMPORTING THE DEPENDENCIES
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
path = require('path');
const bcrypt = require('bcrypt');
const axios = require('axios');

//DEFINING THE EXPRESS APP
const app = express();

app.use(express.static('resources'));
//USING bodyParser TO PARSE JSON IN THE REQUEST BODY INTO JS ONJECTS
app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views')
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

//**this get redirects the main page to the register page for the purposes of testing the register page
app.get('/', (req, res) => {
  res.redirect('/home');
});


//REGISTER PAGE AND FORM USAGE
app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.get('/home', (req, res) => {
  res.render('pages/home');
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.get('/main', (req, res) => {
  res.render('pages/main');
});

app.get('/profile', (req, res) => {
  res.render('pages/profile');
});

app.get('/edit_name', (req, res) => {
  res.render('pages/edit_name');
});

app.post('/edit_name', async (req, res) => {
  // const username = req.body.username;
  // query = `SELECT Users.Username FROM Users WHERE Users.Username = '${req.body.username}'`
  // console.log(req.body);

  //   db.any(query)
  //     .then(function () {
  //       res.redirect('/profile');
  //     })
  //     .catch(function (err) {
  //       res.render('pages/profile',  {
  //         error: true,
  //         message: "Username already exists in the system, please login or try another username",
  //       });
  //       console.log(err);
  //     });
  res.redirect('/profile');
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
        res.redirect('/home');
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


app.post("/login", (req, res) => {
  
  const query = `SELECT Users.Password FROM Users WHERE Users.Username = '${req.body.username}'`;
  
  if(req.body.username == ""){
    res.render('pages/login', {
      error: true,
      message: "Please type in a username to login.",
    });
  }

  else if(req.body.password == ""){
    res.render('pages/login', {
      error: true,
      message: "Please type in a password to login.",
    });
  }

  else{
    db.one(query)
    .then( async (data) => {
      console.log(data.password);
      const match = await bcrypt.compare(req.body.password, data.password);
      

      if(data == null){
          res.redirect("/register");
      }

      if(match == true){
            res.redirect("/main");


      }
      if(match == false){
        res.render("pages/login", {
          error: true,
          message: "Incorrect Username or Password",
        });
          console.error("Incorrect username or password.");
      }
     
    })
    .catch((err) => {
      console.log(err);
      res.render("pages/login", {
        error: true,
        message: "Username is not in the System Please Register",
      });
    });
  }
  
});



//SERVER LISTENING TO CLIENT REQUESTS
app.listen(3000);
console.log('Server is listening on port 3000');