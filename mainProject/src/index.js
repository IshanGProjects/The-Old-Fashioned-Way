//IMPORTING THE DEPENDENCIES
const express = require('express');
const bodyParser = require('body-parser');
const { request } = require('express');
const json = require('body-parser/lib/types/json');

//DEFINING THE EXPRESS APP
const app = express();

//USING bodyParser TO PARSE JSON IN THE REQUEST BODY INTO JS ONJECTS
app.set('view engine', 'ejs');
app.use(bodyParser.json());



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

db.connect()
.then(obj => {
  console.log('Database connection successful'); // you can view this message in the docker compose logs
  obj.done(); // success, release the connection;
})
.catch(error => {
  console.log('ERROR:', error.message || error);
});