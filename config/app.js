var path = require('path');

module.exports = {

    appKey: "ef270e97019e98f4005089238fee850",

    db: "mongodb://localhost/App",

    /**
     * The environment.
     * @var string local|development|production
     */
    env: "development",

    /**
     * The webserver port.
     * @var int
     */
    port: 8081,

    /**
     * The root or base path.
     * @param pathname string
     * @return string
     */
    basePath: function(pathname)
    {
        return path.normalize(__dirname +"/../"+pathname);
    },

    /**
     * The public path.
     * @param pathname string
     * @return string
     */
    publicPath: function(pathname)
    {
        return path.normalize(__dirname +"/../public/"+pathname);
    },

    /**
     * Default template setup.
     * @param template
     */
    defaultTemplate: function(template)
    {
        template.style('base', '/base.css');
        template.style('app', '/app.css');
        template.script('lib', '/app.lib.js');
        template.script('src', '/app.src.js');
    },

    /**
     * Controllers to load, relative to the app/controllers path.
     * @var array
     */
    controllers: [
        'indexController',
        'restController',
        'authController'
    ],

    /**
     * Models to load, relative to the app/models path.
     * @var array
     */
    models: [
        'user',
        'media'
    ],

    /**
     * The total number of results for pagination in REST api.
     * @var int
     */
    limit: 10,
};