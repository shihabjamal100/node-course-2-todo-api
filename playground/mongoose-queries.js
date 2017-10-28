const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '59f4140efb2934f51d175105';
var userId = '59f08da1f867be0c965f36ad';

if (!ObjectID.isValid(id))
{
    console.log('ID not valid');
}

// FIND ALL TODOS
/* Todo.find({
    _id: id
}).then((todos) => {
    console.log('Todos:', todos);
});

// FIND ONLYY ONE TODO
Todo.findOne({
    _id: id
}).then((todo) => {

    console.log('Todo:', todo);
}); */

// FIND ONE TODO BY ID
Todo.findById(id).then( (todo) => 
{
    if (!todo)
    {
        return console.log('ID not found');
    }

    console.log('Todo:', todo);
}).catch( (error) => console.log(error));

// FIND ONE USER BY ID
User.findById(userId).then( (user) => {
    if (!user)
    {
        return console.log('User not found.');
    }

    console.log('User:', user);
}, (error) => {
    console.log(error);
}).catch( (error) => console.log(error) );

