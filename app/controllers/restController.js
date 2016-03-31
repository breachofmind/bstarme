const app           = require('../app');
const Paginator     = require('../support/paginator');
const Response      = require('../response');
const Model         = app.Model;

/**
 * This controller handles the CRUD operations with mongo.
 * It is also used by Backbone.js on the frontend.
 * Insta-crud!
 */
app.Controller.create('restController', {

    construct: function(controller)
    {
        /**
         * Match the model parameter with a model object.
         * If none, return a response right away.
         */
        controller.bind('model', function(value,request)
        {
            var object = Model.get(value.toLowerCase());

            if (! object) {
                return new Response({error:`Model "${value}" does not exist.`},request).status(404,'Not Found').json();
            }
            if (object.expose === false && !request.user) {
                return new Response({error:`You must be logged in to view this object.`},request).status(401,'Unauthorized').json();
            }

            request.params.Model = object.model;
            return object;
        });

        /**
         * Match the id parameter with a model ID.
         * Returns a promise to get things going.
         */
        controller.bind('id', function(value,request)
        {
            var Model = request.params.Model;

            if (Model && value) {
                request.params.Object = Model.findOne({_id: value}).exec();
                return value;
            }
            return null;
        });
    },

    /**
     * Fetches an object by ID.
     *
     * GET /api/{model}/{id}
     *
     * @param request
     * @param params
     * @returns {*|Promise|Object|Promise.<T>}
     */
    fetchOne: function(request,params)
    {
        return params.Object.then(function(data) {

            return new Response(data,request).json();

        }, function(err) {

            return new Response(err,request).status(400,"Bad Request").json();

        })
    },

    /**
     * Fetches an array of objects, with pagination.
     *
     * GET /api/{model}
     *
     * @param request
     * @param params
     * @returns {Promise.<T>}
     */
    fetchAll: function(request,params)
    {
        return Paginator.make(request).execute();
    },


    /**
     * Update a model.
     *
     * PUT /api/{model}/{id}
     *
     * @param request
     * @param params
     * @returns {*}
     */
    update: function(request,params)
    {
        if (request.body._id) delete request.body._id; // Mongoose has problems with this.

        if (! request.user) {

            return new Response(null, request).status(401,'Unauthorized').json();
        }

        request.body.modified_at = Date.now();

        return params.Model
            .findByIdAndUpdate(params.id, request.body, {new:true})
            .populate(params.model.population)
            .exec()
            .then(function(data) {

            return new Response(data,request).json();

        }, function(err){

            return new Response(err,request).status(400,'Bad Request').json();
        });
    },

    /**
     * Create a new model.
     *
     * POST /api/{model}
     *
     * @param request
     * @param params
     * @returns {Promise.<T>}
     */
    create: function(request,params)
    {
        if (! request.user) {

            return new Response({}, request).status(401,'Unauthorized').json();
        }

        var model = new params.Model (request.body);

        return model.save().then(function(object)
        {
            return new Response(object,request).json();

        }, function(err) {

            return new Response(err,request).status(400,'Bad Request').json();

        });
    },


    /**
     * Deletes an object by ID.
     *
     * DELETE /api/{model}/{id}
     *
     * @param request
     * @param params
     * @returns {*|Promise|Object|Promise.<T>}
     */
    trash: function(request,params)
    {
        if (! request.user) {

            return new Response({}, request).status(401,'Unauthorized').json();

        }

        return params.Model.remove({_id:params.id}).then(function(results) {
            var data = {
                results: results,
                objectId : params.id
            };
            return new Response(data,request).json();

        }, function(err) {

            return new Response(err,request).status(400,'Bad Request').json();

        });
    }



});