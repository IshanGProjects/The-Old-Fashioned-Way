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

const user = {
  Username: undefined,
  Email: undefined,
  Country: undefined,
  CurrencyBalance: undefined,
  TotalWins: undefined,
  TotalLosses: undefined,
};

const user2 = {
  Username: undefined,
  Email: undefined,
  Country: undefined,
  CurrencyBalance: undefined,
  TotalWins: undefined,
  TotalLosses: undefined,
}

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

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

//CHECK FOR DATABASE CONNECTION
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });



   // Authentication Middleware.
   const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to register page.
      res.redirect('/home');
    }
    next();
  };


//**this get redirects the main page to the register page for the purposes of testing the register page
app.get('/', (req, res) => {
  res.redirect('/home');
});

//REGISTER PAGE AND FORM USAGE
app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.get('/logout', (req, res) => {
  req.session.user = false;
  req.session.user2 = false;
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.render('pages/home');
});

app.get('/loginUser2', (req, res) => {
  res.render('pages/loginUser2');
})

app.get('/registerUser2', (req, res) => {
  res.render('pages/registerUser2');
})

app.get('/main', auth, (req, res) => {
  if(user2.Username == undefined) {
    res.render('pages/main',{
      Username: req.session.user.Username,
      Email: req.session.user.Email,
      Country: req.session.user.Country,
      CurrencyBalance: req.session.user.CurrencyBalance,
      TotalWins: req.session.user.TotalWins,
      TotalLosses: req.session.user.TotalLosses,
    });
  } else {
    res.render('pages/main',{
      Username: req.session.user.Username,
      Email: req.session.user.Email,
      Country: req.session.user.Country,
      CurrencyBalance: req.session.user.CurrencyBalance,
      TotalWins: req.session.user.TotalWins,
      TotalLosses: req.session.user.TotalLosses,

      Username2: req.session.user2.Username,
      Email2: req.session.user2.Email,
      Country2: req.session.user2.Country,
      CurrencyBalance2: req.session.user2.CurrencyBalance,
      TotalWins2: req.session.user2.TotalWins,
      TotalLosses2: req.session.user2.TotalLosses,
    });
  }
});

app.get('/profile', auth, (req, res) => {
  res.render('pages/profile', {
    Player1: req.session.user.Username,
    Username: req.session.user.Username,
    Email: req.session.user.Email,
    Country: req.session.user.Country,
    CurrencyBalance: req.session.user.CurrencyBalance,
    TotalWins: req.session.user.TotalWins,
    TotalLosses: req.session.user.TotalLosses,
  });
});

app.get('/profileUser2', auth, (req, res) => {
  res.render('pages/profile', {
    Player1: req.session.user.Username,
    Username: req.session.user2.Username,
    Email: req.session.user2.Email,
    Country: req.session.user2.Country,
    CurrencyBalance: req.session.user2.CurrencyBalance,
    TotalWins: req.session.user2.TotalWins,
    TotalLosses: req.session.user2.TotalLosses,
  });
});

app.get('/edit_name', auth, (req, res) => {
  res.render('pages/edit_name', {
    Player1: req.session.user.Username,
    Username: req.session.user.Username,
    Email: req.session.user.Email,
    Country: req.session.user.Country,
    CurrencyBalance: req.session.user.CurrencyBalance,
    TotalWins: req.session.user.TotalWins,
    TotalLosses: req.session.user.TotalLosses,
  });
});

app.get('/edit_name2', auth, (req, res) => {
  res.render('pages/edit_name', {
    Player1: req.session.user.Username,
    Username: req.session.user2.Username,
    Email: req.session.user2.Email,
    Country: req.session.user2.Country,
    CurrencyBalance: req.session.user2.CurrencyBalance,
    TotalWins: req.session.user2.TotalWins,
    TotalLosses: req.session.user2.TotalLosses,
  });
});

