var Model = require('../model');

var Visitor = Model.create('Visitor', {
    session:          String,
    redirect:         { type: Model.type('ObjectId'), ref:"Redirect" },
    created_at:       { type: Date, default: Date.now },

}).range('created_at',-1)
    .populate('redirect').done();

Visitor.expose = false;
