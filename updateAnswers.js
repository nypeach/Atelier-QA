var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost/qanda";
MongoClient.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function (err, db) {
  if (err) {
    console.log('ERROR ======>', err);
  }
  var dbo = db.db("qanda");
  let count = 0;
  dbo.collection("answers_photos").find({}, { timeout: false }).forEach(item => {

    dbo.collection("answers").update(
      { id: item.answer_id },
      { $push: { photos: item } }
    )
      .then(() => {
        count++;
        console.log(`updated ${count}!`);
        if (dbo.collection("answers_photos").count() === count) {
          db.close();
        }
     })
  })
});

//mongoimport --db qanda --collection answers --type csv --headerline --ignoreBlanks --file /Users/jodisilverman/seip2101/answers.csv