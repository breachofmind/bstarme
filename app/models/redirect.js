var Model = require('../model');

var Redirect = Model.create('Redirect', {
    active:           { type: Boolean, default:true },
    slug:             { type: String, required:true },
    destination:      { type: String, required:true },
    author:           { type: Model.type('ObjectId'), ref:"User" },
    created_at:       { type: Date, default: Date.now },
    modified_at:      { type: Date, default: Date.now }

}).range('modified_at',-1)
    .populate('author').done();

Redirect.limited = false;