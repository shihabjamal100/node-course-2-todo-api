const {MongoClient, ObjectID} = require('mongodb'); // **** using Obbject destructuring

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err)
    {
        return console.log('Unable to connect to MongoDB server.');
    }

    console.log('Connected to MongoDB server');

    /* db.collection('Todos').findOneAndUpdate({
        _id: new ObjectID('59edeec4c08951dbeedb0bff')
    }, { $set: {
                 completed: true
               }
       }, {returnOriginal: false}
    ).then((result) => {
           console.log(result);
       }); */

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('59eb59eb2a54d517b8f0559a')
    }, { $set: {
                 name: 'Shihab'
               },
        $inc: {
                 age: 1
              }
       }, {returnOriginal: false}
    ).then((result) => {
           console.log(result);
       });


    //db.close();
    
});