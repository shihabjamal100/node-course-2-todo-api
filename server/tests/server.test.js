const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {toDos, populateTodos, users, pupulateUsers} = require('./seed/seed')

// This runs before each test making sure the data in both the todo and the users database are empty.
beforeEach(pupulateUsers);
beforeEach(populateTodos);

describe('POST /todos', ()=> {

    // Test try to enter a valid text in to the database
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
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

describe('GET /todos', ()=> {
   it ('should get all todos', (done) => {
       request(app)
       .get('/todos')
       .set('x-auth', users[0].tokens[0].token)
       .expect(200)
       .expect( (res)=> {
           expect(res.body.todos.length).toBe(1);
       })
       .end(done);
   });
});

describe('GET /todos/:id', ()=> {
    it ('should return todo doc', (done) => {
        request(app)
        .get(`/todos/${toDos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect( (res)=> {
            expect(res.body.todo.text).toBe(toDos[0].text);
        })
        .end(done);
    });

    it ('should not return todo doc created by other user', (done) => {
        request(app)
        .get(`/todos/${toDos[1]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it ('should return a 404 if todo not found', (done)=> {
        request(app)
        .get(`/todos/${(new ObjectID()).toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it ('should return a 404 for non object IDs', (done) => {
        request(app)
        .get('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it ('should delete a to do', (done) => {
        var id = toDos[0]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect( (res) => {
            expect(res.body.todo._id).toBe(id);
        })
        .end( (err, res) => {
            if (err)
            {
                return done(err);
            }
     
            Todo.findById(id).then( (todo) => {
                expect(todo).toBeFalsy();
                done();
            }).catch( (e) => done(e));
        } );
    });

    it ('should not delete a to do created by other user', (done) => {
        var id = toDos[1]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end( (err, res) => {
            if (err)
            {
                return done(err);
            }
     
            Todo.findById(id).then( (todo) => {
                expect(todo).toBeTruthy();
                done();
            }).catch( (e) => done(e));
        } );
    });

    it ('should return a 404 if todo not found', (done) => {
        request(app)
        .delete(`/todos/${(new ObjectID()).toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it ('should return a 404 for non object IDs', (done) => {
        request(app)
        .delete('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todo/:id', () => {
    it ('should update a todo', (done) => {
        var id = toDos[0]._id.toHexString();
        var update = {
            text: 'Updated text',
            completed: true,
        };

        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .send(update)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(update.text);
            expect(res.body.todo.completed).toBe(true);
            expect(typeof res.body.todo.completedAt).toBe('number');
        })
        .end(done);
    });

    it ('should not update a todo created by other user', (done) => {
        var id = toDos[1]._id.toHexString();
        var update = {
            text: 'Updated text',
            completed: true,
        };

        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .send(update)
        .expect(404)
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
        .set('x-auth', users[1].tokens[0].token)
        .send(update)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(update.text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBe(null);
        })
        .end(done);
    });
});

describe('GET /users/me', () => {
    it ('should return user if authhenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect( (res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
            expect(res.body)
        })
        .end(done);
    });

    it ('should return a 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .expect(401)
        .expect( (res) => {
            expect(res.body).toEqual({});
        })
        .end(done);
    });
});

describe('POST /users', () => {
    it ('should create a user', (done) => {
        var email = 'fahim@example.com';
        var password = 'pasword123';

        request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toBeTruthy();
            expect(res.body._id).toBeTruthy();
            expect(res.body.email).toBe(email);
        })
        .end((err) => {
            if (err)
            {
                return done(err);
            }

            User.findOne({email}).then((user) => {
                expect(user).toBeTruthy();
                expect(user.password).not.toBe(password); // the stored password should not equal the supplied one as it should've been hashed
                done();
            }).catch((e) => done(e));
        });
    });

    it ('should return validattion errors if request invalid', (done) => {
        var email = 'shihab';
        var password = '123';

        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });

    it ('should not create user if email in use', (done) => {
        var email = users[0].email;
        var password = users[0].password;

        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });
});

describe('POST /users/login', () => {
    it ('should login user and return x-auth token', (done) => {
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: users[1].password
        })
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toBeTruthy();
            expect(res.body._id).toBeTruthy();
            expect(res.body.email).toBe(users[1].email);
        })
        .end((err, res) => {
            if (err)
            {
                return done(err);
            }

            User.findById(users[1]._id).then((user) => {
                expect(user.toObject().tokens[1]).toMatchObject({
                    access: 'auth',
                    token: res.headers['x-auth']
                });

                done();
            }).catch((e) => done(e));
        });
    });

    it ('should reject invalid login', (done) => {
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: users[1].password + '1'
        })
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toBeFalsy();
            expect(res.body._id).toBeFalsy();
            expect(res.body.email).toBeFalsy();
        })
        .end((err, res) => {
            if (err)
            {
                return done(err);
            }

            User.findById(users[1]._id).then((user) => {
                expect(user.tokens.length).toBe(1);

                done();
            }).catch((e) => done(e));
        });
    });
});

describe('DELETE /users/me/token', () => {
    it ('should remove auth token on logout', (done) => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
            if (err)
            {
                return done(err);
            }

            User.findById(users[0]._id).then((user) => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((e) => done(e));
        })
    });
});