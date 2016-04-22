"use strict";

var express     = require('express'),
    chalk       = require('chalk'),
    db          = require('./db'),
    bodyParser  = require('body-parser'),
    config      = require('../config/app'),
    csrf        = require('csurf'),
    crypto      = require('crypto'),
    session     = require('express-session'),
    Routes      = require('./routes'),
    Auth        = require('./auth'),
    helpers     = require('./support/helpers'),
    Logger      = require('./support/logger'),
    MongoStore  = require('connect-mongo')(session);


/**
 * The core application.
 * @constructor
 */
function Application ()
{
    var app = this;
    var _config = config;

    this.util = helpers;

    // Setup MongoDB connection.
    this.db = db.connection;
    this.logger = new Logger(this.db);

    // Setup express.js webserver.
    this.express = express();
    this.express.set('view engine','jade');
    this.express.set('views', 'assets/views');

    // Setup middleware.
    this.express.use(function(request,response,next) {
        request.ajax = request.get('x-requested-with') === 'XMLHttpRequest';
        next();
    });
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended:true}));
    this.express.use(express.static('public'));
    this.express.use('/template',express.static('assets/views/ng'));

    // Session.
    this.express.use(session({
        secret: config.appKey,
        saveUninitialized: false,
        resave: false,
        store: new MongoStore({
            mongooseConnection: this.db.connection,
        })
    }));

    // CSRF protection.
    this.express.use(csrf());
    this.express.use(function (err, request, response, next) {
        if (err.code !== 'EBADCSRFTOKEN' || app.config('env') !== "production") {
            return next();
        }
        var data = request.ajax ? err : app.View.create('error/403');
        return new app.Response(data, request)
            .status(403, "Forbidden")
            .json(request.ajax)
            .send(response);
    });

    // User authentication.
    this.auth = new Auth(app);

    /**
     * Return a config variable.
     * @param key string
     * @param value mixed
     * @returns {*}
     */
    this.config = function(key,value)
    {
        if (arguments.length == 2) {
            return _config[key] = value;
        }
        return _config[key];
    };

    /**
     * Return the config object.
     * @returns {*|exports|module.exports}
     */
    this.getConfig = function()
    {
        return _config;
    };

    /**
     * Change the environment or get the environment.
     * @param env string
     * @returns {string}
     */
    this.environment = function(env)
    {
        if (! arguments.length) {
            return this.config('env');
        }
        if (['local','development','production'].indexOf(env) > -1) {
            return this.config('env',env);
        }
        return this.config('env');
    };


    /**
     * Encrypt a password with a salt.
     * @param password string
     * @param salt string
     * @returns {string}
     */
    this.encrypt = function(password,salt)
    {
        return crypto.createHmac("md5",salt)
            .update(password)
            .digest('hex');
    };

    /**
     * Load all controller classes.
     * @return {Application}
     */
    this.loadControllers = function()
    {
        config.controllers.forEach(function(ctrl)
        {
            require('./controllers/'+ctrl);
        });
        return this;
    };

    /**
     * Load model classes.
     * @returns {Application}
     */
    this.loadModels = function()
    {
        config.models.forEach(function(model)
        {
            require('./models/'+model);
        });
        return this;
    };

    /**
     * Load the routes.
     * @return {Application}
     */
    this.loadRoutes = function()
    {
        Routes();
        return this;
    };

    /**
     * Bootstrap the application.
     * @returns {Application}
     */
    this.bootstrap = function()
    {
        this.Model      = require('./model');
        this.View       = require('./view');
        this.Controller = require('./controller');
        this.Response   = require('./response');


        this.loadModels()
            .loadControllers()
            .loadRoutes();



        return this;
    };

    /**
     * Start the application server.
     */
    this.start = function()
    {
        var port = chalk.green(this.config('port'));
        var env = chalk.green(this.config('env'));

        this.express.listen(this.config('port'), function()
        {
            app.logger.message(`Starting ${env} server on port ${port}...`);

        }.bind(this));
    };
}

var app = new Application();

module.exports = app;
