"use strict";

const app = require('./app');
const log = app.logger;
const Response = require('./response');
const View = require('./view');

var _controllers = {};

class ControllerFactory
{
    /**
     * Constructor
     * @param methods object
     */
    constructor(methods)
    {
        this.methods = methods||{};
        this._bindings = {};

        if (methods.construct)
        {
            methods.construct(this);
            delete this.methods['construct'];
        }
    }

    /**
     * Return an action. If doesn't exist, empty method.
     * @param name string
     * @returns {*|Function}
     */
    use(name)
    {
        return this.has(name)
            ? this.methods[name]
            : function errorMethod(request,params,response) { return false; }
    }

    /**
     * Check if controller has the given method.
     * @param name string
     * @returns {boolean}
     */
    has(name)
    {
        return this.methods[name] ? true:false;
    }

    /**
     * Replace a parameter with a new value.
     * @param parameter string
     * @param callback function
     * @returns {ControllerFactory}
     */
    bind(parameter, callback)
    {
        this._bindings[parameter] = callback;
        return this;
    }

    /**
     * Apply the bindings to parameters to the request.
     * If a response is returned, the dispatcher will return it immediately.
     * @param request
     * @returns {Response|void}
     */
    applyBindings(request)
    {
        for(var param in request.params)
        {
            var callback = this._bindings[param];
            if (callback) {
                var newValue = callback(request.params[param],request);
                if (newValue instanceof Response) {
                    return newValue;
                }
                request.params[param] = newValue;
            }
        }
    }

    /**
     * Create a new controller instance.
     * @param name string
     * @param methods object
     * @returns {ControllerFactory}
     */
    static create(name, methods)
    {
        return _controllers[name] = new ControllerFactory(methods);
    }

    /**
     * Return a controller by name.
     * @param name string
     * @returns {*}
     */
    static find(name)
    {
        return _controllers[name] || null;
    }

    /**
     * Dispatch a controller.
     * @param name string
     * @param method string
     * @returns {Function}
     */
    static dispatch(name, method)
    {
        var controller = ControllerFactory.find(name);
        var action   = controller.use(method);

        /**
         * Callback served to router.
         */
        return function(request,response,next)
        {
            response.on('finish', function() {
                log.response(request,response);
            });

            // Recursive function to call if the value returned
            // from the controller is a Promise object.
            function process(value)
            {
                // Allows controller to send it's own response.
                if (response.headersSent || typeof value==="undefined") {
                    return;
                }

                if (value===false || ! value) {
                    return new Response(View.create('error/404'),request).send(response);
                }

                if (value.constructor.name == "Promise") {
                    return value.then(function(_value) {
                        return process(_value);
                    })
                }

                if (value instanceof Response) {
                    return value.setRequest(request).send(response);
                }

                return new Response(value,request).send(response);
            }

            // Do the deed. If after applying the parameter bindings a response comes back,
            // Quit the execution and send the response.
            var holdupResponse = controller.applyBindings(request);

            if (! holdupResponse) {
                return process( action(request,request.params,response) );
            }

            return holdupResponse.send(response);
        }
    }
}

module.exports = ControllerFactory;