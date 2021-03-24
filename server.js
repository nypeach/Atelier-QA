//================================================================================================================
// SETUPS
//================================================================================================================

// IMPORTS //=================================================================================
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const _ = require('underscore');

// MIDDLEWARE //==============================================================================
let app = express();
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// DATABASE SETUP //==========================================================================
var Promise = require("bluebird");
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'qanda'
});

global.db = Promise.promisifyAll(connection);

// SERVER PORT AND LISTENING SETUP //=========================================================

const port = 3000; // use whatever port
app.listen(port, () => {
  console.log(`To get started, visit: http://localhost:${port}`);
});

//================================================================================================================
// ROUTES
//================================================================================================================

// LIST QUESTIONS //==============================================================

app.get('/qa/test', (req, res) => {
  res.send(`HELLO WORLD!!`)
})

app.get('/qa/questions', (req, res) => {
  let pid = Number(req.query.product_id);
  let count = Number(req.query.count) || 5;
  let page = Number(req.query.page) || 0;

  db.queryAsync(`SELECT * FROM product WHERE id = ${pid}`)
    .then(results => {
      if (results.length === 0) {
        throw new Error('No Product Found')
      } else {
        db.queryAsync(`SELECT q.id, q.product_id, q.body, q.date_written, q.asker_name, q.asker_email, q.reported, q.helpful, a.answers FROM questions q LEFT JOIN answers a ON q.id = a.question_id WHERE product_id = ${pid} AND q.reported<> 1 AND a.reported <> 1 LIMIT ${count} OFFSET ${page * count};`)
          .then(results => {
            var data = {};
            for (var i = 0; i < results.length; i++) {
              var row = results[i];
              if (!data[row.id]) {
                row.answers = [JSON.parse(row.answers)]
                data[row.id] = row;
              } else {
                var answers = data[row.id].answers
                var newAnswer = JSON.parse(row.answers)
                if (!answers.find(a => a.id === newAnswer.id)) {
                  answers.push(newAnswer);
                }
              }
            }
            console.log('DATA >>>', data)
            res.status(200).json({ product_id: pid, data })
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
  db.queryAsync(`SELECT * FROM answers WHERE question_id = ${qid}`)
    .then(results => {
      if (results.length === 0) {
        throw new Error('No Question Found')
      } else {
        db.queryAsync(`SELECT id, question_id, body, date_written, answerer_name, reported, helpful, photos FROM answers WHERE question_id = ${qid} AND reported <> 1 LIMIT ${count} OFFSET ${page * count}`)
          .then(results => {
            var data = {};
            for (var i = 0; i < results.length; i++) {
              var row = results[i];
              if (row.photos === null) {
                row.photos = []
              } else {
                row.photos = JSON.parse(row.photos);
              }
            }
            res.status(200).json({ question_id: qid, page: page, count: count, results })
          })
          .catch(error => console.error(error))
      }
    })
    .catch(error => res.status(404).send(`${error}`))
});

// ADD A QUESTIONS //==================================================================
app.post('/qa/questions', (req, res) => {
  let pid = Number(req.query.product_id);
  let count = Number(req.query.count) || 5;
  let page = Number(req.query.page) || 0;

  db.queryAsync(`SELECT * FROM product WHERE id = ${pid}`)
    .then(results => {
      console.log(results)
      if (results.length === 0) {
        throw new Error('No Product Found')
      } else {
        db.queryAsync(`select max(id) from questions;`)
          .then(results => {
            console.log(req.body)
            console.log(results[0]['max(id)'] + 1)
            db.queryAsync(`INSERT INTO QUESTIONS (id, product_id, body, date_written, asker_name, asker_email, reported, helpful) VALUES (${results[0]['max(id)'] + 1}, ${pid}, '${req.body.body}', now(),'${req.body.name}', '${req.body.email}', ${0}, ${0} );`)
            res.status(201).json('Created')
          })
          .catch(error => console.error(error))
      }
    })
    .catch(error => res.status(404).send(`${error}`))
})

//   // ADD AN ANSWER //=================================================================

app.post('/qa/questions/:question_id/answers', (req, res) => {
  let qid = Number(req.params.question_id);
  console.log(qid)
  db.queryAsync(`SELECT * FROM questions WHERE id = ${qid}`)
    .then(results => {
      console.log(results)
      if (results.length === 0) {
        throw new Error('No Question Found')
      } else {
        db.queryAsync(`select max(id) from answers;`)
          .then(results => {
            console.log(req.body)
            console.log(results[0]['max(id)'] + 1)
            db.queryAsync(`INSERT INTO answers (id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful, photos, answers) VALUES (${results[0]['max(id)'] + 1}, ${qid}, '${req.body.body}', now(),'${req.body.name}', '${req.body.email}', ${0}, ${0}, JSON_ARRAY('${req.body.photos}'),JSON_OBJECT('id', ${results[0]['max(id)'] + 1},'body', '${req.body.body}','photos', JSON_ARRAY('${req.body.photos}'),'helpful', ${0},'reported', ${0},'question_id', ${qid},'date_written', now(),'answerer_name', '${req.body.name}','answerer_email', '${req.body.email}'));`)
            res.status(201).json('Created')
          })
          .catch(error => console.error(error))
      }
    })
    .catch(error => res.status(404).send(`${error}`))
})

// MARK QUESTION AS HELPFUL //======================================================

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  let qid = Number(req.params.question_id);
  console.log(qid)
  db.queryAsync(`SELECT * FROM questions WHERE id = ${qid}`)
    .then(results => {
      console.log(results)
      if (results.length === 0) {
        throw new Error('No Question Found')
      } else {
        db.queryAsync(`update questions set helpful = helpful + 1 where id = ${qid};`)
          .then(results => {
            res.status(204).json('Updated')
          })
          .catch(error => console.error(error))
      }
    })
    .catch(error => res.status(404).send(`${error}`))
})

//   // REPORT QUESTION //===============================================================

app.put('/qa/questions/:question_id/report', (req, res) => {
  let qid = Number(req.params.question_id);
  console.log(qid)
  db.queryAsync(`SELECT * FROM questions WHERE id = ${qid}`)
    .then(results => {
      console.log(results)
      if (results.length === 0) {
        throw new Error('No Question Found')
      } else {
        db.queryAsync(`update questions set reported = 1 where id = ${qid};`)
          .then(results => {
            res.status(204).json('Updated')
          })
          .catch(error => console.error(error))
      }
    })
    .catch(error => res.status(404).send(`${error}`))
})

//   // MARK ANSWER AS HELPFUL //======================================================

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  let aid = Number(req.params.answer_id);
  console.log(aid)
  db.queryAsync(`SELECT * FROM answers WHERE id = ${aid}`)
    .then(results => {
      if (results.length === 0) {
        throw new Error('No Answer Found')
      } else {
        db.queryAsync(`UPDATE answers SET helpful = helpful + 1 WHERE id = ${aid};`)
        db.queryAsync(`SELECT * FROM answers WHERE id = ${aid};`)
          .then(results => {
            var resultPhotos = JSON.parse(results[0].photos)
            db.queryAsync(`UPDATE answers SET answers = JSON_OBJECT('id', ${results[0].id},'body', '${results[0].body}','photos', JSON_ARRAY('${resultPhotos}'),'helpful', ${results[0].helpful},'reported', ${results[0].reported},'question_id', ${results[0].question_id},'date_written', now(),'answerer_name', '${results[0].answerer_name}','answerer_email', '${results[0].email}') WHERE id = ${aid};`)
              .then(results => {
                res.status(204).json('Updated')
              })
          })
          .catch(error => console.error(error))
      }
    })
    .catch(error => res.status(404).send(`${error}`))
})

//   // REPORT ANSWER //=============================================================

//   // Parameters
//   // question_id: integer, Required ID of the answer to update

//   // Response Status: 204 NO CONTENT
//   app.put('/qa/answers/123456/report', (req, res) => {
//     db.someFunc()
//   });

app.put('/qa/answers/:answer_id/report', (req, res) => {
  let aid = Number(req.params.answer_id);
  console.log(aid)
  db.queryAsync(`SELECT * FROM answers WHERE id = ${aid}`)
    .then(results => {
      if (results.length === 0) {
        throw new Error('No Answer Found')
      } else {
        db.queryAsync(`UPDATE answers SET reported = 1 WHERE id = ${aid};`)
        db.queryAsync(`SELECT * FROM answers WHERE id = ${aid};`)
          .then(results => {
            var resultPhotos = JSON.parse(results[0].photos)
            db.queryAsync(`UPDATE answers SET answers = JSON_OBJECT('id', ${results[0].id},'body', '${results[0].body}','photos', JSON_ARRAY('${resultPhotos}'),'helpful', ${results[0].helpful},'reported', ${results[0].reported},'question_id', ${results[0].question_id},'date_written', now(),'answerer_name', '${results[0].answerer_name}','answerer_email', '${results[0].email}') WHERE id = ${aid};`)
              .then(results => {
                res.status(204).json('Updated')
              })
          })
          .catch(error => console.error(error))
      }
    })
    .catch(error => res.status(404).send(`${error}`))
})
