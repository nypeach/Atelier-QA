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
  dbo.collection("answers").find({}, { timeout: false }).forEach(item => {

    dbo.collection("questions").update(
      { _id: item.question_id },
      { $push: { answers: item } }
    )
      .then(() => {
        count++;
        console.log(`updated ${count}!`);
        if (dbo.collection("answers").count() === count) {
          db.close();
        }
      })
  })
});
