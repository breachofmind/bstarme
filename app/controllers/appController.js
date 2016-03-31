const app = require('../app');
const Model = app.Model;
const View = app.View;


app.Controller.create('appController', {

    construct: function(controller)
    {
        // User must be authenticated to access methods in this controller.
        controller.middleware(function(request,response)
        {
            if (! request.user) {
                response.redirect("/");
            }
        });
    },

    index: function(request,params)
    {
        return View.create('index');
    }
});