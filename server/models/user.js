const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
    }, process.env.JWT_SECRET).toString();

    user.tokens.push({access, token});

    return user.save().then( () => {  // return the promise
        return token;                 // also return the value that will get passed to the success case when this promise is chained
    })
}

UserSchema.methods.removeToken = function (token) {
    var user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });
}

UserSchema.statics.findByToken = function (token) {    // this is a static method so this points to the User model (instead of an individual user instance)
    var User = this;
    var decoded;

    try
    {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
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

UserSchema.statics.findByCredentials = function(email, password) {
    var User = this;

    return User.findOne({email}).then( (user) => {
        if (!user)
        {
            return Promise.reject();
        }

        return new Promise( (resolve, reject) => {
            bcrypt.compare(password, user.password, (error, result) => {                
                if (result)
                {
                    resolve(user);
                }
                else
                {
                    reject(error);
                }
                    
            })
        });
    });
}

// See Mongoose middleware documentation.
UserSchema.pre('save', function (next) {
    var user = this;

    // Note we only want to hash the password once. So if a new user is saved, we hash the password for
    // the first time. Then if another property of the user is updated (like e-mail) and it is not the
    // password we do not want to hash the password again because it is already hashed. So we check if 
    // the password is actually modified before hashing.
    if (user.isModified('password'))
    {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    }
    else
    {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};