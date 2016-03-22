var build = require('builder');

build.npmTasks.push("grunt-react");

var files = {
    "js-lib" : [
        'jquery/dist/jquery.js',
        'angular/angular.js'
    ],

    "js-src" : [
        'helpers.js',
        'main.js',
    ],

    "css-lib": [
        '/vex/css/vex.css',
        '/vex/css/vex-theme-plain.css'
    ],

    "css" : [
        'base.css',
        'app.css'
    ]
};

build.register('default')

    .path('assets', 'assets')
    .path('views',  '{assets}/views')
    .path('js',     '{assets}/js')
    .path('jsx',    '{assets}/jsx')
    .path('scss',   '{assets}/scss')
    .path('css',    'public')
    .path('static', 'public')
    .path('import', 'assets/vendor/foundation/scss')

    .collection('js-lib',   files['js-lib'],    {dir: "{assets}/vendor", build:"{static}/app.lib.js"})
    .collection('js-src',   files['js-src'],    {dir: "{js}",            build:"{static}/app.src.js"})
    //.collection('css-lib',  files['css-lib'],   {dir: "{js}/lib",        build:"{static}/app.lib.css"})
    .collection('css',      files['css'],       {dir: "{css}"});

module.exports = build;