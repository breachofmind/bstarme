const app = require('../app');

app.Controller.create('authController', {

    login: function(request,params)
    {
        return app.View.create('login').set('title',"Login");
    },

    logout: function(request,params,response)
    {
        request.logout();
        response.redirect('/login');
    }
});