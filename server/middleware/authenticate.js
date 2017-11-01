var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    
        User.findByToken(token).then( (user) => {
            if (!user)
            {
                // This case is unlikely. It means that the token passed in was valid but for
                // some reson we couldn't find a matching user in the DB.
                return Promise.reject(); // return a Promise.reject() so it can be caught by the catch block.
            }
    
            // We modify the req to include the body and token so the user of this middleware can have that information
            req.user = user;
            req.token = token;
            next();
        }).catch( (error) => {
            res.status(401).send();   // note no next() needed after this as we don't want whover is using this middleware to run if in error
        });
}

module.exports = {authenticate}