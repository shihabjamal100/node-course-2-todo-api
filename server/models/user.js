const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: (value) => {    
                return validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email'
        }
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    tokens: [
        {
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }
    ]
});

// Override the toJSON method which determines what is sent back to the client when a mongoose model is converted
// to a JSON value.
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({
        _id: user._id.toHexString(), 
        access
    }, 'abc123').toString();

    user.tokens.push({access, token});

    return user.save().then( () => {  // return the promise
        return token;                 // also return the value that will get passed to the success case when this promise is chained
    })
}

UserSchema.statics.findByToken = function (token) {    // this is a static method so this points to the User model (instead of an individual user instance)
    var User = this;
    var decoded;

    try
    {
        decoded = jwt.verify(token, 'abc123');
    }
    catch(e)
    {
        return new Promise( (resolve, reject) => {     // return the promise so caller can chain
            return reject();                           // return the reject so the caller gets this when using then()
        });

        // Note the above can also bbe simplified to return Promise.reject()
    }

    return User.findOne({          // We use return so we can chain promises
        '_id': decoded._id,        // the quotes are not needed on id since it is not a nested call but we put it anyway for consistency
        'tokens.token': token,     // note these two lines are nested queries and they require a quote
        'tokens.access': 'auth'
    });
}

var User = mongoose.model('User', UserSchema);

module.exports = {User};