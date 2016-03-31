"use strict";

const db = require('mongoose');
const config = require('../config/app');

class DB
{
    /**
     * Build the auth object.
     * @constructor
     */
    constructor()
    {
        db.connect(config.db, {}, function(error) {
            if (error) {
                console.log('Error connecting to database "%s". Is it running?', config.db);
                process.exit(1);
            }
        });

        this.connection = db;
    }

}

module.exports = new DB;