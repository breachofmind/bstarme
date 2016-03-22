"use strict";

module.exports = function()
{
    var app = require('./app'),
        router = app.express,
        passport = require('./auth'),
        dispatch = app.Controller.dispatch;

    // Authentication routes.
    router.get  ('/login',  dispatch('authController', 'login'));
    router.get  ('/logout', dispatch('authController', 'logout'));
    router.post ('/login',  passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: "/login"
    }));

    // RESTful api
    router.get      ('/api/v1/:model',     dispatch('restController','fetchAll'));
    router.post     ('/api/v1/:model',     dispatch('restController','create'));
    router.get      ('/api/v1/:model/:id', dispatch('restController','fetchOne'));
    router.put      ('/api/v1/:model/:id', dispatch('restController','update'));
    router.delete   ('/api/v1/:model/:id', dispatch('restController','trash'));

    // Application routes.
    router.get('/',      dispatch('indexController','index'));
};