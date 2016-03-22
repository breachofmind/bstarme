"use strict";

const app       = require('../app');
const Model     = require('../model');
const Response  = require('../response');

/**
 * Super handy paginator class.
 * Helps with the REST response for fetching models with query params.
 */
class Paginator
{
    /**
     * Construct the object with a new request.
     * @param request
     */
    constructor(request)
    {
        this.request = request;
        this.params  = request.params;
        this.query   = request.query;
        this.model   = request.params.model;
        this.limit   = app.config('limit');
        this.total   = 0;

        this.paginate = this.query.p
            ? new Buffer(this.query.p,'base64').toString('utf-8')
            : false;

        this.filter = parseFilter( this.query.filter );
        this.sort = parseSort( this.query.sort );
    }

    /**
     * Execute the request and return a response.
     * @returns {Promise.<T>}
     */
    execute()
    {
        let self = this;

        return this.params.Model.count(this.queryFind()).exec().then(function(count) {

            self.total = count;

            return self.responseHandler (
            self.params.Model
                .find ( self.queryFind() )
                .sort ( self.querySort() )
                .limit( self.limit )
                .populate( self.model.population )
                .exec ()
            );

        }, function(err) {

            return new Response(err,self.request).status(400,"Bad Request").json();
        })
    }

    /**
     * Handles the response after the count is received.
     * @param promise
     * @returns {Promise}
     */
    responseHandler(promise)
    {
        let self = this;

        return promise.then(function(data) {

            self.setPaginationData(data);

            return new Response(data,self.request).json();

        }, function(err) {

            return new Response(err,self.request).status(400,"Bad Request").json();
        })
    }

    /**
     * Sets up the pagination data inside the request after the data comes back.
     * @param data object|array
     * @returns void
     */
    setPaginationData(data)
    {
        if (data.length) {
            var lastValue = data[data.length-1][this.model.key];
        }

        // The Response object takes care of this.
        this.request.pagination = {
            count:      data.length,
            limit:      this.limit,
            total:      this.total,
            filter:     this.filter,
            sort:       this.querySort(),
            url:        this.total > this.limit
                        ? new Buffer(lastValue.toString()).toString('base64')
                        : null
        }
    }

    /**
     * Builds the find query.
     * @returns {{}}
     */
    queryFind()
    {
        var q = {};
        for(let prop in this.filter) {
            q[prop] = this.filter[prop];
        }

        if (! this.paginate) {
            return q;
        }
        q[this.model.key] = this.model.sort == 1
            ? {$gt:this.paginate}
            : {$lt:this.paginate};

        return q;
    }

    /**
     * Builds the sort query.
     * @returns {{}}
     */
    querySort()
    {
        var q = {};
        if (this.sort) {
            return this.sort;
        }
        q[this.model.key] = this.model.sort;
        return q;
    }

    /**
     * Named constructor.
     * @param request
     * @returns {Paginator}
     */
    static make(request)
    {
        return new Paginator(request);
    }
}

/**
 * Parser for the filter query.
 * @example ?filter=posts.mentions:mommy|posts.type:conversation
 * @param string
 * @returns {*}
 */
function parseFilter(string)
{
    if (! string || string == "") return null;
    var filter = {};

    var ands = string.split("|");

    ands.forEach(function(pairs) {
        var keyval = pairs.split(":");
        var key = keyval.shift();
        filter[key] = keyval.join(":");
    });

    return filter;
}

function parseSort(string)
{
    if (! string || string == "") return {};
    var sort = {};
    var parts = string.split(":");
    sort[parts[0]] = parts.length>1 ? parseInt(parts[1]) : 1;
    return sort;
}

module.exports = Paginator;