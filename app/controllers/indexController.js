const app = require('../app');

app.Controller.create('indexController', {

    index: function(request,params)
    {
        return app.View.create('index').set('title', "Index Page");
    }
});