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
  ImageURL: undefined
};

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

   // Authentication Middleware.
   const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to register page.
      return res.redirect('/home');
    }
    next();
  };

app.get('/placeBet', auth, (req, res) => {
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
    ImageURL: req.session.user.ImageURL,
    
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
    ImageURL: req.session.user2.ImageURL,
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
    ImageURL: req.session.user.ImageURL,
    
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
    ImageURL: req.session.user2.ImageURL,
  });
});

// LeaderBoard Get 
app.post('/leaderboard', auth, async (req, res) => {
  const input = req.body.filter;
  if (input == 1) {
    const query = 'SELECT ROW_NUMBER() OVER(ORDER BY CurrencyBalance DESC) AS Row, Username, Country, CurrencyBalance, ImageUrl FROM Users ORDER BY CurrencyBalance DESC LIMIT 10;';
    db.any(query)
    .then((data) => {
      console.log(data);
      res.render("pages/leaderboard", {
        FILTER: req.body.filter,
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
    const query = 'SELECT ROW_NUMBER() OVER(ORDER BY TotalWins DESC) AS Row, Username, Country, TotalWins, ImageUrl FROM Users ORDER BY TotalWins DESC LIMIT 10;';
    db.any(query)
  
    .then((data) => {
      console.log(data);
      res.render("pages/leaderboard", {
        FILTER: req.body.filter,
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
});

//Get Request for Game
app.get('/game', auth, (req,res) =>{
  res.render('gameData/jsPong/index');
});

app.get("/betConfirm", auth, (req,res) =>{
  res.render('/pages/betConfirm');
});

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
          ImageURL: req.session.user.ImageURL,
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
          ImageURL: req.session.user.ImageURL,
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
          ImageURL: req.session.user2.ImageURL,
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
          ImageURL: req.session.user2.ImageURL,
        });
        console.log(err);
      });
});

app.post('/editImageProfile1',auth, (req, res) => {
  const newImageURL = req.body.imageURL;

  console.log(req.body.imageURL);

  query = `UPDATE Users SET ImageUrl = '${newImageURL}' WHERE Username = '${req.session.user.Username}'`


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

app.post('/editImageProfile2',auth, (req, res) => {
  const newImageURL = req.body.imageURL;

  console.log(req.body.imageURL);

  query = `UPDATE Users SET ImageUrl = '${newImageURL}' WHERE Username = '${req.session.user2.Username}'`


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
    query = `INSERT INTO Users (Email, Username, Country, Password, CurrencyBalance, TotalWins, TotalLosses, ImageUrl) VALUES ('${email}', '${username}', '${country}', '${hash}', 100, 0, 0, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKn1n4QbBse5CRtGYgdHj0fZN0WepAYgr8cQ&usqp=CAU');`;

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
        user.ImageURL = data.imageurl
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
        user2.ImageURL = data2.imageurl
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



// PlaceBet Post 
app.post("/placeBet", auth, (req, res) =>{
  //console.log(req.body.p2Bf);
  //console.log(req.body.p1Bf);

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
      message: "Please type in a bet.",
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

//SERVER LISTENING TO CLIENT REQUESTS
app.listen(3000);
console.log('Server is listening on port 3000');