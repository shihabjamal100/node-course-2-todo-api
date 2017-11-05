const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
    {
        _id: userOneId,
        email: 'shihab@example.com',
        password: 'userOnePassword',

        tokens: [
            {
                access: 'auth',
                token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
           }]
    },

    {
        _id: userTwoId,
        email: 'omy@example.com',
        password: 'userTwoPassword'
    }
];

const toDos =[ 
    {
        _id: new ObjectID(),
        text: 'First test todo'
    },
    {
        _id: new ObjectID(),
        text: 'Second test todo',
        completed: true,
        completedAt: 333
    }];

const populateTodos = (done) => {
    Todo.remove({}).then( () => {
        return Todo.insertMany(toDos);
    }).then( ()=> {
        done();
    });
}

const pupulateUsers = (done) => {
    User.remove({}).then( () => {
        // Note that unlike in the populateTodos we can't simply use insertMany because
        // we want our save middleware (defined in the User model) to run. This middleware
        // hashes the password.
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]); // this returns a promise that resolves when both the promises passed in resolve.
    }).then( () => {
        done();
    });
}

module.exports = {toDos, populateTodos, users, pupulateUsers};