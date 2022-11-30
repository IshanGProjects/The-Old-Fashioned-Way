//IMPORTING THE DEPENDENCIES
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const axios = require('axios');


//DEFINING THE EXPRESS APP
const app = express();

app.use(express.static(path.join(__dirname, 'resources')));
//USING bodyParser TO PARSE JSON IN THE REQUEST BODY INTO JS ONJECTS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "/views"))
// app.set('views', __dirname + '/views')
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//Create a const user that will store our user 1 variables
const user = {
  Username: undefined,
  Email: undefined,
  Country: undefined,
  CurrencyBalance: undefined,
  TotalWins: undefined,
  TotalLosses: undefined,
  ImageURL: undefined
};
//Create a const user2 that will store our user 2 variables
const user2 = {
  Username: undefined,
  Email: undefined,
  Country: undefined,
  CurrencyBalance: undefined,
  TotalWins: undefined,
  TotalLosses: undefined,
  ImageURL: undefined
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




//**this get redirects the main page to the register page for the purposes of testing the register page
app.get('/', (req, res) => {
  res.redirect('/home');
});

//REGISTER PAGE AND FORM USAGE
app.get('/register', (req, res) => {
  res.render('pages/register');
});
//GET Login Page
app.get('/login', (req, res) => {
  res.render('pages/login');
});

//GET Logout should destory sesion and restart out user values
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/home');
});
//GET Home Page
app.get('/home', (req, res) => {
  res.render('pages/home');
});
//GET Login User 2 page
app.get('/loginUser2', (req, res) => {
  res.render('pages/loginUser2');
})
//GET Register User 2 Page
app.get('/registerUser2', (req, res) => {
  res.render('pages/registerUser2');
})

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to register page.
    return res.redirect('/home');
  }
    next();
  };
