const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// REMOVE ALL THE ITEMS IN THE TODO DB
/* Todo.remove({}).then( (result)=> {
    console.log(result);
} ); */

// FIND ONE MATCHING ITEM IN THE TODO DB AND REMOVE
/* Todo.findOneAndRemove({_id: '59f5c9ce535b977820a7f817'}).then((doc) => {
    console.log(todo);
}); */

//FIND A TODO BY ID AND REMOVE
Todo.findByIdAndRemove('59f5c9ce535b977820a7f817').then( (todo) => {
    console.log(todo);
});