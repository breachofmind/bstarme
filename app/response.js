"use strict";

const app = require('./app');
const View = app.View;

/**
 * The response class handles values returned by controllers.
 * Objects are automatically converted to JSON.
 */
class Response
{
    /**
     * Constructor.
     * @param object mixed object|string|null
     * @param request
     */
    constructor(object,request)
    {
        // Defaults
        this.statusCode = 200;
        this.request    = request;
        this.response   = null;
        this.message    = "OK";
        this.isJSON     = false;
        this.data       = object;

        if (request.user) {
            this.user = request.user.toJSON();
        }
    }

    /**
     * Set the isJSON flag. The response will be a JSON object.
     * Used for REST operations.
     * @param bool
     * @returns {Response}
     */
    json(bool)
    {
        this.isJSON = !arguments.length ? true : bool;
        return this;
    }

    /**
     * Set the status code and message.
     * @param code int
     * @param message string
     * @returns {Response}
     */
    status(code,message)
    {
        this.statusCode = code;
        this.message = message||"OK";
        return this;
    }

    /**
     * Set the request object.
     * @param request
     * @returns {Response}
     */
    setRequest(request)
    {
        this.request = request;
        return this;
    }

    /**
     * Prepare and send the response.
     * @param response
     * @returns {boolean}
     */
    send(response)
    {
        var action = this.handle(this.data);

        this.response = response.status(this.statusCode);

        // Send a promise through the handler again.
        if (action.constructor.name == "Promise")
        {
            action.then(function(callback){
                return this.callAction(callback);
            }.bind(this));

            return true;
        }

        this.callAction(action);
    }

    /**
     * Convert this object to a JSON.
     * @returns {{}}
     */
    toJSON()
    {
        return {
            statusCode: this.statusCode,
            message: this.message,
            method: this.request.method,
            url: this.request.url,
            user: this.user,
            pagination: this.request.pagination||null,
            data: this.data

        }
    }

    /**
     * Call the action returned by this.handle(object)
     * If isJSON, the response is different.
     * @param action function
     * @returns {*}
     */
    callAction(action)
    {
        if (this.isJSON) {
            return this.response.json(this.toJSON());
        }

        return action(this.response);
    }

    /**
     * Handle the object returned by the controller.
     * The object is handled differently depending on what it is (see below)
     * @param object mixed
     * @returns {*}
     */
    handle(object)
    {
        var request = this.request;

        // Does not exist.
        if (! object || object === null)
        {
            this.status(404,"Not Found");
            return this.handle(View.create('error/404'));
        }

        // Send a promise through the handler again.
        if (object.constructor && object.constructor.name == "Promise")
        {
            return object.then(function(returnValue){
                return this.handle(returnValue);
            }.bind(this));
        }

        // Render the View object.
        if (object instanceof View)
        {
            return function(response){
                object.render(request,response);
            }
        }

        // Convert objects to JSON and return JSON response.
        if (typeof view == "object")
        {
            return function(response) {
                response.json(object.toJSON ? object.toJSON() : object);
            };
        }

        // Type is string.
        return function(response) {
            response.send(object);
        }
    }
}

module.exports = Response;