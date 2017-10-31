const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

var toDos =[ 
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

// This runs before each test making sure the data base has two toDos (the above created array).
beforeEach((done) => {
    Todo.remove({}).then( () => {
        return Todo.insertMany(toDos);
    }).then( ()=> {
        done();
    });
});

describe('POST/todos', ()=> {

    // Test try to enter a valid text in to the database
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect( (res) => {
            expect(res.body.text).toBe(text);
        })
        .end( (error, res) => {
            if (error)
            {
                return done(error); // return because we don't want any following lines to execute
            }

            Todo.find({text}).then( (todos) => {     // The find finds only the toDo in the collection matching the above created text
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch( (e) => done(e) ); // one line expression syntax
        } );
    });

    // Test try to enter an invalid (empty) text in to data base.
    it ('should not create todo with empty data', (done) => {
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end( (error, res) => {
            if (error)
            {
                return done(error); // return because we don't want any following lines to execute
            }

            Todo.find().then( (todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch( (e) => done(e) ); // one line expression syntax
        } );
    });
});

describe('GET/todos', ()=> {
   it ('should get all todos', (done) => {
       request(app)
       .get('/todos')
       .expect(200)
       .expect( (res)=> {
           expect(res.body.todos.length).toBe(2);
       })
       .end(done);
   });
});

describe('GET/todos/:id', ()=> {
    it ('should return todo doc', (done) => {
        request(app)
        .get(`/todos/${toDos[0]._id.toHexString()}`)
        .expect(200)
        .expect( (res)=> {
            expect(res.body.todo).toInclude(toDos[0]);
        })
        .end(done);
    });

    it ('should return a 404 if todo not found', (done)=> {
        request(app)
        .get(`/todos/${(new ObjectID()).toHexString()}`)
        .expect(404)
        .end(done);
    });

    it ('should return a 404 for non object IDs', (done) => {
        request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    });
});

describe('DELETE:/todos/:id', () => {
    it ('should delete a to do', (done) => {
        var id = toDos[0]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .expect(200)
        .expect( (res) => {
            expect(res.body.todo).toInclude(toDos[0]);
        })
        .end( (err, res) => {
            if (err)
            {
                return done(err);
            }
     
            // NOW TRY TO GET THE DELETED ITEM AND MAKE SURE IT FAILS.

            // MY WAY OF DOING IT
            /* request(app)
            .get(`/todos/${id}`)
            .expect(404); */

            // THEIR WAY OF DOINNG IT
            Todo.findById(id).then( (todo) => {
                expect(todo).toNotExist();
                done();
            }).catch( (e) => done(e));
        } );
    });

    it ('should return a 404 if todo not found', (done) => {
        request(app)
        .delete(`/todos/${(new ObjectID()).toHexString()}`)
        .expect(404)
        .end(done);
    });

    it ('should return a 404 for non object IDs', (done) => {
        request(app)
        .delete('/todos/123')
        .expect(404)
        .end(done);
    });
});

describe('PATCH/rodo/:id', () => {
    it ('should update a todo', (done) => {
        var id = toDos[0]._id.toHexString();
        var update = {
            text: 'Updated text',
            completed: true,
        };

        request(app)
        .patch(`/todos/${id}`)
        .send(update)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(update.text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA('number');
        })
        .end(done);
    });

    it ('should clear completed at when todo not completed', (done)=> {
        var id = toDos[1]._id.toHexString();
        var update = {
            text: 'Updated text',
            completed: false
        };

        request(app)
        .patch(`/todos/${id}`)
        .send(update)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(update.text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBe(null); // toNotExist also ok
        })
        .end(done);
    });
});