require('./config/config');

const _ = require('lodash');

const express= require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT;

app.use(bodyParser.json())

//============TODO ROUTES===================
app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then( (doc) => {
        res.send(doc);
    }, (error) => {
        res.status(400).send(error);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then( (todos) => {
        res.send({todos});
    }, (error) => {
        res.status(400).send(error);
    } );
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id))
    {
        return res.status(404).send();
    }
    
    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then( (todo) => {
        if (!todo)
        {
            // NOTE: findById can return success even if it hasn't found a matching
            // todo. That's why we need this if check.
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((error) => res.status(400).send());
});

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id))
    {
        return res.status(404).send();
    }

    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then( (todo) => {
        if (!todo)
        {
            // NOTE: findByIdAndRemove can return success even if it hasn't found a matching
            // todo. That's why we need this if check.
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((error) => res.status(400).send());
});

app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id))
    {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed)
    {
        body.completedAt = new Date().getTime();
    }
    else
    {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {$set: body}, {new: true}).then( (todo) => {
        if (!todo)
        {
            return res.status(404).send();
        }
        
        res.send({todo});
    }).catch((error) => {
        res.status(404).send();
    });
});

//========== USERS ROUTES ===================

app.post('/users/', (req, res) => {
    var user = new User( _.pick(req.body, ['email', 'password']) );

    user.save().then( () => {
        return user.generateAuthToken();
    }).then( (token) => {
        res.header('x-auth', token).send(user);     // in http anything with x- means custom header. We are adding a x-auth custom defined header
    }).catch((error) => {
        res.status(400).send(error);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((error) => {
        res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then( () => {
        res.status(200).send();
    }, () => {
        res.status(401).send();
    });
});

app.listen(port, ()=> {
    console.log(`Started on port ${port}`);
});

module.exports.app = app;