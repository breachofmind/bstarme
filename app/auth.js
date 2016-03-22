"use strict";

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    app,User;


var strategy = function(username, password, done)
{
    app = require('./app');
    User = app.Model.User;

    User.findOne({ email: username }, function (err, user) {

        if (err) {
            return done(err);
        }
        if (! user) {
            return done(null, false, { message: 'User does not exist.' });
        }
        if (! user.isValid(password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    });
};

passport.use(new LocalStrategy(strategy));


passport.serializeUser(function(user, done)
{
    done(null, user._id);
});


passport.deserializeUser(function(id, done)
{
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

module.exports = passport;