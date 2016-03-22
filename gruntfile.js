/**
 * tasks:
 * grunt (default)
 * grunt --use name (runs default task for named configuration)
 * grunt production (runs production tasks only)
 * grunt watch (for development, livereload is enabled)
 */
var builder = require('./config/build'),
    config  = require('./config/app'),
    initConfig = {},
    $;

module.exports = function(grunt) {

    $ = builder.init(grunt);

    initConfig['server'] = {
        port:config.port
    };

    /**
     * <concat>
     */
    initConfig['concat'] = {
        options: {separator:";\n"},
        src: $.collection('js-src').toObject(),
        lib: $.collection('js-lib').toObject()
    };
    $.tasks('concat:lib');
    $.tasks('concat:src');

    if ($.has('css-lib')) {
        initConfig['concat'].css = $.collection('css-lib').toObject();
        $.tasks('concat:css');
    }




    /**
     * <compass>
     */
    initConfig['compass'] = {
        dist: {
            options: {
                sassDir: $.path('scss'),
                cssDir:  $.path('static'),
                importPath: $.path('import')
            }
        }
    };
    $.tasks('compass');


    /**
     * <watch>
     */
    initConfig['watch'] = {
        scripts: {
            files: $.collection('js-src').list(),
            tasks: ['concat:src'],
            options: {livereload:true}
        },
        scss: {
            files: [$.path('scss')+'/**/*.scss'],
            tasks: ['compass'],
            options: {livereload:true}
        },
        jade: {
            files: [$.path('views')+'/**/*.jade'],
            options: {livereload:true}
        }
    };


    /**
     * <autoprefixer>
     */
    if ($.has('css')) {

        initConfig['autoprefixer'] = $.collection('css').prefixOverwrite();
        $.tasks('autoprefixer');
    }


    /**
     * <react>
     */
    if ($.has('jsx')) {

        initConfig['react'] = {
            src: {
                files: $.collection('jsx').prefix()
            }
        };

        // Add a watch task, too.
        initConfig['watch'].react = {
            files: $.collection('jsx').list(),
            tasks: ['react:src'],
            options: {livereload:true}
        };
        $.tasks('react:src');
    }

    /**
     * <uglify>
     * For production task only.
     */
    initConfig['uglify'] = {
        src: {
            files: $.buildFiles(['js-lib','js-src']).prefixOverwrite(function(file){
                return file.minified();
            })
        }
    };
    $.tasks('uglify:src','production');


    /**
     * <cssmin>
     * For production task only.
     */
    if ($.has('css')) {

        initConfig['cssmin'] = {
            src: {
                files: $.collection('css').prefixOverwrite(function(file) {
                    return file.minified();
                })
            }
        };
        $.tasks('cssmin','production');
    }


    //console.log (inspect(initConfig,true,10));

    if (grunt.option('show')) {
        $.dump();
    }

    grunt.initConfig(initConfig);

    grunt.registerTask('default', $.tasks());

    grunt.registerTask('production', 'Minify files for production.', $.tasks());
};
