const app = require('../app');
const View = app.View;

app.Controller.create('authController', {

    login: function(request,params,response)
    {
        // Redirect the user to the app if logged in.
        if (request.user) {
            response.redirect('/app');
            return;
        }
        return View.create('login').set('title',"Login");
    },

    logout: function(request,params,response)
    {
        request.logout();
        response.redirect('/');
    }
});