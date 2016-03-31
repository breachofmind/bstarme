"use strict";

module.exports = function()
{
    var app = require('./app'),
        router = app.express,
        passport = app.auth.passport,
        dispatch = app.Controller.dispatch;

    // Authentication routes.
    router.get  ('/',  dispatch('authController', 'login'));
    router.get  ('/logout', dispatch('authController', 'logout'));
    router.post ('/login',  passport.authenticate('local', {
        successRedirect: "/app",
        failureRedirect: "/"
    }));

    // RESTful api
    router.get      ('/api/v1/:model',     dispatch('restController','fetchAll'));
    router.post     ('/api/v1/:model',     dispatch('restController','create'));
    router.get      ('/api/v1/:model/:id', dispatch('restController','fetchOne'));
    router.put      ('/api/v1/:model/:id', dispatch('restController','update'));
    router.delete   ('/api/v1/:model/:id', dispatch('restController','trash'));

    // Application routes.
    router.get('/app',        dispatch('appController','index'));
    router.get('/:slug',      dispatch('indexController','redirect'));
};