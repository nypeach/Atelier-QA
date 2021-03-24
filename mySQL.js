// Setting up the Connection //===========================================

const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'qanda'
});

// Note mySQL user = 'cowlistuser' password = 'cowlist'

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to MySQL!')
  }
});

module.exports = db;