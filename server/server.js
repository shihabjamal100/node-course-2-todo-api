require('./config/config');

const _ = require('lodash');

const express= require('express');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
const {ObjectID} = require('mongodb');

var app = express();

const port = process.env.PORT;

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then( (doc) => {
        res.send(doc);
    }, (error) => {
        res.status(400).send(error);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then( (todos) => {
        res.send({todos});
    }, (error) => {
        res.status(400).send(error);
    } );
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id))
    {
        return res.status(404).send();
    }
    
    Todo.findById(id).then( (todo) => {
        if (!todo)
        {
            // NOTE: findById can return success even if it hasn't found a matching
            // todo. That's why we need this if check.
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((error) => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id))
    {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then( (todo) => {
        if (!todo)
        {
            // NOTE: findByIdAndRemove can return success even if it hasn't found a matching
            // todo. That's why we need this if check.
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((error) => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
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

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then( (todo) => {
        if (!todo)
        {
            return res.status(404).send();
        }
        
        res.send({todo});
    }).catch((error) => {
        res.status(404).send();
    });
});

app.listen(port, ()=> {
    console.log(`Started on port ${port}`);
});

module.exports.app = app;