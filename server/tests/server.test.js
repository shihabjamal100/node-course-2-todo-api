const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

var toDos =[ 
{
    text: 'First test todo'
},
{
    text: 'Second test todo'
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