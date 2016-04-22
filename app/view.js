"use strict";

var app;
var Template = require('./template');

class View
{
    constructor(file,data)
    {
        app = require('./app');

        this.file = file;
        this.data = data||{};

        this.template = Template.create();

        var applyDefault = app.config('defaultTemplate');

        applyDefault(this.template);
    }

    /**
     * Perform template actions.
     * @param property string
     * @param value mixed value
     * @returns {*}
     */
    set(property,value)
    {
        this.template[property] = value;
        return this;
    }

    /**
     * Combine data with this view.
     * @param data object
     * @returns {View}
     */
    and(data)
    {
        if (! data) return this;
        for (let prop in data)
        {
            this.data[prop] = data;
        }
        return this;
    }

    /**
     * Render the view response.
     * @param request
     * @param response
     * @returns {*}
     */
    render(request,response)
    {
        this.template.setUser(request.user);
        this.data.template = this.template;
        this.data.token = request.csrfToken();
        return response.render(this.file, this.data);
    }

    /**
     * Named constructor.
     * @param file string
     * @param data object
     * @returns {View}
     */
    static create(file,data)
    {
        return new View(file,data);
    }
}

module.exports = View;