app.post('/edit_name', auth, (req, res) => {
  const newUsername = req.body.username;
  query = `UPDATE Users SET Username = '${newUsername}' WHERE Username = '${req.session.user.Username}'`

    db.any(query)
      .then(function () {
        req.session.user.Username = newUsername;

        res.render('pages/profile', {
          Player1: req.session.user.Username,
          Username: req.session.user.Username,
          Email: req.session.user.Email,
          Country: req.session.user.Country,
          CurrencyBalance: req.session.user.CurrencyBalance,
          TotalWins: req.session.user.TotalWins,
          TotalLosses: req.session.user.TotalLosses,
        });
      })
      .catch(function (err) {
        res.render('pages/profile',  {
          error: true,
          message: "Username already exists in the system, please try another username or login to your account",
          Player1: req.session.user.Username,
          Username: req.session.user.Username,
          Email: req.session.user.Email,
          Country: req.session.user.Country,
          CurrencyBalance: req.session.user.CurrencyBalance,
          TotalWins: req.session.user.TotalWins,
          TotalLosses: req.session.user.TotalLosses,
        });
        console.log(err);
      });
});

app.post('/edit_name2', auth, (req, res) => {
  const newUsername = req.body.username;
  query = `UPDATE Users SET Username = '${newUsername}' WHERE Username = '${req.session.user2.Username}'`

    db.any(query)
      .then(function () {
        req.session.user2.Username = newUsername;

        res.render('pages/profile', {
          Player1: req.session.user.Username,
          Username: req.session.user2.Username,
          Email: req.session.user2.Email,
          Country: req.session.user2.Country,
          CurrencyBalance: req.session.user2.CurrencyBalance,
          TotalWins: req.session.user2.TotalWins,
          TotalLosses: req.session.user2.TotalLosses,
        });
      })
      .catch(function (err) {
        res.render('pages/profile',  {
          error: true,
          message: "Username already exists in the system, please try another username or login to your account",
          Player1: req.session.user.Username,
          Username: req.session.user2.Username,
          Email: req.session.user2.Email,
          Country: req.session.user2.Country,
          CurrencyBalance: req.session.user2.CurrencyBalance,
          TotalWins: req.session.user2.TotalWins,
          TotalLosses: req.session.user2.TotalLosses,
        });
        console.log(err);
      });
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
        if(user.Username == undefined) {
          res.redirect('/home');
        } else {
          res.redirect('/main');
        }
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
  
  const query = `SELECT * FROM Users WHERE Users.Username = '${req.body.username}'`;
  
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
      const match = await bcrypt.compare(req.body.password, data.password);
      

      if(data == null){
          res.redirect("/register");
      }

      if(match == true){
        console.log(data);
        user.Username = data.username;
        user.Email = data.email;
        user.Country = data.country;
        user.CurrencyBalance = data.currencybalance;
        user.TotalWins = data.totalwins;
        user.TotalLosses = data.totallosses;
        
        req.session.user = user;
        req.session.save();

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

app.post("/loginUser2", (req, res) => {
  const query = `SELECT * FROM Users WHERE Users.Username = '${req.body.username}'`;
  
  if(req.body.username == ""){
    res.render('pages/loginUser2', {
      error: true,
      message: "Please type in a username to login.",
    });
  }

  if(req.body.username == req.session.user.Username){
    res.render('pages/loginUser2', {
      error: true,
      message: "This user is already logged in. Please login as a unique second player",
    });
  }

  else if(req.body.password == ""){
    res.render('pages/loginUser2', {
      error: true,
      message: "Please type in a password to login.",
    });
  }

  else{
    db.one(query)
    .then(async (data2) => {
      const match = await bcrypt.compare(req.body.password, data2.password);

      if(data2 == null){
          res.redirect("/register");
      }

      if(match == true){
        console.log(data2);
        user2.Username = data2.username;
        user2.Email = data2.email;
        user2.Country = data2.country;
        user2.CurrencyBalance = data2.currencybalance;
        user2.TotalWins = data2.totalwins;
        user2.TotalLosses = data2.totallosses;
        
        req.session.user2 = user2;
        req.session.save();

        res.redirect("/main");
      }
      if(match == false){
        res.render("pages/loginUser2", {
          error: true,
          message: "Incorrect Username or Password",
        });
          console.error("Incorrect username or password.");
      }
     
    })
    .catch((err) => {
      console.log(err);
      res.render("pages/loginUser2", {
        error: true,
        message: "Username is not in the System Please Register",
      });
    });
  }
});

//SERVER LISTENING TO CLIENT REQUESTS
app.listen(3000);
console.log('Server is listening on port 3000');