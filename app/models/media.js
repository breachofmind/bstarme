var Model = require('../model');

Model.create('Media', {
    file_name:      { type: String, required:true},
    file_type:      { type: String, required:true },
    title:          String,
    meta:           Model.type('Mixed'),
    occurred_at:    { type: Date, default: Date.now },
    created_at:     { type: Date, default: Date.now },
    modified_at:    { type: Date, default: Date.now }

}).done();