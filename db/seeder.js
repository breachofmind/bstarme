"use strict";

const Seeder = require('../app/support/seeder');
const app = require('../app/app');


var seeder = new Seeder('installation');

seeder.add('media','media.csv');
seeder.add('user','users.csv', function(row,i)
{
    row.created_at = new Date();
    var salt = row.created_at.getTime().toString();
    row.password = app.encrypt(row.password,salt);

    return row;
});


seeder.on('done', function(seeds) {

    seeder.createModels();
});


seeder.seed();