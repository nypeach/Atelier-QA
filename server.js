//================================================================================================================
// SETUPS
//================================================================================================================

// IMPORTS //=================================================================================
const express = require('express');
const path = require('path');
var MongoClient = require('mongodb').MongoClient;

// MIDDLEWARE //==============================================================================
let app = express();
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({ extended: true }));

// DATABASE SETUP //==========================================================================
var url = "mongodb://localhost/qanda";
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
  if (err) {
    console.log('ERROR ======>', err);
  }
  var dbo = db.db("qanda");

// SERVER PORT AND LISTENING SETUP //=========================================================

const port = 3000; // use whatever port
app.listen(port, () => {
  console.log(`To get started, visit: http://localhost:${port}`);
});


//================================================================================================================
// ROUTES
//================================================================================================================

// LIST QUESTIONS //==========================================================================

// Parameters
  // product_id: integer, Specifies the product for which to retrieve questions.
  // page: integer, Selects the page of results to return.Default 1.
  // count: integer, Specifies how many results per page to return.Default 5.
// Response Status: 200 OK

app.get('/qa/questions', (req, res) => {
  db.read() // see what mongo has
});

// LIST ANSWERS //============================================================================

// Parameters
  // question_id: integer, Required ID of the question for wich answers are needed

// Query Parameters
    // page: integer, Selects the page of results to return.Default 1.
    // count:	integer, Specifies how many results per page to return.Default 5

// Response Status: 200 OK
// Next part is ...

app.get('/qa/questions/1234567/answers', (req, res) => {
  db.someFunc(para)
});

// ADD A QUESTIONS //=========================================================================

// Body Parameters
  // body: text, Text of question being asked
  // name: text, Username for question asker
  // email: text, Email address for question asker
  // product_id: integer, Required ID of the Product for which the question is posted

// Response Status: 201 CREATED

app.post('/qa/questions', (req, res) => {
  db.someFunc()
});

// ADD AN ANSWER //===========================================================================

// Parameters
  // question_id: integer, Required ID of the question to post the answer for

// Body Parameters
  // body: text, Text of question being answered
  // name: text, Username for question answerer
  // email: text, Email address for question answerer
  // photos: [text], An array of urls corresponding to images to display

// Response Status: 201 CREATED

  app.post('/qa/questions/123456/answers', (req, res) => {
  db.someFunc()
});

// MARK QUESTION AS HELPFUL //================================================================

// Parameters
  // question_id: integer, Required ID of the question to update

// Response Status: 204 NO CONTENT

  app.put('/qa/questions/1234567/helpful', (req, res) => {
  db.someFunc()
  });

// REPORT QUESTION //=========================================================================

// Parameters
  // question_id: integer, Required ID of the question to update

// Response Status: 204 NO CONTENT

  app.put('/qa/questions/1234567/report', (req, res) => {
  db.someFunc()
});

// MARK ANSWER AS HELPFUL //================================================================

// Parameters
  // question_id: integer, Required ID of the answer to update

// Response Status: 204 NO CONTENT

  app.put('/qa/answers/123456/helpful', (req, res) => {
  db.someFunc()
});

// REPORT QUESTION //=========================================================================

// Parameters
  // question_id: integer, Required ID of the answer to update

// Response Status: 204 NO CONTENT
  app.put('/qa/answers/123456/report', (req, res) => {
  db.someFunc()
});

