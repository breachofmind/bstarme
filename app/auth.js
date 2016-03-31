"use strict";

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Model = require('./model');

class Auth
{
    /**
     * Build the auth object.
     * @constructor
     */
    constructor(app)
    {
        this.passport = passport;

        app.express.use(passport.initialize());
        app.express.use(passport.session());

        passport.use(new LocalStrategy(this.strategy));
        passport.serializeUser(this.serialize);
        passport.deserializeUser(this.deserialize);
    }

    /**
     * Serialize a user.
     * @param user
     * @param done
     */
    serialize(user,done)
    {
        done(null, user._id);
    }

    /**
     * Deserialize a user.
     * @param id
     * @param done
     */
    deserialize(id,done)
    {
        Model.User.findById(id, function(err, user) {
            done(err, user);
        });
    }

    /**
     * The local strat.
     * @param username
     * @param password
     * @param done
     */
    strategy(username,password,done)
    {
        Model.User.findOne({ email: username }, function (err, user) {

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
    }
}

module.exports = Auth;