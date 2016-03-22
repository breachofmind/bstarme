"use strict";

const hbs = require('handlebars');
const fs = require('fs');

var app,config;

class Template
{
    /**
     * Constructor
     * @param title string
     */
    constructor(title)
    {
        app = require('./app');
        config = app.getConfig();

        this.title          = title;
        this.user           = null;
        this.description    = "";
        this.bodyClass      = [];
        this.scripts        = [];
        this.styles         = [];
        this.metas          = [];

        this.metas.push("<meta charset='UTF-8'/>");
        this.meta('viewport','width=device-width');

        if (config.env === "development") {
            this.script("livereload", "http://localhost:35729/livereload.js");
        }
    }

    setUser(user)
    {
        if (user) {
            this.user = user;
            this.meta('user', user._id);
        }

        return this;
    }


    script(name,src)
    {
        this.scripts.push(new TemplateFile("script",name, src));
        return this;
    }

    style(name,src)
    {
        this.styles.push(new TemplateFile("link",name,src));
        return this;
    }

    meta(key,value)
    {
        this.metas.push(new TemplateFile("meta",key,{key:key,value:value}));
        return this;
    }

    /**
     * Return the <head> string output.
     * @returns {string}
     */
    head()
    {
        var template = this;
        var out = [];
        var order = ['metas','scripts','styles'];

        if (this.description) {
            this.meta('description',this.description);
        }

        order.forEach(function(container)
        {
            template[container].forEach(function(file) {
                out.push(file instanceof TemplateFile ? file.render() : file);
            });
        });
        return out.join("\n");
    }

    /**
     * Named constructor.
     * @param title string
     * @returns {Template}
     */
    static create(title)
    {
        return new Template(title);
    }
}



var _fileTemplate = {
    link:   hbs.compile('<link href="{{attributes.src}}" rel="stylesheet" type="text/css"/>'),
    script: hbs.compile('<script src="{{attributes.src}}" type="text/javascript"></script>'),
    meta:   hbs.compile('<meta name="{{name}}" content="{{attributes.value}}"/>'),
};

var _jsonProperties = ['name','element','attributes'];
/**
 * Template file class.
 * Used for script,style and meta tags.
 */
class TemplateFile
{
    constructor(element, name, attr)
    {
        this.element    = element;
        this.name       = name;
        this.template   = _fileTemplate[element] || null;
        this.attributes = typeof attr == "string" ? {src:attr} :  attr;

        if (this.exists) {
            this.attributes.src += "?m="+fs.statSync(config.publicPath(this.attributes.src)).mtime.getTime();
        }

    }

    /**
     * If a file, check if it exists.
     * @returns {boolean}
     */
    get exists()
    {
        return this.attributes.src && fs.existsSync(config.publicPath(this.attributes.src));
    }

    /**
     * Return a JSON object for the template.
     * @returns {Array}
     */
    toJSON()
    {
        var out = {};
        _jsonProperties.forEach(function(prop){
            out[prop] = this[prop];
        }.bind(this));
        return out;
    }

    /**
     * Render the template.
     * @returns {*}
     */
    render()
    {
        if (! this.template) {
            return "";
        }
        return this.template(this.toJSON());
    }
}

module.exports = Template;