//GET Place Bet Page
app.get('/placeBet', auth, async(req, res) => {
  const query_user1 = `SELECT * FROM Users WHERE Users.Username = '${req.session.user.Username}'`;
  const query_user2 = `SELECT * FROM Users WHERE Users.Username = '${req.session.user2.Username}'`;

  await db.one(query_user1)
    .then( async (data) => {
        user.Username = data.username;
        user.Email = data.email;
        user.Country = data.country;
        user.CurrencyBalance = data.currencybalance;
        user.TotalWins = data.totalwins;
        user.TotalLosses = data.totallosses;
        user.ImageURL = data.imageurl;
        req.session.user = user;
    });

    await db.one(query_user2)
    .then( async (data2) => {
      user2.Username = data2.username;
      user2.Email = data2.email;
      user2.Country = data2.country;
      user2.CurrencyBalance = data2.currencybalance;
      user2.TotalWins = data2.totalwins;
      user2.TotalLosses = data2.totallosses;
      user2.ImageURL = data2.imageurl;
      req.session.user2 = user2;
    });


    req.session.save();

    
    res.render('pages/placeBet',{
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

   
});
//GET Main Page
app.get('/main', auth, (req, res) => {
 
  if(req.session.user2 == undefined || req.session.user2.Username == undefined) {
   
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
//GET Profile Page
app.get('/profile', auth, (req, res) => {
  res.render('pages/profile', {
    Player1: req.session.user.Username,
    Username: req.session.user.Username,
    Email: req.session.user.Email,
    Country: req.session.user.Country,
    CurrencyBalance: req.session.user.CurrencyBalance,
    TotalWins: req.session.user.TotalWins,
    TotalLosses: req.session.user.TotalLosses,
    ImageURL: req.session.user.ImageURL,
    
  });
});
//GET User 2 Profile Page
app.get('/profileUser2', auth, (req, res) => {
  res.render('pages/profile', {
    Player1: req.session.user.Username,
    Username: req.session.user2.Username,
    Email: req.session.user2.Email,
    Country: req.session.user2.Country,
    CurrencyBalance: req.session.user2.CurrencyBalance,
    TotalWins: req.session.user2.TotalWins,
    TotalLosses: req.session.user2.TotalLosses,
    ImageURL: req.session.user2.ImageURL,
  });
});

//Get Request for Game
app.get('/game', auth, (req,res) =>{
  res.render('gameData/jsPong/index', {
    Username: req.session.user.Username,
    Email: req.session.user.Email,
    Country: req.session.user.Country,
    CurrencyBalance: req.session.user.CurrencyBalance,
    TotalWins: req.session.user.TotalWins,
    TotalLosses: req.session.user.TotalLosses,
    ImageURL: req.session.user.ImageURL,

    Username2: req.session.user2.Username,
    Email2: req.session.user2.Email,
    Country2: req.session.user2.Country,
    CurrencyBalance2: req.session.user2.CurrencyBalance,
    TotalWins2: req.session.user2.TotalWins,
    TotalLosses2: req.session.user2.TotalLosses,
    ImageURL2: req.session.user2.ImageURL,
  });
});

//Winner EJS PAGE
app.get('/winner', auth, (req,res) =>{
  if(req.query.winner == 0){
    res.render('pages/winner', {
      username: req.session.user.Username,
    });
  } else {
    res.render('pages/winner', {
      username: req.session.user2.Username,
    });
  }
});

app.get("/betConfirm", auth, (req,res) =>{
  res.render('/pages/betConfirm');
});
//GET Change Profile Image Page for User 1
app.get("/changeUrl", auth, (req,res) =>{
  res.render('pages/editProfileUrl',{
    Player1: req.session.user.Username,
    Username: req.session.user.Username,
    Email: req.session.user.Email,
    Country: req.session.user.Country,
    CurrencyBalance: req.session.user.CurrencyBalance,
    TotalWins: req.session.user.TotalWins,
    TotalLosses: req.session.user.TotalLosses,
    ImageURL: req.session.user.ImageURL,
  });
});
//GET Change Profile Image for User 2
app.get("/changeUrl2", auth, (req,res) =>{
  res.render('pages/editProfileUrl',{
    Player1: req.session.user.Username,
    Username: req.session.user2.Username,
    Email: req.session.user2.Email,
    Country: req.session.user2.Country,
    CurrencyBalance: req.session.user2.CurrencyBalance,
    TotalWins: req.session.user2.TotalWins,
    TotalLosses: req.session.user2.TotalLosses,
    ImageURL: req.session.user2.ImageURL,
  });
});

//POST LeaderBoard Page
app.post('/leaderboard', auth, async (req, res) => {
  const input = req.body.filter;
  if(req.session.user2 == undefined || req.session.user2.Username == undefined) {
    if (input == 1) {
      const query = 'SELECT ROW_NUMBER() OVER(ORDER BY CurrencyBalance DESC) AS Row, Username, Country, CurrencyBalance, ImageUrl FROM Users ORDER BY CurrencyBalance DESC;';
      db.any(query)
      .then((data) => {
       
        res.render("pages/leaderboard", {
          FILTER: req.body.filter,
          user1: req.session.user.Username,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("pages/main", {
          error: true,
          message: "Data is retrieved incorrectly",
        });
      });  
    } else {
      const query = 'SELECT ROW_NUMBER() OVER(ORDER BY TotalWins DESC) AS Row, Username, Country, TotalWins, ImageUrl FROM Users ORDER BY TotalWins DESC;';
      db.any(query)
      .then((data) => {
       
        res.render("pages/leaderboard", {
          FILTER: req.body.filter,
          user1: req.session.user.Username,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("pages/main", {
          error: true,
          message: "Data is retrieved incorrectly",
        });
      }); 
    }
  } else {
    if (input == 1) {
      const query = 'SELECT ROW_NUMBER() OVER(ORDER BY CurrencyBalance DESC) AS Row, Username, Country, CurrencyBalance, ImageUrl FROM Users ORDER BY CurrencyBalance DESC;';
      db.any(query)
      .then((data) => {
       
        res.render("pages/leaderboard", {
          FILTER: req.body.filter,
          user1: req.session.user.Username,
          user2: req.session.user2.Username,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("pages/main", {
          error: true,
          message: "Data is retrieved incorrectly",
        });
      });  
    } else {
      const query = 'SELECT ROW_NUMBER() OVER(ORDER BY TotalWins DESC) AS Row, Username, Country, TotalWins, ImageUrl FROM Users ORDER BY TotalWins DESC;';
      db.any(query)
      .then((data) => {
       
        res.render("pages/leaderboard", {
          FILTER: req.body.filter,
          user1: req.session.user.Username,
          user2: req.session.user2.Username,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("pages/main", {
          error: true,
          message: "Data is retrieved incorrectly",
        });
      }); 
    }
  }
});

//POST edit profile image for User 1
app.post('/editImageProfile1',auth, (req, res) => {
  const newImageURL = req.body.imageURL;

 

  query = `UPDATE Users SET ImageUrl = '${newImageURL}' WHERE Username = '${req.session.user.Username}'`;


  db.any(query)
  .then(function () {
    req.session.user.ImageURL = newImageURL;

    res.render('pages/profile', {
      Player1: req.session.user.Username,
      Username: req.session.user.Username,
      Email: req.session.user.Email,
      Country: req.session.user.Country,
      CurrencyBalance: req.session.user.CurrencyBalance,
      TotalWins: req.session.user.TotalWins,
      TotalLosses: req.session.user.TotalLosses,
      ImageURL: req.session.user.ImageURL,
    });
  })
  .catch(function (err) {
    res.render('pages/profile',  {
      error: true,
      message: "ERROR WITH URL",
      Player1: req.session.user.Username,
      Username: req.session.user.Username,
      Email: req.session.user.Email,
      Country: req.session.user.Country,
      CurrencyBalance: req.session.user.CurrencyBalance,
      TotalWins: req.session.user.TotalWins,
      TotalLosses: req.session.user.TotalLosses,
      ImageURL: req.session.user.ImageURL,
    });
    console.log(err);
  });

});
//Post Edit Image For Profile 2:
app.post('/editImageProfile2',auth, (req, res) => {
  const newImageURL = req.body.imageURL;

 

  query = `UPDATE Users SET ImageUrl = '${newImageURL}' WHERE Username = '${req.session.user2.Username}'`;


  db.any(query)
  .then(function () {
    req.session.user2.ImageURL = newImageURL;

    res.render('pages/profile', {
      Player1: req.session.user.Username,
      Username: req.session.user2.Username,
      Email: req.session.user2.Email,
      Country: req.session.user2.Country,
      CurrencyBalance: req.session.user2.CurrencyBalance,
      TotalWins: req.session.user2.TotalWins,
      TotalLosses: req.session.user2.TotalLosses,
      ImageURL: req.session.user2.ImageURL,
    });
  })
  .catch(function (err) {
    res.render('pages/profile',  {
      error: true,
      message: "ERROR WITH URL",
      Player1: req.session.user.Username,
      Username: req.session.user2.Username,
      Email: req.session.user2.Email,
      Country: req.session.user2.Country,
      CurrencyBalance: req.session.user2.CurrencyBalance,
      TotalWins: req.session.user2.TotalWins,
      TotalLosses: req.session.user2.TotalLosses,
      ImageURL: req.session.user2.ImageURL,
    });
    console.log(err);
  });

});
//POST Register User In Database
app.post('/register', async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const country = req.body.country;
  const hash = await bcrypt.hash(req.body.password, 10);
 

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
    query = `INSERT INTO Users (Email, Username, Country, Password, CurrencyBalance, TotalWins, TotalLosses, ImageUrl) VALUES ('${email}', '${username}', '${country}', '${hash}', 100, 0, 0, 'images/default.png');`;

    db.any(query)
      .then(function () {
        if(req.session.user == undefined || req.session.user.Username == undefined) {
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
//Post Profile So It Updates As A user wins or losses or gets or loesses coins
app.post('/profile', auth, async (req, res) => {
  const query = `SELECT * FROM Users WHERE Users.Username = '${req.session.user.Username}'`;
  db.one(query)
    .then( async (data) => {
        user.Username = data.username;
        user.Email = data.email;
        user.Country = data.country;
        user.CurrencyBalance = data.currencybalance;
        user.TotalWins = data.totalwins;
        user.TotalLosses = data.totallosses;
        user.ImageURL = data.imageurl;
        req.session.user = user;
        req.session.save();
        res.redirect('/profile');
    })
});

//Post Profile So It Updates As A user wins or losses or gets or loesses coins
app.post('/profileUser2', auth, async (req, res) => {
  const query = `SELECT * FROM Users WHERE Username = '${req.session.user2.Username}'`;
  db.one(query)
    .then( async (data2) => {
        user2.Username = data2.username;
        user2.Email = data2.email;
        user2.Country = data2.country;
        user2.CurrencyBalance = data2.currencybalance;
        user2.TotalWins = data2.totalwins;
        user2.TotalLosses = data2.totallosses;
        user2.ImageURL = data2.imageurl;
        req.session.user2 = user2;
        req.session.save();
        res.redirect('/profileUser2');
    })
});

//POST Login
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
       
        user.Username = data.username;
        user.Email = data.email;
        user.Country = data.country;
        user.CurrencyBalance = data.currencybalance;
        user.TotalWins = data.totalwins;
        user.TotalLosses = data.totallosses;
        user.ImageURL = data.imageurl;

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
//POST Loginin User 2
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
       
        user2.Username = data2.username;
        user2.Email = data2.email;
        user2.Country = data2.country;
        user2.CurrencyBalance = data2.currencybalance;
        user2.TotalWins = data2.totalwins;
        user2.TotalLosses = data2.totallosses;
        user2.ImageURL = data2.imageurl;
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



//POST PlaceBet checks to see if its a valid bet
app.post("/placeBet", auth, (req, res) =>{
  player1Balance = req.body.p1Bf;
  player2Balance = req.body.p2Bf;

  wager = req.body.balanceInput;
  if(Number(wager) == 0 ){
    res.render("pages/placeBet", {
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
      error: true,
      message: "Please type in a bet that isn't 0.",
    });

  }

  else if(Number(wager) < 0 ){
    res.render("pages/placeBet", {
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
      error: true,
      message: "Please type in a bet that is not negative.",
    });

  }

  else if(player1Balance < 0){
    res.render("pages/placeBet", {
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
      error: true,
      message: "Player 2 Please Put A Bet That Player 1 Can Afford.",
    });
  }
  else if(player2Balance < 0){
    res.render("pages/placeBet", {
      // user: req.session.user,
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
      error: true,
      message: "Player 1 Please Put A Bet That Player 2 can Afford.",
    });
  }
  else if(player2Balance < 0 && player1Balance < 0) {
    res.render("pages/placeBet", {
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
      error: true,
      message: "Both Player 1 and Player 2 Cannot Afford This Bet, Choose a Bet that Is Sufficient For Both Players.",
    });
  }
  else{
    res.render("pages/betConfirm", {
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

      player1Balance: req.body.p1Bf,
      player2Balance: req.body.p2Bf,
      wager : req.body.balanceInput
    });



  }



});
//POST Confirm Bet, take the bet and updates database
app.post("/confirmPlaceBet", auth, async(req, res) =>{
  wagerPlace = wager *2;
  
  MatchTablequery = `INSERT INTO Matches(MatchCaption,Victor,Wager) VALUES ('${req.body.matchCaption}', 'NoOne', '${wagerPlace }');`;
  UpdateUser1Query = `UPDATE Users SET CurrencyBalance = CurrencyBalance - '${wager}' WHERE Username = '${req.session.user.Username}'`;
  UpdateUser2Query = `UPDATE Users SET CurrencyBalance = CurrencyBalance - '${wager}' WHERE Username = '${req.session.user2.Username}'`;

  Add_Match_To_User_Table_Query = `INSERT INTO Users_To_Matches(Username,MatchID) VALUES ('${req.session.user.Username}', (SELECT MAX(MatchID) FROM Matches))`;
  Add_Match_To_User2_Table_Query = `INSERT INTO Users_To_Matches(Username,MatchID) VALUES ('${req.session.user2.Username}', (SELECT MAX(MatchID) FROM Matches))`;
  //query = `UPDATE Users SET Username = '${newUsername}' WHERE Username = '${req.session.user.Username}'`
  //query = `INSERT INTO Users (Email, Username, Country, Password, CurrencyBalance, TotalWins, TotalLosses) VALUES ('${email}', '${username}', '${country}', '${hash}', 100, 0, 0);`;

  if(req.body.matchCaption == ""){
    res.render("pages/betConfirm", {
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

      player1Balance: req.body.p1Bf,
      player2Balance: req.body.p2Bf,
      error: true,
      message: "Please Type In A Match Caption On Why You Are Betting.",
    });
  }

  else{
    await db.query(UpdateUser1Query);
    await db.query(UpdateUser2Query);

    await db.query(MatchTablequery);
    await db.query(Add_Match_To_User_Table_Query);

    db.any(Add_Match_To_User2_Table_Query)
      .then(function () {
        res.redirect('/game');
      })
      .catch(function (err) {

        res.render('pages/betConfirm',  {
          error: true,
          message: err,
        });
        console.log(err);
      });



  }

});


// Recieving and testing to see if i have that value for the win
app.post("/checkWinner",  async(req, res) =>{

  const {winner} = req.body;
 
  // console.log(winner)
  // console.log(req.session.user.Username);
  // console.log(req.session.user2.Username);

  // MatchTablequery = `INSERT INTO Matches(MatchCaption,Victor,Wager) VALUES ('${req.body.matchCaption}', 'NoOne', '${wagerPlace }');`;
  // UpdateUser1Query = `UPDATE Users SET CurrencyBalance = CurrencyBalance - '${wager}' WHERE Username = '${req.session.user.Username};'`;
  // UpdateUser2Query = `UPDATE Users SET CurrencyBalance = CurrencyBalance - '${wager}' WHERE Username = '${req.session.user2.Username};'`;

  if(winner === 0){
   
    //Setting Current Balance if player1 wins
    updateUserCurr = `
    UPDATE USERS SET CurrencyBalance = CurrencyBalance + ${wager * 2} 
    WHERE USERS.username = '${req.session.user.Username}';`
    //Setting the Victor of the Match
    setVictor = `
    UPDATE Matches SET victor = '${req.session.user.Username}'
    WHERE MatchID = (Select MAX(MatchID) 
    FROM Users_To_Matches);`
    //Update wins for player 1 and losses for player 2
    updateStats = `
    UPDATE Users SET TotalWins = TotalWins + 1
    WHERE Username = '${req.session.user.Username}';`

    updateStats2 = `UPDATE Users SET TotalLosses = TotalLosses + 1 
    WHERE Username = '${req.session.user2.Username}';`


    

  }

  else if(winner === 1){
    //Setting Current Balance if player2 wins
    updateUserCurr = ` 
    UPDATE USERS SET CurrencyBalance = CurrencyBalance + ${wager * 2} 
    WHERE USERS.username = '${req.session.user2.Username}';`
    //Setting the Victor of the Match
    setVictor = `
    UPDATE Matches SET victor = '${req.session.user2.Username}'
    WHERE MatchID = (Select MAX(MatchID) 
    FROM Users_To_Matches);`
    //Update wins for player 2 and losses for player 1
    updateStats = `
    UPDATE Users SET TotalWins = TotalWins + 1
    WHERE Username = '${req.session.user2.Username}';`

    updateStats2 = `UPDATE Users SET TotalLosses = TotalLosses + 1 
    WHERE Username = '${req.session.user.Username}';`

    
  }

 
 
  
  await db.query(updateUserCurr);
  await db.query(setVictor);
  await db.query(updateStats);
  // await db.query(updateStats2);

  await db.any(updateStats2)
    .then(function () {
      res.status(200).send();
     
    })
    .catch(function (err) {
      res.status(500).send();
      console.log(err);
    });
});

//SERVER LISTENING TO CLIENT REQUESTS
app.get('/*', (req, res) => {
  res.redirect('/main')
});


app.listen(3000);
console.log('Server is listening on port 3000')