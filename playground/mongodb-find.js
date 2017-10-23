const {MongoClient, ObjectID} = require('mongodb'); // **** using Obbject destructuring

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err)
    {
        return console.log('Unable to connect to MongoDB server.');
    }

    console.log('Connected to MongoDB server');

    // FILTER ITEMS THAT HAVE COMPLETED = FALSE
    /* db.collection('Todos').find({completed: false}).toArray().then( (docs) => {
        console.log('Todos');
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('Unable to find the collection', err);
    } ); */

    // FIND THE ITEM WITH A SPECIFIC ID.
    /* db.collection('Todos').find({
        _id: new ObjectID('59eb579869a9e033c8ea1e5c')}).toArray().then( (docs) => {
        console.log('Todos');
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('Unable to find the collection', err);
    } ); */

    // COUNT THE NUMBBER OF ITEMS IN THE COLLECTION
    /* db.collection('Todos').find().count().then( (count) => {
        console.log(`Todos count: ${count}`);
    }, (err) => {
        console.log('Unable to find the collection', err);
    } ); */

    db.collection('Users').find({name: 'Shihab'}).toArray().then( (docs) => {
        console.log('Users');
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('Unable to find the collection', err);
    } );

    //db.close();
});