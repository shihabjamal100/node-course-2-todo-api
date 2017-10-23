const {MongoClient, ObjectID} = require('mongodb'); // **** using Obbject destructuring

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err)
    {
        return console.log('Unable to connect to MongoDB server.');
    }

    console.log('Connected to MongoDB server');

    //=============================TODOS DB=====================

    // deleteMany --- DELETE ALL MATCHING ITEMS ********
    /* db.collection('Todos').deleteMany({text: 'Eat lunch'}).then( (result) => {
        console.log(result);
    }); */

    // deleteOne --- DELETE THE FIRST MATCHING ITEM FOUND ******
    /* db.collection('Todos').deleteOne({text: 'Eat lunch'}).then( (result) => {
        console.log(result);
    }); */

    // findOneAndDelete --- FIND FIRST MATCHING ITEM AND DELETE ****
    /* db.collection('Todos').findOneAndDelete({completed: false}).then( (result) => {
        console.log(result);
    }); */

    //==================USERS DB=====================================

    // deleteMany --- DELETE ALL MATCHING ITEMS ********
    /* db.collection('Users').deleteMany({name: 'Shihab'}).then( (result) => {
        console.log(result);
    }); */

    // findOneAndDelete --- FIND FIRST MATCHING ITEM AND DELETE ****
    db.collection('Users').findOneAndDelete({
        _id: new ObjectID('59ebed6f6b88f31a0c4a60a8')
    }).then( (result) => {
        console.log(result);
    });


    //db.close();
    
});