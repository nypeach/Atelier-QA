//================================================================================================================
// SETUPS
//================================================================================================================

// IMPORTS //=================================================================================
const express = require('express');
const path = require('path');
// MIDDLEWARE //==============================================================================
let app = express();
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// DATABASE SETUP //==========================================================================
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost/qanda";

// SERVER PORT AND LISTENING SETUP //=========================================================

const port = 3000; // use whatever port
app.listen(port, () => {
  console.log(`To get started, visit: http://localhost:${port}`);
});

//================================================================================================================
// ROUTES
//================================================================================================================

// DATABASE CONNECT BEGIN //==================================================================
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to quanda')
    const db = client.db("qanda");

  // LIST QUESTIONS //==============================================================
    // db.query(use this for mySQL queries)
    app.get('/qa/questions', (req, res) => {
      let pid = Number(req.query.product_id);
      let count = Number(req.query.count) || 5;
      let page = Number(req.query.page) || 0;
      db.collection('products').find({ _id: pid }).toArray()
        .then(results => {
          if (results.length === 0) {
            throw new Error('No Product Found')
          } else {
            db.collection('questions').find({ product_id: pid }).skip(page * count).limit(count).toArray()
              .then(results => {
                res.status(200).json({product_id: pid, results})
              })
              .catch(error => console.error(error))
          }
        })
        .catch(error => res.status(404).send(`${error}`))
    })

  // LIST ANSWERS //==================================================================

  app.get('/qa/questions/:question_id/answers', (req, res) => {
    let qid = Number(req.params.question_id);
    let count = Number(req.query.count) || 5;
    let page = Number(req.query.page) || 0;
    db.collection('answers').find({ question_id: qid }).toArray()
      .then(results => {
        if (results.length === 0) {
          throw new Error('No Question Found')
        } else {
          db.collection('answers').find({ question_id: qid }).skip(page * count).limit(count).toArray()
            .then(results => {
             res.status(200).json({ question_id: qid, page: page, count: count, results })
            })
            .catch(error => console.error(error))
        }
      })
      .catch(error => res.status(404).send(`${error}`))
  });

  // ADD A QUESTIONS //===============================================================
  app.post('/qa/questions', (req, res) => {
    let pid = Number(req.body.product_id);
    db.collection('products').find({ _id: pid }).toArray()
      .then(results => {
        if (results.length === 0) {
          throw new Error('No Product Found')
        } else {
          db.collection('questions').find().sort({ _id: -1 }).limit(1).toArray()
            .then(results => {
              console.log(results[0]._id + 1)
              db.collection('questions').insertOne(
                {
                  _id: (results[0]._id + 1),
                  product_id: Number(pid),
                  body: req.body.body,
                  name: req.body.name,
                  email: req.body.name,
                  helpful: 0,
                  reported: 0
                }
              )
              res.status(201).json('Created')
            })
            .catch(error => console.error(error))
        }
      })
      .catch(error => res.status(404).send(`${error}`))
  });

  // ADD AN ANSWER //=================================================================

  // Parameters
  // question_id: integer, Required ID of the question to post the answer for

  // Body Parameters
  // body: text, Text of question being answered
  // name: text, Username for question answerer
  // email: text, Email address for question answerer
  // photos: [text], An array of urls corresponding to images to display

  // Response Status: 201 CREATED

    app.post('/qa/questions/:question_id/answers', (req, res) => {
      console.log('req.params', req.params)
      let qid = Number(req.params.question_id);

      db.collection('questions').find({ _id: qid }).toArray()
        .then(results => {
          if (results.length === 0) {
            throw new Error('No Question Found')
          } else {
            db.collection('answers').find().sort({ _id: -1 }).limit(1).toArray()
              .then(results => {
                console.log(results[0]._id + 1)
                db.collection('answers').insertOne(
                  {
                    _id: (results[0]._id + 1),
                    question_id: qid,
                    body: req.body.body,
                    name: req.body.name,
                    email: req.body.name,
                    helpful: 0,
                    reported: 0,
                    photos: req.body.photos
                  }
                )
                db.collection('questions').update(
                  {_id: qid},
                  { $push: { answers:
                    {
                    _id: (results[0]._id + 1),
                    body: req.body.body,
                    name: req.body.name,
                    email: req.body.name,
                    helpful: 0,
                    reported: 0,
                    photos: req.body.photos
                  }}
                  }
                )
                res.status(201).json('Created')
              })
              .catch(error => console.error(error))
          }
        })
        .catch(error => res.status(404).send(`${error}`))
  });

  // MARK QUESTION AS HELPFUL //======================================================

  // Parameters
  // question_id: integer, Required ID of the question to update

  // Response Status: 204 NO CONTENT

    app.put('/qa/questions/:question_id/helpful', (req, res) => {
    db.collection('questions').find({ _id: 3521635 }).toArray()
      .then(results => {
        //console.log(results[0])
        for (var i = 0; i < results[0].length; i++ ) {
          console.log('results[i]', results[i])
        }
        res.status(201).json('Created')
      })
      .catch(error => console.error(error))


    //find({_id: 3521635}
  });

  // REPORT QUESTION //===============================================================

  // Parameters
  // question_id: integer, Required ID of the question to update

  // Response Status: 204 NO CONTENT

  app.put('/qa/questions/1234567/report', (req, res) => {
    db.someFunc()
  });

  // MARK ANSWER AS HELPFUL //======================================================

  // Parameters
  // question_id: integer, Required ID of the answer to update

  // Response Status: 204 NO CONTENT

  app.put('/qa/answers/123456/helpful', (req, res) => {
    db.someFunc()
  });

  // REPORT QUESTION //=============================================================

  // Parameters
  // question_id: integer, Required ID of the answer to update

  // Response Status: 204 NO CONTENT
  app.put('/qa/answers/123456/report', (req, res) => {
    db.someFunc()
  });



// DATABASE CONNECT ENDS //===================================================================
  })
  .catch(error => console.error(error))