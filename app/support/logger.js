"use strict";

const chalk = require('chalk');

class Logger
{
    constructor(db)
    {
        this.db = db;
        this.messages = [];
    }

    /**
     * Log a message.
     * @param msg
     * @returns void
     */
    message(msg)
    {
        if (this.messages.length > 500) {
            this.messages.shift();
        }
        this.messages.push({
            date: Date.now(),
            message: msg
        });
        console.log(msg);
    }

    /**
     * Log a response.
     * @param req request
     * @param res response
     * @returns void
     */
    response(req,res)
    {
        this.message([
            statusColor(res.statusCode),
            req.method,
            chalk.blue(`"${req.path}"`),
            res.statusMessage
        ].join(" "));
    }
}


function statusColor(code)
{
    var c = "green";

    if (code >=300 && code < 400) {
        c = "orange";
    }
    if (code >=400 && code < 600) {
        c = "red";
    }
    return chalk[c] (code.toString());
}


module.exports = Logger;