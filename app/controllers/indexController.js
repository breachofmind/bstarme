const app = require('../app');
const Model = app.Model;
const View = app.View;

var Visitor = Model.get('visitor').model;

app.Controller.create('indexController', {

    construct: function(controller)
    {
        controller.bind('slug', function(value,request)
        {
            var RedirectModel = Model.get('redirect').model;

            request.params.object = RedirectModel.findOne({slug: value.toLowerCase()}).exec();
        });
    },

    /**
     * Handle the redirection.
     * @param request
     * @param params
     * @param response
     * @returns {*}
     */
    redirect: function(request,params,response)
    {
        return params.object.then(function(data)
        {
            // Slug doesn't exist in the database.
            if (! data || data.active === false) {
                return false;
            }

            // Collect visitor data
            Visitor.create({
                session: request.sessionID,
                redirect: data._id
            });

            // Send them on their merry way.
            response.redirect(307,data.destination);
        });
    }
});