const {MongoClient, ObjectID} = require('mongodb'); // **** using Obbject destructuring

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err)
    {
        return console.log('Unable to connect to MongoDB server.');
    }

    console.log('Connected to MongoDB server');

/*     db.collection('Todos').insertOne({
        text: 'Something to do',
        completed: false
    }, (err, result) => {
        if (err)
        {
            return console.log('Unable to insert todo', err);
        }

        console.log(JSON.stringify(result.ops, undefined, 2));
    }); */

    /* db.collection('Users').insertOne({
        //_id: 123,
        name: 'Shihab',
        age: 27,
        location: 'Sydney'
    }, (err, result) => {
        if (err)
        {
            return console.log(('Unable too insert user', err));
        }

        console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), 2, undefined));
    }); */

    db.close();
});